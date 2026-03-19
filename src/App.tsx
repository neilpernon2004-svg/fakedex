import { useState, useMemo } from 'react'
import allPokemons from './data/pokemon.json'
import PokemonList from './components/PokemonList'
import PokemonDetail from './components/PokemonDetail'
import SearchBar from './components/SearchBar'
import TeamBuilder from './components/TeamBuilder'
import TypeFilter from './components/TypeFilter'
import CreatePokemon from './components/CreatePokemon'
import './App.css'

export default function App() {
  const [search, setSearch] = useState('')
  const [selectedPokemon, setSelectedPokemon] = useState<any>(null)
  const [team, setTeam] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'pokedex' | 'team' | 'create'>('pokedex')
  const [selectedType, setSelectedType] = useState('all')
  const [customPokemons, setCustomPokemons] = useState<any[]>([])

  const allPokemonsWithCustom = useMemo(
    () => [...(allPokemons as any[]), ...customPokemons],
    [customPokemons]
  )

  const filteredPokemons = useMemo(() =>
    allPokemonsWithCustom.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        String(p.id).includes(search)
      const matchType =
        selectedType === 'all' || p.types.some((t: any) => t.type.name === selectedType)
      return matchSearch && matchType
    }),
    [search, selectedType, allPokemonsWithCustom]
  )

  const addToTeam = (pokemon: any) => {
    if (team.length >= 6) return
    if (team.find((p) => p.id === pokemon.id)) return
    setTeam([...team, pokemon])
  }

  const removeFromTeam = (id: number) => {
    setTeam(team.filter((p) => p.id !== id))
  }

  const handleCreate = (pokemon: any) => {
    setCustomPokemons(prev => [...prev, pokemon])
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo-block">
            <span className="logo-ball">◉</span>
            <h1 className="logo-text">POKÉDEX</h1>
            <span className="logo-sub">GEN I — 151 POKÉMON</span>
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
              {customPokemons.length > 0 && <span className="team-badge">{customPokemons.length}</span>}
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
                selected={selectedPokemon}
                onAddToTeam={addToTeam}
                team={team}
              />
              <div className="detail-panel">
                {selectedPokemon ? (
                  <PokemonDetail
                    pokemon={selectedPokemon}
                    onAddToTeam={addToTeam}
                    inTeam={!!team.find((p) => p.id === selectedPokemon.id)}
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
          <TeamBuilder team={team} onRemove={removeFromTeam} onSelect={setSelectedPokemon} />
        )}

        {activeTab === 'create' && (
          <CreatePokemon onCreate={handleCreate} />
        )}
      </main>
    </div>
  )
}
