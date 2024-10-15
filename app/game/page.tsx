'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Loader2 } from 'lucide-react'

const API_BASE_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en/'

async function validateWord(word: string): Promise<{ valid: boolean; meaning?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}${word}`)
    if (!response.ok) {
      return { valid: false }
    }
    const data = await response.json()
    const meaning = data[0]?.meanings[0]?.definitions[0]?.definition || 'No definition available.'
    return { valid: true, meaning }
  } catch (error) {
    console.error('Error validating word:', error)
    return { valid: false }
  }
}

export default function Game() {
  const searchParams = useSearchParams()
  const [players, setPlayers] = useState<{ name: string; score: number }[]>([])
  const [wordLength, setWordLength] = useState(5)
  const [turnTime, setTurnTime] = useState(0)
  const [currentWord, setCurrentWord] = useState('')
  const [words, setWords] = useState<{ [key: string]: { word: string; meaning: string; isNew?: boolean }[] }>({})
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [activeLetter, setActiveLetter] = useState('')
  const [usedLetters, setUsedLetters] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [newBlock, setNewBlock] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const playersParam = searchParams.get('players')
    const wordLengthParam = searchParams.get('wordLength')
    const turnTimeParam = searchParams.get('turnTime')
    if (playersParam && wordLengthParam && turnTimeParam) {
      setPlayers(JSON.parse(playersParam).map((name: string) => ({ name, score: 0 })))
      setWordLength(parseInt(wordLengthParam))
      const parsedTurnTime = parseInt(turnTimeParam)
      setTurnTime(parsedTurnTime)
      if (parsedTurnTime > 0) {
        setTimeLeft(parsedTurnTime)
      }
    }
  }, [searchParams])

  useEffect(() => {
    inputRef.current?.focus()
  }, [currentPlayerIndex])

  useEffect(() => {
    if (newBlock) {
      const timer = setTimeout(() => setNewBlock(null), 2500)
      return () => clearTimeout(timer)
    }
  }, [newBlock])

  useEffect(() => {
    if (turnTime > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current!)
            nextTurn()
            return turnTime
          }
          return prevTime - 1
        })
      }, 1000)

      return () => {
        if (timerRef.current) clearInterval(timerRef.current)
      }
    }
  }, [currentPlayerIndex, turnTime])

  const handleSubmitWord = async () => {
    if (currentWord.length !== wordLength) {
      toast({
        title: "Invalid word length",
        description: `Word must be exactly ${wordLength} characters long.`,
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
      const firstLetter = currentWord[0].toUpperCase()
      const lastLetter = currentWord[currentWord.length - 1].toUpperCase()
      const isWordAlreadyUsed = Object.values(words).flat().some(w => w.word === currentWord)

      if (isWordAlreadyUsed) {
        toast({
          title: "Word already used",
          description: "This word has already been played.",
          variant: "destructive",
        })
        return
      }

      setWords(prev => {
        const updatedWords = { ...prev }
        if (!updatedWords[firstLetter]) {
          updatedWords[firstLetter] = []
          setNewBlock(firstLetter)
        }

        Object.keys(updatedWords).forEach(key => {
          updatedWords[key] = updatedWords[key].map(w => ({ ...w, isNew: false }))
        })

        updatedWords[firstLetter] = [
          ...updatedWords[firstLetter],
          { word: currentWord, meaning: result.meaning || '', isNew: true }
        ].sort((a, b) => a.word.localeCompare(b.word))
        return updatedWords
      })

      setPlayers(prev => prev.map((player, index) =>
        index === currentPlayerIndex ? { ...player, score: player.score + 1 } : player
      ))
      toast({
        title: "Valid word!",
        description: result.meaning,
      })
      setActiveLetter(lastLetter)
      setCurrentWord('')
      if (!usedLetters.includes(firstLetter)) {
        setUsedLetters(prev => [...prev, firstLetter].sort())
      }
      if (!usedLetters.includes(lastLetter) && firstLetter !== lastLetter) {
        setUsedLetters(prev => [...prev, lastLetter].sort())
      }
      nextTurn()
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

  const nextTurn = () => {
    setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length)
    if (turnTime > 0) {
      setTimeLeft(turnTime)
    }
  }

  const handlePass = () => {
    toast({
      title: "Turn passed",
      description: `${players[currentPlayerIndex].name} passed their turn.`,
    })
    nextTurn()
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      <div className="flex-grow p-6 overflow-auto flex flex-col">
        <Link href="/" className="text-3xl font-bold mb-6 hover:underline">
          Word Game
        </Link>
        <div className="flex-grow mb-4 overflow-auto">
          <div className="flex flex-wrap gap-4 p-1">
            {usedLetters.map((letter) => (
              <div
                key={letter}
                className={`bg-gray-800 p-4 rounded-lg ${letter === activeLetter ? 'ring-2 ring-secondary' : ''}
                h-auto max-h-[200px] w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.667rem)] md:w-[calc(25%-0.75rem)] lg:w-[calc(20%-0.8rem)]
                flex flex-col`}
              >
                <h2 className="text-xl font-semibold mb-2">{letter}</h2>
                <div className="flex-grow overflow-auto">
                  <ul className="space-y-1">
                    {words[letter]?.map(({ word, meaning, isNew }, index) => (
                      <li key={index} className={`break-inside-avoid-column ${isNew ? 'text-yellow-400 font-bold' : ''}`}>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className="text-left">{word}</TooltipTrigger>
                            <TooltipContent>
                              <p>{meaning}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex w-full">
          <Input
            ref={inputRef}
            value={currentWord}
            onChange={(e) => setCurrentWord(e.target.value.toLowerCase())}
            onKeyPress={handleKeyPress}
            maxLength={wordLength}
            className="flex-grow mr-2"
            placeholder={`Enter a ${wordLength}-letter word${activeLetter ? ` starting with ${activeLetter}` : ''}`}
            disabled={isLoading}
          />
          <Button onClick={handleSubmitWord} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Submit
          </Button>
        </div>
      </div>
      <div className="w-64 bg-gray-800 p-4 overflow-auto flex flex-col">
        <h2 className="text-xl font-semibold mb-4">Players</h2>
        <ul className="space-y-2 flex-grow">
          {players.map((player, index) => (
            <li key={index} className={`flex justify-between p-2 rounded ${index === currentPlayerIndex ? 'bg-primary text-primary-foreground' : ''}`}>
              <span>{player.name}</span>
              <span>{player.score}</span>
            </li>
          ))}
        </ul>
        {turnTime > 0 && (
          <div className="text-center mb-2">
            Time left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
        )}
        <Button onClick={handlePass} className="w-full" disabled={isLoading}>Pass</Button>
      </div>
      <Toaster />
    </div>
  )
}