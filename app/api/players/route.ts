import { Player } from '@/app/types';
import { supabase } from '@/utils/supabase/supabase';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { generateAvatarUrl } from '../helper';

const players: Player[] = []

export async function GET() {
  return NextResponse.json(players)
}

export async function POST(request: Request) {
  const { name } = await request.json()
  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }
  const newPlayer = {
    id: uuidv4(),
    name,
    avatarUrl: generateAvatarUrl(name),
    score: 0
  }
  players.push(newPlayer)
  return NextResponse.json(newPlayer)
}

export async function DELETE(request: Request) {
  const { id } = await request.json()
  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 })
  }
  const index = players.findIndex(player => player.id === id)
  if (index === -1) {
    return NextResponse.json({ error: 'Player not found' }, { status: 404 })
  }
  players.splice(index, 1)
  return NextResponse.json({ success: true })
}

export async function PUT(request: Request) {
  const { name, room } = await request.json()
  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }
  if ((room.players as Player[]).find(p => p.name === name)) {
    const newPlayer = (room.players as Player[]).find(p => p.name === name);
    return NextResponse.json({ newPlayer, room });
  }

  const newPlayer = {
    id: uuidv4(),
    name,
    avatarUrl: generateAvatarUrl(name),
    score: 0
  }

  const data = await supabase
    .from('rooms')
    .update({ players: [...room.players, newPlayer] })
    .eq('roomId', room.roomId)
    .select()
    .single();

  return NextResponse.json({ newPlayer, room: data.data });
}