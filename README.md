# 🎮 Fakedex — Pokédex Interactif

> Application web fullstack permettant de consulter les 151 pokémons de la génération 1, de construire une équipe, et de créer ses propres pokémons customs.

---

## 👥 Binôme

- **Santos** 
- **Neil**

---

## 🛠️ Technologies utilisées

| Côté | Technologie | Rôle |
|------|-------------|------|
| Frontend | React 18 + TypeScript | Interface utilisateur |
| Frontend | Vite | Bundler / serveur de dev |
| Frontend | CSS custom | Styles et responsive |
| Backend | Node.js + Express | Serveur API REST |
| Données | PokéAPI (pokeapi.co) | Source des pokémons officiels |
| Persistance | JSON (fichiers) | Sauvegarde équipe et pokémons custom |

---

## 📁 Structure du projet

```
fakedex/
├── backend/                        ← Serveur Express
│   ├── server.js                   ← Point d'entrée du serveur
│   ├── package.json
│   ├── routes/
│   │   ├── pokemon.js              ← Routes CRUD pokémons
│   │   └── team.js                 ← Routes CRUD équipe
│   └── data/
│       ├── cache.json              ← 151 pokémons mis en cache (auto-généré)
│       ├── custom_pokemon.json     ← Pokémons créés par l'utilisateur
│       └── team.json               ← Équipe sauvegardée
│
└── src/                            ← Frontend React + TypeScript
    ├── main.tsx                    ← Point d'entrée React
    ├── App.tsx                     ← Composant principal + logique globale
    ├── App.css                     ← Styles globaux + responsive
    ├── services/
    │   └── api.ts                  ← Toutes les fonctions d'appel au backend
    └── components/
        ├── PokemonCard.tsx         ← Carte d'un pokémon dans la grille
        ├── PokemonList.tsx         ← Grille de pokémons filtrée
        ├── PokemonDetail.tsx       ← Fiche détaillée (stats, moves, évolutions)
        ├── SearchBar.tsx           ← Barre de recherche par nom/numéro
        ├── TypeFilter.tsx          ← Filtre par type de pokémon
        ├── TeamBuilder.tsx         ← Gestion de l'equipe de 6
        └── CreatePokemon.tsx       ← Formulaire de création + historique
```

---

## 🚀 Lancer le projet

### Prérequis
- **Node.js** v18 
- **npm** installé

### Étape 1 — Lancer le backend

```bash
cd backend
npm install
npm run dev
```

✅ Le serveur démarre sur **http://localhost:3001**

> ⚠️ La première fois, le backend va chercher les 151 pokémons sur pokeapi.co. Ensuite, les données sont mises en cache et le chargement est instantané.

PS: c'ets normal si les 1er pokemons n'ont pas de sens, genre bulbisare avec un type flying. Petit problème qui vient directement de l'API.

### Étape 2 — Lancer le frontend (dans un nouveau terminal)

```bash
# depuis la racine du projet
npm install
npm run dev
```

✅ L'application est accessible sur **http://localhost:5173**

---

## 🛣️ Routes API

### Pokémons

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/pokemons` | Retourne tous les pokémons (cache + custom) |
| `GET` | `/api/pokemons/custom` | Retourne uniquement les pokémons custom |
| `GET` | `/api/pokemons/refresh` | Force le rechargement depuis pokeapi.co |
| `POST` | `/api/pokemons` | Crée un nouveau pokémon custom |
| `DELETE` | `/api/pokemons/:id` | Supprime un pokémon custom |

### Équipe

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/team` | Retourne l'équipe sauvegardée |
| `POST` | `/api/team` | Ajoute un pokémon à l'équipe |
| `DELETE` | `/api/team/:id` | Retire un pokémon de l'équipe |
| `DELETE` | `/api/team` | Vide toute l'équipe |

---

## ✨ Fonctionnalités

### Pokédex
- 📋 **Liste des 151 pokémons** de la génération 1 (chargés depuis pokeapi.co et mis en cache)
- 🔍 **Recherche** par nom ou numéro
- 🏷️ **Filtre par type** (18 types disponibles)
- 🔀 **Pokémon aléatoire** — sélectionne un pokémon au hasard
- 📊 **Fiche détaillée** avec :
  - Stats (PV, ATK, DEF, SP.ATK, SP.DEF, VIT)
  - Moves (4 attaques)
  - Chaîne d'évolution

### Équipe
- ⚔️ **Construire une équipe** de 1 à 6 pokémons
- 💾 **Équipe persistante** — sauvegardée côté backend, conservée entre les sessions
- 📈 **Analyse de l'équipe** — types représentés et statistiques totales/moyennes
- ❌ **Retirer un pokémon** de l'équipe

### Création
- ✦ **Créer un pokémon custom** — nom, type, image, stats
- 🗂️ **Historique** des pokémons créés
- 🗑️ **Supprimer** un pokémon custom
- 💾 **Persistance** — les pokémons custom sont sauvegardés coté backend

---


### Fonctionnement du cache

```
1ère visite :
React → backend → pokeapi.co → 151 pokémons → cache.json → réponse

Visites suivantes :
React → backend → cache.json → réponse 
```

### Flux de données

```
React (src/services/api.ts)
        ↓  fetch()
Express (backend/server.js)
        ↓  lecture/écriture
Fichiers JSON (backend/data/)
```

---

## 📱 Responsive

L'application est adaptée aux différentes tailles d'écran :
- 🖥️ **Desktop** — layout en grille avec panneau de détail
- 📱 **Mobile** — layout en colonne, navigation simplifiée
