import { Player } from '@/app/types';
import { NextResponse } from 'next/server'

let players: Player[] = []

function generateAvatarUrl(name: string) {
  const hash = name.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  return `https://api.dicebear.com/9.x/pixel-art/svg?seed=${hash}`;
}

export async function GET() {
  return NextResponse.json(players)
}

export async function POST(request: Request) {
  const { name } = await request.json()
  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }
  const newPlayer = {
    id: Date.now().toString(),
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
  const { id, score } = await request.json()
  if (!id || score === undefined) {
    return NextResponse.json({ error: 'ID and score are required' }, { status: 400 })
  }
  const player = players.find(p => p.id === id)
  if (!player) {
    return NextResponse.json({ error: 'Player not found' }, { status: 404 })
  }
  player.score = score
  return NextResponse.json(player)
}