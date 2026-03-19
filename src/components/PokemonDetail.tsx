import { useState } from 'react'
import React from 'react'
import { TYPE_COLORS } from './PokemonCard'

const STAT_LABELS: Record<string,string> = {
  hp:'PV', attack:'ATK', defense:'DEF',
  'special-attack':'SP.ATK', 'special-defense':'SP.DEF', speed:'VIT'
}

// Evolution chains Gen 1
const EVO_CHAINS: Record<number, number[]> = {
  1:[1,2,3], 2:[1,2,3], 3:[1,2,3],
  4:[4,5,6], 5:[4,5,6], 6:[4,5,6],
  7:[7,8,9], 8:[7,8,9], 9:[7,8,9],
  10:[10,11,12], 11:[10,11,12], 12:[10,11,12],
  13:[13,14,15], 14:[13,14,15], 15:[13,14,15],
  16:[16,17,18], 17:[16,17,18], 18:[16,17,18],
  19:[19,20], 20:[19,20], 21:[21,22], 22:[21,22],
  23:[23,24], 24:[23,24], 25:[25,26], 26:[25,26],
  27:[27,28], 28:[27,28], 29:[29,30,31], 30:[29,30,31], 31:[29,30,31],
  32:[32,33,34], 33:[32,33,34], 34:[32,33,34],
  35:[35,36], 36:[35,36], 37:[37,38], 38:[37,38],
  39:[39,40], 40:[39,40], 41:[41,42], 42:[41,42],
  43:[43,44,45], 44:[43,44,45], 45:[43,44,45],
  46:[46,47], 47:[46,47], 48:[48,49], 49:[48,49],
  50:[50,51], 51:[50,51], 52:[52,53], 53:[52,53],
  54:[54,55], 55:[54,55], 56:[56,57], 57:[56,57],
  58:[58,59], 59:[58,59], 60:[60,61,62], 61:[60,61,62], 62:[60,61,62],
  63:[63,64,65], 64:[63,64,65], 65:[63,64,65],
  66:[66,67,68], 67:[66,67,68], 68:[66,67,68],
  69:[69,70,71], 70:[69,70,71], 71:[69,70,71],
  72:[72,73], 73:[72,73], 74:[74,75,76], 75:[74,75,76], 76:[74,75,76],
  77:[77,78], 78:[77,78], 79:[79,80], 80:[79,80],
  81:[81,82], 82:[81,82], 84:[84,85], 85:[84,85],
  86:[86,87], 87:[86,87], 88:[88,89], 89:[88,89],
  90:[90,91], 91:[90,91], 92:[92,93,94], 93:[92,93,94], 94:[92,93,94],
  96:[96,97], 97:[96,97], 98:[98,99], 99:[98,99],
  100:[100,101], 101:[100,101], 102:[102,103], 103:[102,103],
  104:[104,105], 105:[104,105], 109:[109,110], 110:[109,110],
  111:[111,112], 112:[111,112], 116:[116,117], 117:[116,117],
  118:[118,119], 119:[118,119], 120:[120,121], 121:[120,121],
  129:[129,130], 130:[129,130], 133:[133,134], 134:[133,134],
  135:[133,135], 136:[133,136], 138:[138,139], 139:[138,139],
  140:[140,141], 141:[140,141], 147:[147,148,149], 148:[147,148,149], 149:[147,148,149],
}

const NAMES: Record<number,string> = {
  1:'bulbasaur',2:'ivysaur',3:'venusaur',4:'charmander',5:'charmeleon',6:'charizard',
  7:'squirtle',8:'wartortle',9:'blastoise',10:'caterpie',11:'metapod',12:'butterfree',
  13:'weedle',14:'kakuna',15:'beedrill',16:'pidgey',17:'pidgeotto',18:'pidgeot',
  19:'rattata',20:'raticate',21:'spearow',22:'fearow',23:'ekans',24:'arbok',
  25:'pikachu',26:'raichu',27:'sandshrew',28:'sandslash',29:'nidoran-f',30:'nidorina',
  31:'nidoqueen',32:'nidoran-m',33:'nidorino',34:'nidoking',35:'clefairy',36:'clefable',
  37:'vulpix',38:'ninetales',39:'jigglypuff',40:'wigglytuff',41:'zubat',42:'golbat',
  43:'oddish',44:'gloom',45:'vileplume',46:'paras',47:'parasect',48:'venonat',
  49:'venomoth',50:'diglett',51:'dugtrio',52:'meowth',53:'persian',54:'psyduck',
  55:'golduck',56:'mankey',57:'primeape',58:'growlithe',59:'arcanine',60:'poliwag',
  61:'poliwhirl',62:'poliwrath',63:'abra',64:'kadabra',65:'alakazam',66:'machop',
  67:'machoke',68:'machamp',69:'bellsprout',70:'weepinbell',71:'victreebel',72:'tentacool',
  73:'tentacruel',74:'geodude',75:'graveler',76:'golem',77:'ponyta',78:'rapidash',
  79:'slowpoke',80:'slowbro',81:'magnemite',82:'magneton',83:'farfetchd',84:'doduo',
  85:'dodrio',86:'seel',87:'dewgong',88:'grimer',89:'muk',90:'shellder',91:'cloyster',
  92:'gastly',93:'haunter',94:'gengar',95:'onix',96:'drowzee',97:'hypno',98:'krabby',
  99:'kingler',100:'voltorb',101:'electrode',102:'exeggcute',103:'exeggutor',
  104:'cubone',105:'marowak',106:'hitmonlee',107:'hitmonchan',108:'lickitung',
  109:'koffing',110:'weezing',111:'rhyhorn',112:'rhydon',113:'chansey',114:'tangela',
  115:'kangaskhan',116:'horsea',117:'seadra',118:'goldeen',119:'seaking',120:'staryu',
  121:'starmie',122:'mr-mime',123:'scyther',124:'jynx',125:'electabuzz',126:'magmar',
  127:'pinsir',128:'tauros',129:'magikarp',130:'gyarados',131:'lapras',132:'ditto',
  133:'eevee',134:'vaporeon',135:'jolteon',136:'flareon',137:'porygon',138:'omanyte',
  139:'omastar',140:'kabuto',141:'kabutops',142:'aerodactyl',143:'snorlax',
  144:'articuno',145:'zapdos',146:'moltres',147:'dratini',148:'dragonair',149:'dragonite',
  150:'mewtwo',151:'mew'
}

