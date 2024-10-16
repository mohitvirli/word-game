'use client'

import { Button } from '@/components/ui/button';
import { Player } from '../types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface PlayerListProps {
  players: Player[];
  currentPlayerIndex: number;
  turnTime: number;
  timeLeft: number;
  isActivePlayer: boolean
  onPass: () => void;
}

export default function PlayersList({ players, currentPlayerIndex, turnTime, timeLeft, onPass, isActivePlayer }: PlayerListProps) {
  return (
    <div className="flex flex-col sm:min-h-screen sm:p-4 text-white">
      <div className="flex-grow">
        <h2 className="text-xl font-semibold mb-4">Players</h2>
        <ul className="space-y-2 flex-grow">
          {players.map((player, index) => (
            <li key={index} className={`flex justify-between p-2 rounded-lg items-center ${index === currentPlayerIndex ? 'bg-primary text-primary-foreground' : ''}`}>
              <div className="flex items-center space-x-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={player.avatarUrl} alt={player.name} />
                <AvatarFallback>{player.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="font-bold">{player.name}</span>
            </div>
            <span className="text-xl font-mono">{player.score}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        {turnTime > 0 && (
          <div className="text-center my-2">
            Time left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
        )}
        <Button onClick={onPass} className="w-full mt-2" disabled={!isActivePlayer}>Pass</Button>
      </div>
    </div>
  )
}