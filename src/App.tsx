// ============================================
// App.tsx — Composant principal
// ============================================
// Changements vs version originale :
// - Plus d'import du pokemon.json local
// - Les données viennent du backend via api.ts
// - L'équipe est sauvegardée côté backend
// - useEffect pour charger les données au démarrage

import { useState, useMemo, useEffect } from 'react'
import PokemonList from './components/PokemonList'
import PokemonDetail from './components/PokemonDetail'
import SearchBar from './components/SearchBar'
import TeamBuilder from './components/TeamBuilder'
import TypeFilter from './components/TypeFilter'
import CreatePokemon from './components/CreatePokemon'
import { getAllPokemons, createPokemon, getTeam, addToTeam, removeFromTeam } from './services/api'
import './App.css'

export default function App() {
  const [search, setSearch] = useState('')
  const [selectedPokemon, setSelectedPokemon] = useState<any>(null)
  const [team, setTeam] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'pokedex' | 'team' | 'create'>('pokedex')
  const [selectedType, setSelectedType] = useState('all')

  // Avant : deux states séparés (allPokemons + customPokemons)
  // Maintenant : un seul state qui contient tout (base + custom)
  // car le backend nous renvoie déjà les deux mélangés
  const [allPokemonsWithCustom, setAllPokemonsWithCustom] = useState<any[]>([])

  // Pour afficher un écran de chargement pendant que le backend répond
  const [loading, setLoading] = useState(true)

  // ── Chargement initial ──────────────────────────────
  // useEffect avec [] = s'exécute UNE SEULE FOIS au démarrage
  // C'est ici qu'on appelle le backend pour récupérer les données
  useEffect(() => {
    async function loadData() {
      try {
        // Promise.all = lance les deux appels EN MÊME TEMPS (plus rapide)
        // getAllPokemons() → GET /api/pokemons
        // getTeam()        → GET /api/team
        const [pokemons, savedTeam] = await Promise.all([
          getAllPokemons(),
          getTeam(),
        ])
        setAllPokemonsWithCustom(pokemons)
        setTeam(savedTeam)
      } catch (err) {
        console.error('Erreur chargement :', err)
      } finally {
        // finally = s'exécute toujours, même si erreur
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // ── Helpers ─────────────────────────────────────────
  // Retourne l'ID à afficher : displayId pour les custom, id padded pour les autres
  const getPokemonRefId = (pokemon: any) =>
    pokemon.displayId || String(pokemon.id).padStart(3, '0')

  // ── Filtrage ─────────────────────────────────────────
  // useMemo = recalcule seulement quand search, selectedType ou la liste change
  const filteredPokemons = useMemo(
    () =>
      allPokemonsWithCustom.filter((p) => {
        const refId = getPokemonRefId(p)
        const matchSearch =
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          refId.toLowerCase().includes(search.toLowerCase())
        const matchType =
          selectedType === 'all' || p.types.some((t: any) => t.type.name === selectedType)
        return matchSearch && matchType
      }),
    [search, selectedType, allPokemonsWithCustom]
  )

  const visibleSelectedPokemon =
    selectedPokemon &&
    filteredPokemons.some((p) => getPokemonRefId(p) === getPokemonRefId(selectedPokemon))
      ? selectedPokemon
      : null

  // ── Gestion de l'équipe ──────────────────────────────

  // Ajoute un pokémon à l'équipe via le backend (POST /api/team)
  // Le backend vérifie les règles : max 6, pas de doublon
  const handleAddToTeam = async (pokemon: any) => {
    try {
      const result = await addToTeam(pokemon)
      setTeam(result.team) // on met à jour le state avec la réponse du backend
    } catch (err: any) {
      console.error('Erreur ajout équipe :', err.message)
    }
  }

  // Retire un pokémon de l'équipe via le backend (DELETE /api/team/:id)
  const handleRemoveFromTeam = async (displayId: string) => {
    const pokemon = team.find((p) => getPokemonRefId(p) === displayId)
    if (!pokemon) return
    try {
      const result = await removeFromTeam(pokemon.id)
      setTeam(result.team)
    } catch (err: any) {
      console.error('Erreur retrait équipe :', err.message)
    }
  }

  // ── Création d'un pokémon custom ─────────────────────
  // Envoie le nouveau pokémon au backend (POST /api/pokemons)
  // Le backend gère l'ID, le displayId (C-001, C-002...) et la sauvegarde
  const handleCreate = async (pokemon: any) => {
    try {
      const newPokemon = await createPokemon(pokemon)
      // On ajoute le nouveau pokémon à la liste locale
      setAllPokemonsWithCustom((prev) => [...prev, newPokemon])
      setSelectedPokemon(newPokemon)
      setActiveTab('pokedex')
      return true
    } catch (err: any) {
      // Le backend renvoie une erreur si le nom existe déjà (409)
      console.error('Erreur création :', err.message)
      return false
    }
  }

  const totalPokemonCount = allPokemonsWithCustom.length

  // ── Écran de chargement ──────────────────────────────
  // Affiché pendant que le backend récupère les données depuis pokeapi.co
  // La 1ère fois ~10 sec (appel API), ensuite instantané (cache)
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--red)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem' }}>◉</div>
        <p>Chargement du Pokédex...</p>
      </div>
    </div>
  )

  // ── Rendu principal ──────────────────────────────────
  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo-block">
            <span className="logo-ball">◉</span>
            <h1 className="logo-text">POKÉDEX</h1>
            <span className="logo-sub">{totalPokemonCount} POKÉMON</span>
          </div>

          <nav className="tabs">
            <button
              className={`tab-btn ${activeTab === 'pokedex' ? 'active' : ''}`}
              onClick={() => setActiveTab('pokedex')}
            >
              <span className="tab-icon">◈</span> POKÉDEX
            </button>

            <button
              className={`tab-btn ${activeTab === 'team' ? 'active' : ''}`}
              onClick={() => setActiveTab('team')}
            >
              <span className="tab-icon">⬡</span> MON ÉQUIPE
              {team.length > 0 && <span className="team-badge">{team.length}/6</span>}
            </button>

            <button
              className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
              onClick={() => setActiveTab('create')}
            >
              <span className="tab-icon">✦</span> CRÉER
              {/* Compte uniquement les pokémons custom (isCustom: true) */}
              {allPokemonsWithCustom.filter((p: any) => p.isCustom).length > 0 && (
                <span className="team-badge">
                  {allPokemonsWithCustom.filter((p: any) => p.isCustom).length}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      <main className="main">
        {activeTab === 'pokedex' && (
          <>
            <div className="controls">
              <SearchBar value={search} onChange={setSearch} />
              <TypeFilter selected={selectedType} onChange={setSelectedType} />
            </div>

            <div className="content-grid">
              <PokemonList
                pokemons={filteredPokemons}
                onSelect={setSelectedPokemon}
                selected={visibleSelectedPokemon}
                onAddToTeam={handleAddToTeam}  
                team={team}
              />

              <div className="detail-panel">
                {visibleSelectedPokemon ? (
                  <PokemonDetail
                    pokemon={visibleSelectedPokemon}
                    onAddToTeam={handleAddToTeam}  
                    inTeam={
                      !!team.find(
                        (p) => getPokemonRefId(p) === getPokemonRefId(visibleSelectedPokemon)
                      )
                    }
                    teamFull={team.length >= 6}
                  />
                ) : (
                  <div className="empty-detail">
                    <div className="empty-ball">◉</div>
                    <p>Sélectionne un Pokémon</p>
                    <span>pour voir ses détails</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'team' && (
          <TeamBuilder
            team={team}
            onRemove={handleRemoveFromTeam}  
            onSelect={(pokemon) => {
              setSelectedPokemon(pokemon)
              setActiveTab('pokedex')
            }}
          />
        )}

        {activeTab === 'create' && <CreatePokemon onCreate={handleCreate} />}
      </main>
    </div>
  )
}
