import { Player, Room } from "../types";

interface NewRoom {
  action: string;
  players: Player[];
  wordLength: number;
  turnTime: number;
}
interface AddNewWord {
  players: Player[];
  word: { word: string; meaning: string };
  room: Room;
}

export const createNewRoom = async (payload: NewRoom) => {
  const response = await fetch(`/api/rooms`, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  })
  if (!response.ok) throw new Error('Error occured')
  const data = await response.json()
  return data;
}

export const getRoom = async (roomId: string) => {
  const response = await fetch(`/api/rooms?roomId=${roomId}`)
  if (!response.ok) throw new Error('Failed to fetch room data')

  const data = await response.json()
  return data;
}


export const addWord = async ({ players, word: {word, meaning}, room }: AddNewWord) => {
  const response = await fetch('/api/rooms', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'addWord',
      word,
      meaning,
      room,
      players,
    })
  })
  if (!response.ok) throw new Error('Failed to add room data')

  const data = await response.json()
  return data;
}