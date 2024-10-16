import { supabase } from '@/utils/supabase/supabase';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  const { action, players, wordLength, turnTime } = await request.json()

  if (action === 'create') {
    const newRoomId = uuidv4().substring(0, 4).toUpperCase();
    const room = {
      roomId: newRoomId,
      players,
      wordLength,
      turnTime,
      currentPlayer: players[0],
      words: {},
      activeLetter: ''
    }
    const { status, error } = await supabase.from('rooms').insert(room)

    if (status !== 201) return NextResponse.json({ error }, { status })
    return NextResponse.json({ roomId: newRoomId })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const roomId = searchParams.get('roomId')

  const { data, error } = await supabase
    .from('rooms')
    .select()
    .match({ roomId })
    .single();

  if (!roomId || !data || error ) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function PUT(request: Request) {
  const { players, word, meaning, room } = await request.json()
  const words = room.words ?? {};
  const firstLetter = word[0].toUpperCase()
  if (!words[firstLetter]) {
    words[firstLetter] = []
  }
  words[firstLetter].push({ word, meaning })
  const activeLetter = word[word.length - 1].toUpperCase();
  const data = await supabase
    .from('rooms')
    .update({ words, activeLetter, players })
    .eq('roomId', room.roomId)
    .select()
    .single();

  return NextResponse.json(data)
}