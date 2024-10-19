'use client'

import { addWord, getRoom } from '@/app/services/room.service'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Toaster } from '@/components/ui/toaster'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/utils/supabase/supabase'
import { Loader2, Menu } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { addPlayerToRoom } from '../../services/player.service'
import { validateWord } from '../../services/word.service'
import { Player, Room } from '../../types'
import PlayersList from '../PlayerList'
import { BlockContent } from './block'


export default function Game() {
  const { roomId } = useParams();
  const searchParams = useSearchParams();
  const [room, setRoom] = useState<Room | null>(null)
  const [currentWord, setCurrentWord] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const [activeLetter, setActiveLetter] = useState('');
  const [lastUsedWord, setLastUsedWord] = useState('');
  const [user, setUser] = useState<Player>();
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const router = useRouter()
  const currentRoomChannel = supabase.channel(roomId as string, {
    config: {
      broadcast: { self: true },
    },
  });

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const data = await getRoom(roomId as string);

        setRoom(data)
        if (data.turnTime > 0) {
          setTimeLeft(data.turnTime)
        }

        const playerName = searchParams.get('playerName');
        if (playerName) {
          const { newPlayer, room: newRoom } = await addPlayerToRoom(playerName, data);
          setUser(newPlayer);
          currentRoomChannel.send({
            type: 'broadcast',
            event: 'playerListUpdated',
            payload: { room: newRoom },
          });
        }
      } catch (error) {
        console.error('Error fetching room:', error)
        toast({
          title: "Error",
          description: "Failed to fetch room data. Please try again.",
          variant: "destructive",
        })
        router.push('/');
      }
    }

    fetchRoom();
    return () => {
      currentRoomChannel.unsubscribe();
    }
  }, []);

  useEffect(() => {
    inputRef.current?.focus()
  }, [currentPlayerIndex])

  useEffect(() => {
    setActiveLetter(room?.activeLetter ?? '');
  }, [room?.activeLetter]);

  useEffect(() => {
    if (room?.turnTime && room.turnTime > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current!)
            handlePass()
            return room.turnTime
          }
          return prevTime - 1
        })
      }, 1000)

      return () => {
        if (timerRef.current) clearInterval(timerRef.current)
      }
    }
  }, [currentPlayerIndex, room?.turnTime])

  const attachChannelListeners = async () => {
    currentRoomChannel.on('broadcast', { event: 'addWord' }, ({ payload }) => {
      const { players, word: { word, meaning }} = payload;
      const words = room?.words ?? {};
      const firstLetter = word[0].toUpperCase()

      if (!words[firstLetter]) {
        words[firstLetter] = []
      }
      words[firstLetter].push({ word, meaning })
      setLastUsedWord(word);
      setActiveLetter(word[word.length - 1].toUpperCase());
      toast({
        title: "Valid word!",
        description: meaning,
      })
      setRoom({...(room as Room), players, words });
    });

    currentRoomChannel.on('broadcast', { event: 'nextTurn' }, ({ payload }) => {
      setCurrentPlayerIndex(payload.currentPlayerIndex);
      setTimeLeft(room?.turnTime ?? timeLeft)
    });

    currentRoomChannel.on('broadcast', { event: 'turnPass' }, ({ payload }) => {
      toast({
        title: "Turn passed",
        description: `${room?.players[currentPlayerIndex].name} passed their turn.`,
      })
      setCurrentPlayerIndex(payload.currentPlayerIndex);
    })

    currentRoomChannel.on('broadcast', { event: 'playerListUpdated' }, ({ payload }) => {
      setRoom({ ...payload.room });
    })
    currentRoomChannel.subscribe();
  }

  attachChannelListeners();

  const handleSubmitWord = async () => {
    if (!room) return

    if (currentWord.length !== room.wordLength) {
      toast({
        title: "Invalid word length",
        description: `Word must be exactly ${room.wordLength} characters long.`,
        variant: "destructive",
      })
      return
    }

    if (activeLetter && currentWord[0].toUpperCase() !== activeLetter) {
      toast({
        title: "Invalid starting letter",
        description: `Word must start with the letter ${activeLetter}.`,
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    const result = await validateWord(currentWord)
    setIsLoading(false)

    if (result.valid) {
      const isWordAlreadyUsed = Object.values(room.words).flat().some(w => w.word === currentWord)

      if (isWordAlreadyUsed) {
        toast({
          title: "Word already used",
          description: "This word has already been played.",
          variant: "destructive",
        })
        return
      }

      try {
        const word = { word: currentWord, meaning: result.meaning };
        const players = room.players;
        players[currentPlayerIndex].score++;

        currentRoomChannel.send({
          type: 'broadcast',
          event: 'addWord',
          payload: { word, players },
        });

        await addWord({ word, players, room });
        setCurrentWord('')
        handleNextTurn()
      } catch (error) {
        console.error('Error updating game state:', error)
        toast({
          title: "Error",
          description: "Failed to update game state. Please try again.",
          variant: "destructive",
        })
      }
    } else {
      toast({
        title: "Invalid word",
        description: "This word is not in the dictionary.",
        variant: "destructive",
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmitWord()
    }
  }
  const handleNextTurn = async () => {
    currentRoomChannel.send({
      type: 'broadcast',
      event: 'nextTurn',
      payload: { currentPlayerIndex: (currentPlayerIndex + 1) % (room as Room).players.length },
    });

    if (room?.turnTime && room.turnTime > 0) {
      setTimeLeft(room.turnTime)
    }
  }

  const handlePass = () => {
    currentRoomChannel.send({
      type: 'broadcast',
      event: 'turnPass',
      payload: { currentPlayerIndex: (currentPlayerIndex + 1) % (room as Room).players.length },
    });
  }

  if (!room) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  const currentPlayer = room.players[currentPlayerIndex]
  const isActivePlayer = user && currentPlayer ? (user.id === currentPlayer.id) : true;

  return (
    <div className="min-h-svh bg-gray-900 text-white flex">
      <div className="flex flex-grow flex-col">
        <div className="flex items-center justify-between p-4 bg-gray-800 sm:bg-transparent">
          <Link href="/" className="text-2xl sm:text-3xl font-bold hover:underline font-mono">
            the.word.game
          </Link>
          <Badge variant="outline" className='text-white'>CODE: {roomId}</Badge>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="sm:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-gray-800">
              <PlayersList
                players={room.players}
                currentPlayerIndex={currentPlayerIndex}
                isActivePlayer={isActivePlayer}
                turnTime={room.turnTime}
                timeLeft={timeLeft}
                onPass={handlePass}
              />
            </SheetContent>
          </Sheet>
        </div>
        <div className="flex-grow p-4 sm:p-6 overflow-auto flex flex-col">
          <div className="mb-4 p-4 sm:hidden bg-gray-800 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={currentPlayer?.avatarUrl} alt={currentPlayer?.name} />
                <AvatarFallback>{currentPlayer?.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-semibold">{currentPlayer?.name}&rsquo;s turn</p>
                <p className="text-sm text-gray-400">
                  Start with: {activeLetter ? activeLetter : 'Any letter'}
                </p>
                {room.turnTime > 0 && (
                  <p className="text-sm text-gray-400">
                    Time left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </p>
                )}
              </div>
            </div>

            <Button onClick={handlePass} className="sm:hidden">Pass</Button>
          </div>
          <div className="flex-grow mb-4 p-1 overflow-auto">
            <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
              {Object.entries(room.words)
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([letter, words]) => (
<<<<<<< HEAD
                  <BlockContent letter={letter} words={words} activeLetter={activeLetter} lastUsedWord={lastUsedWord} />
=======
                  <BlockContent key={letter} letter={letter} words={words} activeLetter={activeLetter} lastUsedWord={lastUsedWord} />
>>>>>>> b445095 (Change block layout)
              ))}
            </div>
          </div>
        </div>
        <div className="fixed sm:static bottom-0 left-0 right-0 bg-gray-800 sm:bg-transparent p-4 ">
          <div className="flex w-full space-x-2 max-w-3xl mx-auto">
            <Input
              ref={inputRef}
              value={currentWord}
              onChange={(e) => setCurrentWord(e.target.value.toLowerCase())}
              onKeyPress={handleKeyPress}
              maxLength={room.wordLength}
              className="w-full pr-16 sm:pr-4"
              placeholder={`Enter a ${room.wordLength}-letter word${activeLetter ? ` with ${activeLetter}` : ''}`}
              disabled={isLoading || !isActivePlayer}
            />
            <Button
              onClick={handleSubmitWord}
              disabled={isLoading || !isActivePlayer}
              variant="secondary"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit'}
            </Button>
          </div>
        </div>
        <Toaster />
      </div>
      <div className="hidden sm:block w-64 bg-gray-800 overflow-auto">
        <PlayersList
          players={room.players}
          currentPlayerIndex={currentPlayerIndex}
          isActivePlayer={isActivePlayer}
          turnTime={room.turnTime}
          timeLeft={timeLeft}
          onPass={handlePass}
        />
      </div>
    </div>
  )
}
