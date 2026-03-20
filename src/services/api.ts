const BASE_URL = 'http://localhost:3001/api'

export async function getAllPokemons() {
  const res = await fetch(`${BASE_URL}/pokemons`)
  return res.json()
}
export async function getTeam() {
  const res = await fetch(`${BASE_URL}/team`)
  return res.json()
}
export async function createPokemon(pokemon: any) {
  const res = await fetch(`${BASE_URL}/pokemons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pokemon),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error)
  return data
}
export async function addToTeam(pokemon: any) {
  const res = await fetch(`${BASE_URL}/team`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pokemon),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error)
  return data
}
export async function removeFromTeam(id: number) {
  const res = await fetch(`${BASE_URL}/team/${id}`, { method: 'DELETE' })
  return res.json()
}
export async function deletePokemon(id: number) {
  const res = await fetch(`${BASE_URL}/pokemons/${id}`, { method: 'DELETE' })
  return res.json()
}