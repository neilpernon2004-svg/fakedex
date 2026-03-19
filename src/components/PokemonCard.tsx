import React from 'react'

export const TYPE_COLORS: Record<string,string> = {
  fire:'#FF6B35',water:'#4FC3F7',grass:'#81C784',electric:'#FFD54F',
  psychic:'#F48FB1',ice:'#80DEEA',dragon:'#7986CB',dark:'#78909C',
  fairy:'#F8BBD9',normal:'#BCAAA4',fighting:'#FF7043',flying:'#90CAF9',
  poison:'#CE93D8',ground:'#FFCC80',rock:'#A5D6A7',bug:'#C5E1A5',
  ghost:'#9575CD',steel:'#90A4AE'
}

interface Props {
  pokemon: any
  onSelect: (p: any) => void
  isSelected: boolean
  onAddToTeam: (p: any) => void
  inTeam: boolean
}

export default function PokemonCard({ pokemon, onSelect, isSelected, onAddToTeam, inTeam }: Props) {
  const id = String(pokemon.id).padStart(3, '0')
  const mainType = pokemon.types[0].type.name
  const color = TYPE_COLORS[mainType] || '#ccc'
  const sprite = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default

  return (
    <div
      className={`poke-card ${isSelected ? 'selected' : ''}`}
      style={{ '--type-color': color } as React.CSSProperties}
      onClick={() => onSelect(pokemon)}
    >
      <div className="card-glow" />
      <span className="card-number">#{id}</span>
      <div className="card-sprite-wrap">
        <img src={sprite} alt={pokemon.name} className="card-sprite" loading="lazy" />
      </div>
      <h3 className="card-name">{pokemon.name}</h3>
      <div className="card-types">
        {pokemon.types.map((t: any) => (
          <span key={t.type.name} className="type-tag" style={{ background: TYPE_COLORS[t.type.name] || '#ccc' }}>
            {t.type.name}
          </span>
        ))}
      </div>
      <button
        className={`card-add-btn ${inTeam ? 'in-team' : ''}`}
        onClick={(e) => { e.stopPropagation(); onAddToTeam(pokemon) }}
        title={inTeam ? "Dans l'équipe" : "Ajouter"}
      >
        {inTeam ? '✓' : '+'}
      </button>
    </div>
  )
}
