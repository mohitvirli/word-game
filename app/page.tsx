'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { addNewPlayer, deletePlayer, fetchPlayers } from './services/player.service'
import { Player } from './types'

export default function StartGame() {
  const [players, setPlayers] = useState<Player[]>([])
  const [playerName, setPlayerName] = useState('')
  const [wordLength, setWordLength] = useState(4)
  const [useTurnTime, setUseTurnTime] = useState(false)
  const [turnTime, setTurnTime] = useState(120)
  const router = useRouter()

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

  const startGame = () => {
    router.push(`/game?players=${JSON.stringify(players.map(p => p.name))}&wordLength=${wordLength}&turnTime=${useTurnTime ? turnTime : 0}`)
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
                    <Button onClick={addPlayer} className="ml-2">Add</Button>
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
                <Button className="w-full mt-4" variant="secondary" onClick={startGame} disabled={players.length === 0}>
                  Start Game
                </Button>
              </CardContent>
            </Card>
          </div>
          <div className="w-full sm:w-64 space-y-6">
            <Card className="bg-gray-800 border-gray-700">
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
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-200">
                  <li>Enter words of the chosen length</li>
                  <li>Start with the last letter of the previous word</li>
                  <li>No repeating words</li>
                  <li>1 point per valid word</li>
                  <li>Game ends when no valid words remain or all pass</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}