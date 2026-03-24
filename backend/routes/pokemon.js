import { Router } from 'express'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// On crée un router Express dédié aux routes Pokémon.
// Ce fichier sert a centraliser toute la logique backend liée aux pokémons.
const router = Router()

// En modules ES, __dirname n'existe pas directement.
// Cette ligne permet de récupérer le dossier courant du fichier.
const __dirname = dirname(fileURLToPath(import.meta.url))

// Chemin vers le fichier qui contient le cache des 151 pokémons officiels.
const CACHE_PATH = join(__dirname, '../data/cache.json')

// Chemin vers le fichier qui contient les pokémons personnalisés créés dans l'app.
const CUSTOM_PATH = join(__dirname, '../data/custom_pokemon.json')

// Lit les pokémons customs depuis le fichier JSON.
// Si le fichier n'existe pas ou qu'il y a une erreur de lecture, on renvoie un tableau vide.
function getCustomPokemons() {
  try {
    return JSON.parse(readFileSync(CUSTOM_PATH, 'utf-8'))
  } catch {
    return []
  }
}

// Sauvegarde la liste complète des pokémons customs dans le fichier local.
// On utilise JSON.stringify pour transformer le tableau JS en texte JSON.
function saveCustomPokemons(pokemons) {
  writeFileSync(CUSTOM_PATH, JSON.stringify(pokemons, null, 2))
}

// Essaie de lire le cache local des pokémons officiels.
// Si le fichier n'existe pas encore, on renvoie null pour signaler l'absence de cache.
function getCachedPokemons() {
  if (existsSync(CACHE_PATH)) {
    return JSON.parse(readFileSync(CACHE_PATH, 'utf-8'))
  }
  return null
}

// Récupère un seul pokémon depuis l'API externe PokeAPI.
// On sélectionne seulement les champs utiles pour éviter de stocker trop de données.
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

    // On limite les attaques aux 4 premieres pour garder une réponse plus legère.
    moves: data.moves.slice(0, 4),

    sprites: data.sprites,
  }
}

// Récupère les 151 premiers pokémons depuis PokeAPI puis les enregistre dans le cache.
// Le but est d'éviter de refaire 151 appels réseau à chaque chargement du frontend.
async function fetchAndCacheAll() {
  console.log('🔄 Chargement des 151 pokémons depuis pokeapi.co...')

  const promises = []

  // On prépare les promesses pour charger tous les pokémons de 1 à 151.
  for (let i = 1; i <= 151; i++) {
    promises.push(fetchOnePokemon(i))
  }

  // On attend que toutes les requêtes soient terminées.
  const pokemons = await Promise.all(promises)

  // On sauvegarde le résultat dans le fichier de cache pour les prochains appels.
  writeFileSync(CACHE_PATH, JSON.stringify(pokemons, null, 2))

  console.log('✅ Cache créé !')
  return pokemons
}

// Route principale : renvoie tous les pokémons visibles dans l'application.
// Elle fusionne les pokémons officiels (cache) et les pokémons customs.
router.get('/', async (req, res) => {
  try {
    let base = getCachedPokemons()

    // Si aucun cache n'existe, on recharge la base complète depuis l'API.
    if (!base) {
      base = await fetchAndCacheAll()
    }

    // On renvoie un seul tableau contenant base + customs pour simplifier le frontend.
    res.json([...base, ...getCustomPokemons()])
  } catch (err) {
    console.error('Erreur complète :', err)
    res.status(500).json({ error: err.message })
  }
})

// Route qui renvoie uniquement les pokémons personnalisés.
// Elle peut servir pour une vue spécifique ou pour du debug.
router.get('/custom', (req, res) => {
  res.json(getCustomPokemons())
})

// Route qui force le rechargement du cache depuis l'API externe.
// Utile si on veut reconstruire le cache sans redémarrer le serveur.
router.get('/refresh', async (req, res) => {
  try {
    const pokemons = await fetchAndCacheAll()
    res.json({ message: `✅ ${pokemons.length} pokémons rechargés !` })
  } catch {
    res.status(500).json({ error: 'Erreur rechargement' })
  }
})

// Route de création d'un nouveau pokémon custom.
// Le frontend envoie les données dans req.body, puis le backend les valide avant sauvegarde.
router.post('/', async (req, res) => {
  const pokemon = req.body

  // On vérifie les champs minimums obligatoires avant de créer le pokémon.
  if (!pokemon.name || !pokemon.types?.length) {
    return res.status(400).json({ error: 'Nom et types obligatoires' })
  }

  // On fusionne les pokémons officiels et customs pour vérifier qu'aucun nom n'existe déjà.
  const all = [...(getCachedPokemons() || []), ...getCustomPokemons()]

  // On compare les noms sans tenir compte des espaces et des majuscules/minuscules.
  if (all.some(p => p.name.toLowerCase() === pokemon.name.trim().toLowerCase())) {
    return res.status(409).json({ error: 'Un Pokémon avec ce nom existe déjà' })
  }

  // On récupère les pokémons customs existants pour préparer l'ajout du nouveau.
  const custom = getCustomPokemons()

  // On extrait les numéros des displayId existants (ex: C-001 -> 1)
  // pour calculer le prochain identifiant d'affichage.
  const nums = custom
    .map(p => p.displayId)
    .filter(id => id?.startsWith('C-'))
    .map(id => parseInt(id.replace('C-', '')))
    .filter(n => !isNaN(n))

  // Si des IDs customs existent déjà, on prend le plus grand + 1, sinon on commence à 1.
  const nextNum = nums.length > 0 ? Math.max(...nums) + 1 : 1

  // On construit un displayId lisible du type C-001, C-002, etc.
  const displayId = `C-${String(nextNum).padStart(3, '0')}`

  // On calcule aussi un id numérique unique en repartant du plus grand id existant.
  const lastId = all.reduce((max, p) => Math.max(max, p.id), 0)

  // On crée l'objet final du nouveau pokémon avec ses méta-infos.
  const newPokemon = {
    ...pokemon,
    id: lastId + 1,
    displayId,
    isCustom: true,
  }

  // On ajoute le nouveau pokémon dans la liste puis on sauvegarde le fichier.
  custom.push(newPokemon)
  saveCustomPokemons(custom)

  // 201 = ressource créée avec succès.
  res.status(201).json(newPokemon)
})

// Route de suppression d'un pokémon custom par son id.
// On ne supprime ici que les pokémons personnalisés, pas les pokémons officiels du cache.
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id)

  // On charge la liste des pokémons customs existants.
  const custom = getCustomPokemons()

  // On cherche la position du pokémon à supprimer dans le tableau.
  const index = custom.findIndex(p => p.id === id)

  // Si aucun pokémon ne correspond à cet id, on renvoie une erreur 404.
  if (index === -1) {
    return res.status(404).json({ error: 'Introuvable' })
  }

  // splice supprime l'élément du tableau et renvoie ce qui a été retiré.
  const deleted = custom.splice(index, 1)[0]

  // On sauvegarde la nouvelle liste après suppression.
  saveCustomPokemons(custom)

  // On renvoie un message de confirmation + le pokémon supprimé.
  res.json({
    message: `${deleted.name} supprimé`,
    pokemon: deleted,
  })
})

// On exporte le router pour qu'il soit branché dans server.js via /api/pokemons
export default router