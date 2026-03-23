import { Router } from 'express'
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const router = Router()
const __dirname = dirname(fileURLToPath(import.meta.url))
const TEAM_PATH = join(__dirname, '../data/team.json')

function getTeam() {
  try { return JSON.parse(readFileSync(TEAM_PATH, 'utf-8')) } catch { return [] }
}
function saveTeam(team) {
  writeFileSync(TEAM_PATH, JSON.stringify(team, null, 2))
}

router.get('/', (req, res) => res.json(getTeam()))

router.post('/', (req, res) => {
  const team = getTeam()
  if (team.length >= 6) return res.status(400).json({ error: 'Équipe complète' })
  if (team.some(p => p.id === req.body.id)) return res.status(409).json({ error: 'Déjà dans l\'équipe' })
  team.push(req.body)
  saveTeam(team)
  res.status(201).json({ team })
})

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id)  // Number() gère les grands timestamps
  const newTeam = getTeam().filter(p => p.id !== id)
  saveTeam(newTeam)
  res.json({ team: newTeam })
})

router.delete('/', (req, res) => {
  saveTeam([])
  res.json({ message: 'Équipe vidée' })
})

export default router