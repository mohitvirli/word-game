
export const fetchPlayers = async () => {
  try {
    const response = await fetch('/api/players')
    if (!response.ok) throw new Error('Failed to fetch players')
    const data = await response.json()
    return data;
  } catch (error) {
    console.error('Error fetching players:', error)
  }
}

export const addNewPlayer = async (playerName: string) => {
  if (playerName) {
    try {
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: playerName })
      })
      if (!response.ok) throw new Error('Failed to add player')
      const newPlayer = await response.json()
      return newPlayer;
    } catch (error) {
      console.error('Error adding player:', error)
    }
  }
}

export const deletePlayer = async (id: string) => {
  try {
    const response = await fetch('/api/players', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    if (!response.ok) throw new Error('Failed to remove player')
    return true;
  } catch (error) {
    console.error('Error removing player:', error)
  }
}