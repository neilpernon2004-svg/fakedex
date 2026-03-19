const TYPES = ['all','fire','water','grass','electric','psychic','ice','dragon','dark',
  'fairy','normal','fighting','flying','poison','ground','rock','bug','ghost','steel']

const TYPE_ICONS: Record<string,string> = {
  all:'◈',fire:'🔥',water:'💧',grass:'🌿',electric:'⚡',psychic:'🔮',ice:'❄',
  dragon:'🐉',dark:'🌑',fairy:'✨',normal:'○',fighting:'👊',flying:'💨',
  poison:'☠',ground:'⛰',rock:'🪨',bug:'🐛',ghost:'👻',steel:'⚙'
}

interface Props { selected: string; onChange: (t: string) => void }

export default function TypeFilter({ selected, onChange }: Props) {
  return (
    <div className="type-filter">
      {TYPES.map((type) => (
        <button
          key={type}
          className={`type-btn type-${type} ${selected === type ? 'active' : ''}`}
          onClick={() => onChange(type)}
        >
          <span>{TYPE_ICONS[type]}</span>
          <span>{type === 'all' ? 'TOUS' : type.toUpperCase()}</span>
        </button>
      ))}
    </div>
  )
}
