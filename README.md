# 🌿 Eve's Garden

An isometric 3D web game with a character design system, built with Next.js, React Three Fiber, and Drei.

## ✨ Features

- **Isometric 3D Playground** — Purple/blue glowing tile grid with edge glow lines
- **Click-to-Move** — BFS pathfinding across the tile grid
- **Character Design System** — Customize skin tone, hair, outfit, pants, shoes, and accessories in real-time
- **Collectibles** — Trees (10pts), Orbs (15pts), Gems (25pts), Crystals (50pts)
- **Animations** — Character hop, arm swing, collectible rotation/float, particle bursts
- **Spline-Inspired UI** — Right sidebar design panel with swatch pickers

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main game page
│   └── globals.css         # Tailwind + custom properties
├── components/
│   ├── three/              # R3F scene components
│   │   ├── Scene.tsx       # Canvas + camera setup
│   │   ├── Tiles.tsx       # Isometric tile grid
│   │   ├── Character.tsx   # Voxel character (declarative R3F)
│   │   ├── Collectibles.tsx # Floating items + particles
│   │   └── Lighting.tsx    # Scene lighting
│   └── ui/                 # Overlay UI
│       ├── DesignPanel.tsx  # Character customization sidebar
│       ├── HUD.tsx          # Score, progress, hints
│       └── ColorSwatch.tsx  # Reusable swatch component
├── game/                   # Game logic
│   ├── constants.ts        # All config, colors, map, options
│   ├── pathfinding.ts      # BFS algorithm
│   └── stores/
│       ├── game-store.ts   # Score, movement, collected
│       └── character-store.ts # Customization state
└── types/
    └── index.ts            # Shared TypeScript types
```

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15 (App Router, Turbopack) |
| 3D Engine | Three.js via React Three Fiber v9 |
| 3D Helpers | @react-three/drei |
| State | Zustand v5 |
| Styling | Tailwind CSS v4 |
| Language | TypeScript |

## 🗺️ Roadmap

- [ ] Orbit camera controls (Drei `<OrbitControls>`)
- [ ] Sound effects (Howler.js or Tone.js)
- [ ] GLTF character models (replace voxel primitives)
- [ ] Level system with multiple maps
- [ ] Physics with @react-three/rapier
- [ ] Post-processing effects (bloom, SSAO)
- [ ] Mobile touch controls
- [ ] Leaderboard / score persistence
