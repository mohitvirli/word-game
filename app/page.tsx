
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function StartGame() {
  const [players, setPlayers] = useState<string[]>([])
  const [playerName, setPlayerName] = useState('')
  const [wordLength, setWordLength] = useState(4) // Default to 4
  const [turnTime, setTurnTime] = useState(120) // 2 minutes in seconds
  const router = useRouter()

  const addPlayer = () => {
    if (playerName && !players.includes(playerName)) {
      setPlayers([...players, playerName])
      setPlayerName('')
    }
  }

  const removePlayer = (name: string) => {
    setPlayers(players.filter(player => player !== name))
  }

  const startGame = () => {
    router.push(`/game?players=${JSON.stringify(players)}&wordLength=${wordLength}&turnTime=${turnTime}`)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      <div className="flex-grow p-6 overflow-auto flex flex-col">
        <h1 className="text-3xl font-bold mb-6">Word Game Setup</h1>
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md">
          <div className="space-y-4">
            <div>
              <Label htmlFor="playerName">Player Name</Label>
              <div className="flex mt-1">
                <Input
                  id="playerName"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addPlayer()}
                  className="flex-grow"
                  placeholder="Enter player name"
                />
                <Button onClick={addPlayer} className="ml-2">Add</Button>
              </div>
            </div>
            <div>
              <Label>Word Length</Label>
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
            <div>
              <Label htmlFor="turnTime">Turn Time (seconds)</Label>
              <Input
                id="turnTime"
                type="number"
                value={turnTime}
                onChange={(e) => setTurnTime(parseInt(e.target.value))}
                min={10}
                className="mt-1"
              />
            </div>
            <Button className="w-full mt-4" onClick={startGame} disabled={players.length === 0}>
              Start Game
            </Button>
          </div>
        </div>
      </div>
      <div className="w-64 bg-gray-800 p-4 overflow-auto">
        <h2 className="text-xl font-semibold mb-4">Players</h2>
        {players.length === 0 ? (
          <p className="text-gray-400">No players added yet</p>
        ) : (
          <ul className="space-y-2">
            {players.map((player, index) => (
              <li key={index} className="flex items-center justify-between bg-gray-700 p-2 rounded">
                <span>{player}</span>
                <Button variant="ghost" size="icon" onClick={() => removePlayer(player)}>
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}