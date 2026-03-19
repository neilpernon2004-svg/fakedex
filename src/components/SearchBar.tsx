interface Props { value: string; onChange: (v: string) => void }

export default function SearchBar({ value, onChange }: Props) {
  return (
    <div className="search-wrap">
      <span className="search-icon">⌕</span>
      <input
        className="search-input"
        type="text"
        placeholder="Nom ou numéro..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && <button className="search-clear" onClick={() => onChange('')}>✕</button>}
    </div>
  )
}
