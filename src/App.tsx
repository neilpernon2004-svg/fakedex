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

  const addToTeam = (pokemon: any) => {
    if (team.length >= 6) return
    if (team.find((p) => getPokemonRefId(p) === getPokemonRefId(pokemon))) return
    setTeam([...team, pokemon])
  }

  const removeFromTeam = (displayId: string) => {
    setTeam(team.filter((p) => getPokemonRefId(p) !== displayId))
  }

  const getNextCustomDisplayId = () => {
    const customNumbers = customPokemons
      .map((p) => p.displayId)
      .filter((id: string | undefined): id is string => !!id && id.startsWith('C-'))
      .map((id) => parseInt(id.replace('C-', ''), 10))
      .filter((n) => !Number.isNaN(n))

    const nextNumber = customNumbers.length > 0 ? Math.max(...customNumbers) + 1 : 1
    return `C-${String(nextNumber).padStart(3, '0')}`
  }

  const handleCreate = (pokemon: any) => {
    const normalizedName = pokemon.name.trim().toLowerCase()

    const alreadyExistsInBase = (allPokemons as any[]).some(
      (p) => p.name.trim().toLowerCase() === normalizedName
    )

    const alreadyExistsInCustom = customPokemons.some(
      (p) => p.name.trim().toLowerCase() === normalizedName
    )

    if (alreadyExistsInBase || alreadyExistsInCustom) {
      return false
    }

    const customDisplayId = getNextCustomDisplayId()

    const pokemonWithCustomId = {
      ...pokemon,
      displayId: customDisplayId,
      isCustom: true,
    }

    setCustomPokemons((prev) => [...prev, pokemonWithCustomId])
    setSelectedPokemon(pokemonWithCustomId)
    setActiveTab('pokedex')

    return true
  }

  const totalPokemonCount = allPokemonsWithCustom.length

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
            </div>

            <div className="content-grid">
              <PokemonList
                pokemons={filteredPokemons}
                onSelect={setSelectedPokemon}
                selected={visibleSelectedPokemon}
                onAddToTeam={addToTeam}
                team={team}
              />

              <div className="detail-panel">
                {visibleSelectedPokemon ? (
                  <PokemonDetail
                    pokemon={visibleSelectedPokemon}
                    onAddToTeam={addToTeam}
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
            onRemove={removeFromTeam}
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