interface Props {
  pokemon: any
  onAddToTeam: (p: any) => void
  inTeam: boolean
  teamFull: boolean
}

export default function PokemonDetail({ pokemon, onAddToTeam, inTeam, teamFull }: Props) {
  const [activeTab, setActiveTab] = useState('stats')
  const id = String(pokemon.id).padStart(3, '0')
  const sprite = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default
  const mainType = pokemon.types[0].type.name
  const color = TYPE_COLORS[mainType] || '#ccc'
  const STAT_MAX = 255

  const evoChain = EVO_CHAINS[pokemon.id]

  return (
    <div className="detail-card" style={{ '--type-color': color } as React.CSSProperties}>
      <div className="detail-glow" />
      <div className="detail-header">
        <div className="detail-id">#{id}</div>
        <h2 className="detail-name">{pokemon.name}</h2>
        <div className="detail-types">
          {pokemon.types.map((t: any) => (
            <span key={t.type.name} className="type-tag" style={{ background: TYPE_COLORS[t.type.name] }}>
              {t.type.name}
            </span>
          ))}
        </div>
      </div>

      <div className="detail-sprite-wrap">
        <div className="sprite-ring" />
        <img src={sprite} alt={pokemon.name} className="detail-sprite" />
      </div>

      <div className="detail-quick">
        <div className="quick-stat">
          <span className="qs-label">TAILLE</span>
          <span className="qs-value">{(pokemon.height / 10).toFixed(1)}m</span>
        </div>
        <div className="quick-divider" />
        <div className="quick-stat">
          <span className="qs-label">POIDS</span>
          <span className="qs-value">{(pokemon.weight / 10).toFixed(1)}kg</span>
        </div>
        <div className="quick-divider" />
        <div className="quick-stat">
          <span className="qs-label">EXP</span>
          <span className="qs-value">{pokemon.base_experience}</span>
        </div>
      </div>

      <div className="detail-tabs">
        {['stats','moves','evo'].map((tab) => (
          <button
            key={tab}
            className={`detail-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'evo' ? 'ÉVOS' : tab.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="detail-body">
        {activeTab === 'stats' && (
          <div className="stats-list">
            {pokemon.stats.map((s: any) => {
              const pct = Math.round((s.base_stat / STAT_MAX) * 100)
              return (
                <div key={s.stat.name} className="stat-row">
                  <span className="stat-label">{STAT_LABELS[s.stat.name] || s.stat.name}</span>
                  <span className="stat-val">{s.base_stat}</span>
                  <div className="stat-bar-bg">
                    <div className="stat-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
            <div className="stat-total">
              <span>TOTAL</span>
              <span>{pokemon.stats.reduce((a: number, s: any) => a + s.base_stat, 0)}</span>
            </div>
          </div>
        )}

        {activeTab === 'moves' && (
          <div className="moves-list">
            {pokemon.moves.map((m: any) => (
              <span key={m.move.name} className="move-tag">{m.move.name.replace(/-/g,' ')}</span>
            ))}
          </div>
        )}

        {activeTab === 'evo' && (
          <div className="evo-panel">
            {evoChain ? (
              <div className="evo-list">
                {evoChain.map((evoId, i) => (
                  <div key={evoId} className="evo-item">
                    {i > 0 && <span className="evo-arrow">→</span>}
                    <img
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evoId}.png`}
                      alt={NAMES[evoId]}
                      className="evo-sprite"
                    />
                    <span className="evo-name">{NAMES[evoId] || `#${evoId}`}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-evo">Pas d'évolution connue</p>
            )}
          </div>
        )}
      </div>

      <button
        className={`add-team-btn ${inTeam ? 'in-team' : ''} ${teamFull && !inTeam ? 'disabled' : ''}`}
        onClick={() => onAddToTeam(pokemon)}
        disabled={teamFull && !inTeam}
      >
        {inTeam ? "✓ DANS L'ÉQUIPE" : teamFull ? 'ÉQUIPE PLEINE' : "+ AJOUTER À L'ÉQUIPE"}
      </button>
    </div>
  )
}
