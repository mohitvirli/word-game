'use client'

import { Button } from '@/components/ui/button';
import { Player } from '../types';

interface PlayerListProps {
  players: Player[];
  currentPlayerIndex: number;
  turnTime: number;
  timeLeft: number;
  onPass: () => void;
}

export default function PlayersList({ players, currentPlayerIndex, turnTime, timeLeft, onPass }: PlayerListProps) {
  return (
    <div className="flex flex-col sm:min-h-screen sm:p-4 text-white">
      <div className="flex-grow">
        <h2 className="text-xl font-semibold mb-4">Players</h2>
        <ul className="space-y-2 flex-grow">
          {players.map((player, index) => (
            <li key={index} className={`flex justify-between p-2 rounded ${index === currentPlayerIndex ? 'bg-primary text-primary-foreground' : ''}`}>
              <span>{player.name}</span>
              <span>{player.score}</span>
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
        <Button onClick={onPass} className="w-full mt-2">Pass</Button>
      </div>
    </div>
  )
}