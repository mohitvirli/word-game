'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Toaster } from '@/components/ui/toaster'
import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { addNewPlayer, deletePlayer, fetchPlayers } from './services/player.service'
import { createNewRoom } from './services/room.service'
import { Player } from './types'

export default function StartGame() {
  const [players, setPlayers] = useState<Player[]>([])
  const [playerName, setPlayerName] = useState('')
  const [wordLength, setWordLength] = useState(4)
  const [useTurnTime, setUseTurnTime] = useState(false)
  const [turnTime, setTurnTime] = useState(120)
  const [roomId, setRoomId] = useState('');
  const [type, setType] = useState('local');
  const router = useRouter()

  const createRoom = async () => {
    const { roomId } = await createNewRoom({
      action: 'create',
      players,
      wordLength,
      turnTime: useTurnTime ? turnTime : 0
    })
    if (type === 'multiplayer') {
      router.push(`/game/${roomId}?playerName=${playerName}`);
    } else {
      router.push(`/game/${roomId}`);
    }
  }

  const joinGame = async () => {
    router.push(`/game/${roomId}?playerName=${playerName}`);
  }

  // TODO:
  useEffect(() => {
    fetchAllPlayers()
  }, [])

  const fetchAllPlayers = async () => setPlayers(await fetchPlayers())

  const addPlayer = async () => {
    setPlayers([...players, await addNewPlayer(playerName)])
    setPlayerName('')
  }

  const removePlayer = async (id: string) => {
    if (await deletePlayer(id)) setPlayers(players.filter(player => player.id !== id));
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex p-4 sm:p-6">
      <div className="flex-grow flex flex-col space-y-6 max-w-3xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-white font-mono">the.word.game</h1>
        <div className="flex flex-col sm:flex-row space-y-6 sm:space-y-0 sm:space-x-6">
          <div className="flex-1">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Game Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-200">Type</Label>
                  <div className="flex mt-1 space-x-2">
                    <Button
                      onClick={() => setType('local')}
                      className={`flex-grow ${type === 'local' ? 'ring-1 ring-white' : ''}`}
                    >
                      Local
                    </Button>
                    <Button
                      onClick={() => setType('multiplayer')}
                      className={`flex-grow ${type === 'multiplayer' ? 'ring-1 ring-white' : ''}`}
                    >
                      Multiplayer
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="playerName" className="text-gray-200">Player Name</Label>
                  <div className="flex mt-1">
                    <Input
                      id="playerName"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addPlayer()}
                      className="flex-grow text-white"
                      placeholder="Enter player name"
                    />
                    { type === 'local' && <Button onClick={addPlayer} className="ml-2">Add</Button> }
                  </div>
                </div>
                <div>
                  <Label className="text-gray-200">Room ID</Label>
                  <div className="flex mt-1 space-x-2">
                    { type === 'multiplayer' && <Input
                      id="roomId"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && createRoom()}
                      className="flex-grow text-white"
                      placeholder="Enter room ID"
                    /> }
                  </div>
                </div>
                <div>
                  <Label className="text-gray-200">Word Length</Label>
                  <div className="flex mt-1 space-x-2">
                    {[3, 4, 5].map(length => (
                      <Button
                        key={length}
                        onClick={() => setWordLength(length)}
                        className={`flex-grow ${wordLength === length ? 'ring-1 ring-white' : ''}`}
                      >
                        {length} Letter
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="useTurnTime" className="flex items-center space-x-2 text-gray-200">
                    <span>Use Turn Time</span>
                    <Switch
                      id="useTurnTime"
                      checked={useTurnTime}
                      onCheckedChange={setUseTurnTime}
                    />
                  </Label>
                </div>
                {useTurnTime && (
                  <div>
                    <Label htmlFor="turnTime" className="text-gray-200">Turn Time (seconds)</Label>
                    <Input
                      id="turnTime"
                      type="number"
                      value={turnTime}
                      onChange={(e) => setTurnTime(parseInt(e.target.value))}
                      min={10}
                      className="mt-1 bg-gray-700 text-white border-gray-600"
                    />
                  </div>
                )}
                <div className="flex space-x-2 mt-4">
                  {type === 'local' &&
                    <Button className="w-full" variant="secondary" onClick={createRoom} disabled={players.length === 0}>
                      Start Game
                    </Button>}
                  {type === 'multiplayer' &&
                    (<>
                      <Button className="w-full" variant="secondary" onClick={createRoom}>
                        Create Game
                      </Button>
                      <Button className="w-full" variant="secondary" onClick={joinGame} disabled={roomId.length === 0}>
                        Join Game
                      </Button>
                    </>)
                  }
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="w-full sm:w-64 space-y-6">
            { type === 'local' && (<Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Players</CardTitle>
              </CardHeader>
              <CardContent>
                {players.length === 0 ? (
                  <p className="text-gray-400">No players added yet</p>
                ) : (
                  <ul className="space-y-2">
                    {players.map((player) => (
                      <li key={player.id} className="flex items-center justify-between bg-gray-900 p-2 rounded-lg shadow-sm">
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={player.avatarUrl} alt={player.name} />
                          <AvatarFallback>{player.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="text-white font-bold">{player.name}</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removePlayer(player.id)} className="text-gray-300 hover:text-white hover:bg-gray-600">
                        <X className="h-4 w-4" />
                      </Button>
                    </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>)}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-200">
                  <li>Players take turns to enter words of the chosen length.</li>
                  <li>Each word must start with the last letter of the previous word.</li>
                  <li>Words cannot be repeated during the game.</li>
                  <li>Players score 1 point for each valid word.</li>
                  <li>If turn time is enabled, players must enter a word before the timer runs out.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  )
}