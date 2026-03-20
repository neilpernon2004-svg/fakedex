import PokemonCard from './PokemonCard'

interface Props {
  pokemons: any[]
  onSelect: (p: any) => void
  selected: any
  onAddToTeam: (p: any) => void
  team: any[]
}

export default function PokemonList({
  pokemons,
  onSelect,
  selected,
  onAddToTeam,
  team,
}: Props) {
  const getPokemonRefId = (pokemon: any) =>
    pokemon.displayId || String(pokemon.id).padStart(3, '0')

  return (
    <div className="pokemon-list-panel">
      <div className="list-header">
        <span className="list-count">{pokemons.length} Pokémon</span>
        <div className="scanline-bar" />
      </div>

      <div className="pokemon-grid">
        {pokemons.map((p) => {
          const refId = getPokemonRefId(p)

          return (
            <PokemonCard
              key={refId}
              pokemon={p}
              onSelect={onSelect}
              isSelected={selected ? getPokemonRefId(selected) === refId : false}
              onAddToTeam={onAddToTeam}
              inTeam={!!team.find((t) => getPokemonRefId(t) === refId)}
            />
          )
        })}

        {pokemons.length === 0 && <div className="no-results">Aucun Pokémon trouvé</div>}
      </div>
    </div>
  )
}