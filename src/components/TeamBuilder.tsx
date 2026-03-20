import React from 'react'
import { TYPE_COLORS } from './PokemonCard'

interface Props {
  team: any[]
  onRemove: (displayId: string) => void
  onSelect: (p: any) => void
}

export default function TeamBuilder({ team, onRemove, onSelect }: Props) {
  const slots = [...team, ...Array(6 - team.length).fill(null)]

  const getTeamTypes = () => {
    const types: Record<string, number> = {}
    team.forEach((p) =>
      p.types.forEach((t: any) => {
        types[t.type.name] = (types[t.type.name] || 0) + 1
      })
    )
    return types
  }

  const totalStats = () => {
    const totals: Record<string, number> = {}
    team.forEach((p) =>
      p.stats.forEach((s: any) => {
        totals[s.stat.name] = (totals[s.stat.name] || 0) + s.base_stat
      })
    )
    return totals
  }

  const stats = totalStats()
  const teamTypes = getTeamTypes()

  return (
    <div className="team-builder">
      <div className="team-header">
        <h2>
          MON ÉQUIPE <span>{team.length}/6</span>
        </h2>
        <p className="team-sub">Construis ton équipe idéale — jusqu&apos;à 6 Pokémon</p>
      </div>

      <div className="team-slots">
        {slots.map((pokemon, i) => (
          <div
            key={i}
            className={`team-slot ${pokemon ? 'filled' : 'empty'}`}
            style={
              pokemon
                ? ({ '--type-color': TYPE_COLORS[pokemon.types[0].type.name] || '#ccc' } as React.CSSProperties)
                : {}
            }
          >
            {pokemon ? (
              <>
                <div className="slot-glow" />
                <img
                  src={
                    pokemon.sprites?.other?.['official-artwork']?.front_default ||
                    pokemon.sprites?.front_default
                  }
                  alt={pokemon.name}
                  className="slot-sprite"
                  onClick={() => onSelect(pokemon)}
                />
                <div className="slot-info">
                  <span className="slot-num">
                    #{pokemon.displayId || String(pokemon.id).padStart(3, '0')}
                  </span>
                  <span className="slot-name">{pokemon.name}</span>
                  <div className="slot-types">
                    {pokemon.types.map((t: any) => (
                      <span
                        key={t.type.name}
                        className="type-tag"
                        style={{ background: TYPE_COLORS[t.type.name] }}
                      >
                        {t.type.name}
                      </span>
                    ))}
                  </div>
                  <span className="slot-total">
                    {pokemon.stats.reduce((a: number, s: any) => a + s.base_stat, 0)} pts
                  </span>
                </div>
                <button
                  className="slot-remove"
                  onClick={() =>
                    onRemove(pokemon.displayId || String(pokemon.id).padStart(3, '0'))
                  }
                >
                  ✕
                </button>
              </>
            ) : (
              <div className="slot-placeholder">
                <span className="slot-num-empty">{i + 1}</span>
                <div className="slot-empty-icon">◉</div>
                <span>Vide</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {team.length > 0 && (
        <div className="team-analysis">
          <div className="analysis-section">
            <h3>TYPES DE L&apos;ÉQUIPE</h3>
            <div className="team-types-wrap">
              {Object.entries(teamTypes).map(([type, count]) => (
                <div key={type} className="team-type-row">
                  <span
                    className="type-tag"
                    style={{ background: TYPE_COLORS[type] || '#ccc' }}
                  >
                    {type}
                  </span>
                  <div className="type-count-bar">
                    <div
                      className="type-count-fill"
                      style={{ width: `${count * 33}%`, background: TYPE_COLORS[type] }}
                    />
                  </div>
                  <span className="type-count-num">×{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="analysis-section">
            <h3>STATISTIQUES TOTALES</h3>
            <div className="team-stats">
              {Object.entries(stats).map(([name, val]) => (
                <div key={name} className="team-stat-row">
                  <span>{name.replace('special-', 'sp.').toUpperCase()}</span>
                  <span className="team-stat-val">{val}</span>
                  <span className="team-stat-avg">({Math.round(val / team.length)} moy.)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {team.length === 0 && (
        <div className="team-empty-state">
          <div className="empty-pokeball">◉</div>
          <p>Ton équipe est vide !</p>
          <span>Va dans le Pokédex pour ajouter des Pokémon</span>
        </div>
      )}
    </div>
  )
}