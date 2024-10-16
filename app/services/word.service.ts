export const validateWord = async (word: string) => {
  try {
    const response = await fetch(`/api/validate-word`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word })
    })
    if (!response.ok) throw new Error('Failed to validate word')
    const data = await response.json()
    return data;
  } catch (error) {
    console.error('Error validating word:', error)
  }
}