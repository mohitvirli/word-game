import { NextResponse } from "next/server";

const API_BASE_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

export async function POST(request: Request) {
  const { word } = await request.json()
  try {
    const response = await fetch(`${API_BASE_URL}${word}`)
    if (!response.ok) {
      return NextResponse.json({ valid: false });
    }
    const data = await response.json()
    const meaning = data[0]?.meanings[0]?.definitions[0]?.definition || 'No definition available.'
    return NextResponse.json({ valid: true, meaning })
  } catch (error) {
    console.error('Error validating word:', error)
    return NextResponse.json({ valid: false });
  }
}