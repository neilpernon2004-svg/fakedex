import PokemonCard from './PokemonCard'

interface Props {
  pokemons: any[]
  onSelect: (p: any) => void
  selected: any
  onAddToTeam: (p: any) => void
  team: any[]
}

export default function PokemonList({ pokemons, onSelect, selected, onAddToTeam, team }: Props) {
  return (
    <div className="pokemon-list-panel">
      <div className="list-header">
        <span className="list-count">{pokemons.length} Pokémon</span>
        <div className="scanline-bar" />
      </div>
      <div className="pokemon-grid">
        {pokemons.map((p) => (
          <PokemonCard
            key={p.id}
            pokemon={p}
            onSelect={onSelect}
            isSelected={selected?.id === p.id}
            onAddToTeam={onAddToTeam}
            inTeam={!!team.find((t) => t.id === p.id)}
          />
        ))}
        {pokemons.length === 0 && (
          <div className="no-results">Aucun Pokémon trouvé</div>
        )}
      </div>
    </div>
  )
}
