import express from 'express'
import cors from 'cors'
import pokemonRoutes from './routes/pokemon.js'
import teamRoutes from './routes/team.js'

const app = express()
const PORT = 3001

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.use('/api/pokemons', pokemonRoutes)
app.use('/api/team', teamRoutes)

app.listen(PORT, () => console.log(`🚀 Serveur sur http://localhost:${PORT}`))