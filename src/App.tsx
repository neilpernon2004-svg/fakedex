import { useState, useMemo, useEffect } from 'react'
import PokemonList from './components/PokemonList'
import PokemonDetail from './components/PokemonDetail'
import SearchBar from './components/SearchBar'
import TeamBuilder from './components/TeamBuilder'
import TypeFilter from './components/TypeFilter'
import CreatePokemon from './components/CreatePokemon'
import { getAllPokemons, createPokemon, getTeam, addToTeam, removeFromTeam, deletePokemon } from './services/api'
import './App.css'

export default function App() {
  const [search, setSearch] = useState('')
  const [selectedPokemon, setSelectedPokemon] = useState<any>(null)
  const [team, setTeam] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'pokedex' | 'team' | 'create'>('pokedex')
  const [selectedType, setSelectedType] = useState('all')
  const [allPokemonsWithCustom, setAllPokemonsWithCustom] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [pokemons, savedTeam] = await Promise.all([
          getAllPokemons(),
          getTeam(),
        ])
        setAllPokemonsWithCustom(pokemons)
        setTeam(savedTeam)
      } catch (err) {
        console.error('Erreur chargement :', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const getPokemonRefId = (pokemon: any) =>
    pokemon.displayId || String(pokemon.id).padStart(3, '0')

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

  const customPokemons = allPokemonsWithCustom.filter((p) => p.isCustom)

  const handleAddToTeam = async (pokemon: any) => {
    try {
      const result = await addToTeam(pokemon)
      setTeam(result.team)
    } catch (err: any) {
      console.error('Erreur ajout équipe :', err.message)
    }
  }

  const handleRemoveFromTeam = async (id: number) => {
    try {
      const result = await removeFromTeam(id)
      setTeam(result.team)
    } catch (err: any) {
      console.error('Erreur retrait équipe :', err.message)
    }
  }

  const handleCreate = async (pokemon: any) => {
    try {
      const newPokemon = await createPokemon(pokemon)
      setAllPokemonsWithCustom((prev) => [...prev, newPokemon])
      setSelectedPokemon(newPokemon)
      setActiveTab('pokedex')
      return true
    } catch (err: any) {
      console.error('Erreur création :', err.message)
      return false
    }
  }

  const handleDelete = async (id: number) => {
  try {
    await deletePokemon(id)
    setAllPokemonsWithCustom(prev => prev.filter(p => p.id !== id))
  } catch (err: any) {
    console.error('Erreur suppression :', err.message)
  }
}

  // Sélectionne un pokémon au hasard dans toute la liste
  const handleRandom = () => {
    const random = allPokemonsWithCustom[Math.floor(Math.random() * allPokemonsWithCustom.length)]
    setSelectedPokemon(random)
    setActiveTab('pokedex')
    setSearch('')
    setSelectedType('all')
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--red)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem' }}>◉</div>
        <p>Chargement du Pokédex...</p>
      </div>
    </div>
  )

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo-block">
            <span className="logo-ball">◉</span>
            <h1 className="logo-text">POKÉDEX</h1>
            <span className="logo-sub">{allPokemonsWithCustom.length} POKÉMON</span>
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
              {customPokemons.length > 0 && (
                <span className="team-badge">{customPokemons.length}</span>
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
              <button className="random-btn" onClick={handleRandom}>
                🔀 Aléatoire
              </button>
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

        {activeTab === 'create' && (
          <CreatePokemon
            onCreate={handleCreate}
            customPokemons={allPokemonsWithCustom.filter(p => p.isCustom)}
            onDelete={handleDelete}
          />
        )}
      </main>
    </div>
  )
}
