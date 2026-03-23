import { useState } from 'react'
import React from 'react'
import { TYPE_COLORS } from './PokemonCard'

interface Props {
  onCreate: (pokemon: any) => Promise<boolean>
  customPokemons: any[]
  onDelete: (id: number) => void
}

const ALL_TYPES = Object.keys(TYPE_COLORS)

const STAT_NAMES = [
  { key: 'hp', label: 'HP' },
  { key: 'attack', label: 'Attaque' },
  { key: 'defense', label: 'Défense' },
  { key: 'special-attack', label: 'Att. Spé.' },
  { key: 'special-defense', label: 'Déf. Spé.' },
  { key: 'speed', label: 'Vitesse' },
]

const DEFAULT_IMG = 'https://archives.bulbagarden.net/media/upload/7/74/Spr_3e_Question_Mark.png'

export default function CreatePokemon({ onCreate, customPokemons, onDelete }: Props) {
  const [name, setName] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [imageUrl, setImageUrl] = useState('')
  const [stats, setStats] = useState<Record<string, number>>({
    hp: 50, attack: 50, defense: 50,
    'special-attack': 50, 'special-defense': 50, speed: 50,
  })
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : prev.length < 2 ? [...prev, type] : prev
    )
  }

  const handleStatChange = (key: string, val: number) => {
    setStats(prev => ({ ...prev, [key]: Math.min(255, Math.max(1, val)) }))
  }

  const total = Object.values(stats).reduce((a, b) => a + b, 0)

  const handleSubmit = async () => {
    setError('')
    if (!name.trim() || selectedTypes.length === 0) return

    // On laisse le backend gérer l'ID — on n'en génère plus ici
    const newPokemon = {
      name: name.trim().toLowerCase().replace(/\s+/g, '-'),
      height: 10,
      weight: 100,
      base_experience: 100,
      types: selectedTypes.map((t, i) => ({ slot: i + 1, type: { name: t } })),
      stats: STAT_NAMES.map(s => ({ base_stat: stats[s.key], stat: { name: s.key } })),
      moves: [],
      sprites: {
        front_default: imageUrl || DEFAULT_IMG,
        other: {
          'official-artwork': {
            front_default: imageUrl || DEFAULT_IMG,
          },
        },
      },
    }

    const created = await onCreate(newPokemon)
    if (created) {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      reset()
    } else {
      setError('Un Pokémon avec ce nom existe déjà.')
      setTimeout(() => setError(''), 4000)
    }
  }

  const reset = () => {
    setName('')
    setSelectedTypes([])
    setImageUrl('')
    setStats({ hp: 50, attack: 50, defense: 50, 'special-attack': 50, 'special-defense': 50, speed: 50 })
  }

  const primaryColor = selectedTypes.length > 0 ? TYPE_COLORS[selectedTypes[0]] : 'var(--red)'

  return (
    <div className="create-pokemon">
      <div className="create-header">
        <h2 className="create-title">CRÉER UN POKÉMON</h2>
        <p className="create-sub">Invente ton propre Pokémon et ajoute-le au Pokédex</p>
      </div>

      <div className="create-layout">
        {/* ── FORMULAIRE ── */}
        <div className="create-form">
          <div className="create-section">
            <label className="create-label">◈ NOM DU POKÉMON</label>
            <input
              className="create-input"
              placeholder="Ex: Flamosaure..."
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={30}
            />
          </div>

          <div className="create-section">
            <label className="create-label">◈ TYPE(S) — MAX 2</label>
            <div className="type-picker">
              {ALL_TYPES.map(type => {
                const selected = selectedTypes.includes(type)
                const color = TYPE_COLORS[type]
                const disabled = !selected && selectedTypes.length >= 2
                return (
                  <button
                    key={type}
                    className={`type-pick-btn ${selected ? 'active' : ''} ${disabled ? 'dimmed' : ''}`}
                    onClick={() => toggleType(type)}
                    style={selected
                      ? { background: color, borderColor: color, color: '#000' }
                      : { borderColor: color + '80', color: color }
                    }
                  >
                    {type}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="create-section">
            <label className="create-label">◈ IMAGE (URL, optionnel)</label>
            <input
              className="create-input"
              placeholder="https://..."
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
            />
            {imageUrl && (
              <div className="url-preview">
                <img src={imageUrl} alt="preview" onError={e => (e.currentTarget.style.display = 'none')} />
              </div>
            )}
          </div>

          <div className="create-section">
            <label className="create-label">
              ◈ STATISTIQUES — TOTAL: <span style={{ color: primaryColor }}>{total}</span>
            </label>
            <div className="stats-editor">
              {STAT_NAMES.map(s => (
                <div key={s.key} className="stat-editor-row">
                  <span className="stat-editor-label">{s.label}</span>
                  <input
                    type="range" min={1} max={255}
                    value={stats[s.key]}
                    onChange={e => handleStatChange(s.key, parseInt(e.target.value))}
                    className="stat-slider"
                    style={{ '--stat-color': primaryColor } as React.CSSProperties}
                  />
                  <input
                    type="number" min={1} max={255}
                    value={stats[s.key]}
                    onChange={e => handleStatChange(s.key, parseInt(e.target.value) || 1)}
                    className="stat-number-input"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="create-actions">
            <button
              className="create-btn"
              onClick={handleSubmit}
              disabled={!name.trim() || selectedTypes.length === 0}
              style={name && selectedTypes.length > 0 ? { borderColor: primaryColor, color: primaryColor } : {}}
            >
              ✦ CRÉER LE POKÉMON
            </button>
            <button className="reset-btn" onClick={reset}>↺ RESET</button>
          </div>

          {success && <div className="create-success">✓ Pokémon ajouté au Pokédex !</div>}
          {error && <div className="create-error">✕ {error}</div>}
        </div>

        {/* ── APERÇU ── */}
        <div className="create-preview">
          <div className="preview-label">APERÇU</div>
          {name || selectedTypes.length > 0 ? (
            <div className="preview-card" style={{ '--type-color': primaryColor } as React.CSSProperties}>
              <div className="preview-glow" />
              <div className="preview-img-wrap">
                <img
                  src={imageUrl || DEFAULT_IMG}
                  alt="preview"
                  className="preview-img"
                  onError={e => (e.currentTarget.src = DEFAULT_IMG)}
                />
              </div>
              <div className="preview-name">{name || '???'}</div>
              <div className="preview-types">
                {selectedTypes.length > 0
                  ? selectedTypes.map(t => (
                      <span key={t} className="type-tag" style={{ background: TYPE_COLORS[t] }}>{t}</span>
                    ))
                  : <span className="preview-no-type">Aucun type</span>
                }
              </div>
              <div className="preview-stats-mini">
                {STAT_NAMES.map(s => (
                  <div key={s.key} className="preview-stat-row">
                    <span>{s.label}</span>
                    <div className="preview-stat-bar-bg">
                      <div className="preview-stat-bar-fill" style={{ width: `${(stats[s.key] / 255) * 100}%`, background: primaryColor }} />
                    </div>
                    <span>{stats[s.key]}</span>
                  </div>
                ))}
                <div className="preview-total">TOTAL: <strong style={{ color: primaryColor }}>{total}</strong></div>
              </div>
            </div>
          ) : (
            <div className="preview-empty">
              <div className="empty-pokeball">◉</div>
              <p>Remplis le formulaire<br />pour voir ton Pokémon</p>
            </div>
          )}
        </div>
      </div>

      {/* ── HISTORIQUE ── */}
      {customPokemons.length > 0 && (
        <div className="custom-history">
          <h3 className="history-title">◈ MES POKÉMONS CRÉÉS ({customPokemons.length})</h3>
          <div className="history-list">
            {customPokemons.map((p) => {
              const color = TYPE_COLORS[p.types[0].type.name] || '#ccc'
              const sprite = p.sprites.other['official-artwork'].front_default || p.sprites.front_default
              return (
                <div key={p.id} className="history-card" style={{ '--type-color': color } as React.CSSProperties}>
                  <img src={sprite} alt={p.name} className="history-sprite" onError={e => (e.currentTarget.src = DEFAULT_IMG)} />
                  <div className="history-info">
                    <span className="history-id">#{p.displayId}</span>
                    <span className="history-name">{p.name}</span>
                    <div className="history-types">
                      {p.types.map((t: any) => (
                        <span key={t.type.name} className="type-tag" style={{ background: TYPE_COLORS[t.type.name] }}>
                          {t.type.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button className="history-delete" onClick={() => onDelete(p.id)}>🗑️</button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
