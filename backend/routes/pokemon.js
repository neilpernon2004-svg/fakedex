import { Router } from 'express'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const router = Router()
const __dirname = dirname(fileURLToPath(import.meta.url))
const CACHE_PATH = join(__dirname, '../data/cache.json')
const CUSTOM_PATH = join(__dirname, '../data/custom_pokemon.json')

function getCustomPokemons() {
  try { return JSON.parse(readFileSync(CUSTOM_PATH, 'utf-8')) } catch { return [] }
}
function saveCustomPokemons(pokemons) {
  writeFileSync(CUSTOM_PATH, JSON.stringify(pokemons, null, 2))
}
function getCachedPokemons() {
  if (existsSync(CACHE_PATH)) return JSON.parse(readFileSync(CACHE_PATH, 'utf-8'))
  return null
}
async function fetchOnePokemon(id) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
  const data = await res.json()
  return {
    id: data.id,
    name: data.name,
    height: data.height,
    weight: data.weight,
    base_experience: data.base_experience,
    types: data.types,
    stats: data.stats,
    moves: data.moves.slice(0, 4),
    sprites: data.sprites,
  }
}
async function fetchAndCacheAll() {
  console.log('🔄 Chargement des 151 pokémons depuis pokeapi.co...')
  const promises = []
  for (let i = 1; i <= 151; i++) promises.push(fetchOnePokemon(i))
  const pokemons = await Promise.all(promises)
  writeFileSync(CACHE_PATH, JSON.stringify(pokemons, null, 2))
  console.log('✅ Cache créé !')
  return pokemons
}

router.get('/', async (req, res) => {
  try {
    let base = getCachedPokemons()
    if (!base) base = await fetchAndCacheAll()
    res.json([...base, ...getCustomPokemons()])
  } catch (err) {
    console.error('Erreur complète :', err) // ← change cette ligne
    res.status(500).json({ error: err.message }) // ← et celle-ci
  }
})

router.get('/custom', (req, res) => res.json(getCustomPokemons()))

router.get('/refresh', async (req, res) => {
  try {
    const pokemons = await fetchAndCacheAll()
    res.json({ message: `✅ ${pokemons.length} pokémons rechargés !` })
  } catch {
    res.status(500).json({ error: 'Erreur rechargement' })
  }
})

router.post('/', async (req, res) => {
  const pokemon = req.body
  if (!pokemon.name || !pokemon.types?.length)
    return res.status(400).json({ error: 'Nom et types obligatoires' })

  const all = [...(getCachedPokemons() || []), ...getCustomPokemons()]
  if (all.some(p => p.name.toLowerCase() === pokemon.name.trim().toLowerCase()))
    return res.status(409).json({ error: 'Un Pokémon avec ce nom existe déjà' })

  const custom = getCustomPokemons()
  const nums = custom.map(p => p.displayId).filter(id => id?.startsWith('C-'))
    .map(id => parseInt(id.replace('C-', ''))).filter(n => !isNaN(n))
  const nextNum = nums.length > 0 ? Math.max(...nums) + 1 : 1
  const displayId = `C-${String(nextNum).padStart(3, '0')}`

  const lastId = all.reduce((max, p) => Math.max(max, p.id), 0)
  const newPokemon = { ...pokemon, id: lastId + 1, displayId, isCustom: true }
  custom.push(newPokemon)
  saveCustomPokemons(custom)
  res.status(201).json(newPokemon)
})

router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const custom = getCustomPokemons()
  const index = custom.findIndex(p => p.id === id)
  if (index === -1) return res.status(404).json({ error: 'Introuvable' })
  const deleted = custom.splice(index, 1)[0]
  saveCustomPokemons(custom)
  res.json({ message: `${deleted.name} supprimé`, pokemon: deleted })
})

export default router