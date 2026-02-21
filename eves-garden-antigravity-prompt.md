# Eve's Garden — Antigravity Prompt

## Project Setup Prompt

Paste this as your first task in Antigravity's Agent Manager:

---

## Prompt 1: Project Scaffold

```
Create a Next.js 15 (App Router, TypeScript, Tailwind CSS v4) project called "Eve's Garden" — an isometric 3D web game with a character design system.

Tech stack:
- Next.js 15 with App Router and Turbopack
- TypeScript (strict mode)
- React Three Fiber v9 (@react-three/fiber) + Drei (@react-three/drei)
- Three.js
- Zustand v5 for state management
- Tailwind CSS v4
- GSAP for advanced animations (optional)

Initialize the project with `npx create-next-app@latest` and install all dependencies. Set up the folder structure exactly as:

src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── three/          # R3F 3D scene components
│   │   ├── Scene.tsx
│   │   ├── Tiles.tsx
│   │   ├── Character.tsx
│   │   ├── Collectibles.tsx
│   │   └── Lighting.tsx
│   ├── ui/             # 2D overlay UI
│   │   ├── DesignPanel.tsx
│   │   ├── HUD.tsx
│   │   └── ColorSwatch.tsx
│   └── character/      # (future: character part components)
├── game/
│   ├── constants.ts
│   ├── pathfinding.ts
│   └── stores/
│       ├── game-store.ts
│       └── character-store.ts
├── hooks/
└── types/
    └── index.ts

Configure next.config.ts with `transpilePackages: ["three"]`.
Make sure all R3F components are "use client" and the main page uses dynamic import with `ssr: false` for the Scene component to avoid SSR issues with Three.js.
```

---

## Prompt 2: Game World (Tiles + Lighting)

```
Build the isometric 3D game world for Eve's Garden.

SCENE SETUP (src/components/three/Scene.tsx):
- R3F <Canvas> with orthographic camera (zoom: 75, position: [8, 10, 8], lookAt: [5, 0, 5])
- Enable shadows (PCFSoftShadowMap)
- ACESFilmicToneMapping with exposure 1.1
- Linear fog from the background color (#0a0a12)
- Dark background: #0a0a12

LIGHTING (src/components/three/Lighting.tsx):
- Ambient light: color #b8c0ff, intensity 0.5
- Main directional light: white, intensity 1.2, position [8, 12, 6], castShadow with 2048x2048 shadow map
- Rim light: color #a78bfa, intensity 0.4, position [-5, 5, -5]
- Point light: color #6c5ce7, intensity 0.6, distance 20, position [5, 4, 5]

TILE GRID (src/components/three/Tiles.tsx):
- Constants: TILE_SIZE = 1.1, TILE_GAP = 0.08, TILE_HEIGHT = 0.18
- Build tiles from this grid layout (1 = tile, 0 = empty):

  [0,0,0,1,1,1,0,0,0],
  [0,0,0,1,0,1,0,0,0],
  [0,1,1,1,0,1,1,1,0],
  [0,1,0,0,0,0,0,1,0],
  [1,1,0,0,1,0,0,1,1],
  [1,0,0,1,1,1,0,0,1],
  [1,1,0,0,1,0,0,1,1],
  [0,1,0,0,0,0,0,1,0],
  [0,1,1,1,0,1,1,1,0],
  [0,0,0,1,0,1,0,0,0],
  [0,0,0,1,1,1,0,0,0],

- Each tile is a BoxGeometry with top face colored #3d3080 (purple) and sides #2a2050 (darker)
- Add EdgesGeometry line segments on each tile with color #6c5ce7 at 25% opacity for glow effect
- On hover: show a highlight tile (semi-transparent #a78bfa mesh) that pulses opacity using useFrame
- On click: trigger pathfinding movement (connect to game store later)
- Tiles should receiveShadow

Style: dark, moody, neon-purple isometric playground — like Spline's landing page aesthetic.
```

---

## Prompt 3: Character System

```
Build a fully customizable voxel character for Eve's Garden using declarative R3F JSX (NOT imperative Three.js).

CHARACTER (src/components/three/Character.tsx):
Build a cute low-poly character from primitive geometries:

BODY PARTS (all as separate React components):
- Head: SphereGeometry(0.2, 12, 10), scaled [1, 1.05, 0.95], position y=0.78
- Hair: SphereGeometry(0.21) with thetaLength=PI*0.55 (half sphere cap), position y=0.82
- Eyes: Two white spheres (0.045 radius) with dark pupils (0.035) at x=±0.065, z=0.16-0.19
- Mouth: TorusGeometry(0.04, 0.012) showing a smile, flipped with rotation.x=PI
- Body: BoxGeometry(0.4, 0.35, 0.25) at y=0.42
- Pants: Box at y=0.2 + two leg boxes at x=±0.1
- Shoes: BoxGeometry(0.16, 0.08, 0.22) at y=-0.02
- Arms: Two BoxGeometry(0.1, 0.3, 0.1) at x=±0.26, y=0.38

ACCESSORIES (conditional rendering based on config.accessory):
- "glasses": Two TorusGeometry rings at eye positions + bridge box
- "backpack": Box behind body (z=-0.18) with two strap boxes
- "hat": CylinderGeometry top + flat brim disk

CHARACTER ANIMATION (useFrame):
- When moving: arms swing (rotation.x oscillates with sin(time*8)), character hops between tiles (y = sin(progress*PI) * 0.2)
- When idle: gentle vertical bob (sin(time*2) * 0.03)
- Face movement direction using atan2

CUSTOMIZATION OPTIONS (all driven by Zustand character-store):
- Skin tones: ["#ffdbac", "#f1c27d", "#e0a370", "#c68642", "#8d5524", "#614335"]
- Hair: ["#6d4c2a", "#2d1b0e", "#d4a46a", "#c0392b", "#1a1a2e", "#f39c12"]
- Outfit: ["#5b7db1", "#e17055", "#00b894", "#fdcb6e", "#a29bfe", "#fd79a8", "#2d3436", "#dfe6e9"]
- Pants: ["#7f8c8d", "#6d4c2a", "#2d3436", "#0984e3", "#b2bec3", "#636e72"]
- Shoes: ["#ffeaa7", "#dfe6e9", "#e17055", "#2d3436", "#a29bfe", "#00b894"]
- Accessories: glasses | backpack | hat | none

Character config should update in real-time when the user changes colors in the design panel.
Group scale: [0.85, 0.85, 0.85]
Player starts at grid position {x: 4, z: 4}.
```

---

## Prompt 4: Collectibles + Pathfinding

```
Build the collectible items and BFS pathfinding system for Eve's Garden.

PATHFINDING (src/game/pathfinding.ts):
- Implement BFS (Breadth-First Search) on the tile grid
- Input: start position, end position, tile layout grid
- Output: array of GridPosition steps (excluding start, including end), or null if unreachable
- Directions: 4-way (up, down, left, right), no diagonals

COLLECTIBLES (src/components/three/Collectibles.tsx):
4 types of collectibles placed on the grid:

  Tree (10 pts): CylinderGeometry trunk + ConeGeometry(0.18, 0.35, 6) green foliage, emissive green glow
  Gem (25 pts): OctahedronGeometry(0.12), yellow #f1c40f, metallic with emissive glow
  Crystal (50 pts): OctahedronGeometry(0.1) scaled [0.8, 1.4, 0.8], pink #e84393, transparent
  Orb (15 pts): SphereGeometry(0.1), blue #0984e3, transparent with emissive glow

Spawn positions:
  {x:3, z:0, type:"gem"}, {x:5, z:0, type:"orb"},
  {x:1, z:2, type:"crystal"}, {x:7, z:2, type:"tree"},
  {x:0, z:4, type:"gem"}, {x:8, z:4, type:"orb"},
  {x:3, z:5, type:"tree"}, {x:5, z:5, type:"crystal"},
  {x:0, z:6, type:"gem"}, {x:8, z:6, type:"tree"},
  {x:1, z:8, type:"orb"}, {x:7, z:8, type:"crystal"},
  {x:4, z:10, type:"gem"}

ANIMATIONS:
- All collectibles rotate slowly (rotation.y += 0.02 per frame)
- Float up and down: y = TILE_HEIGHT + sin(time*2 + index) * 0.06
- On collection: spawn 10 particle spheres that burst outward with random velocities, fade out over 0.5s, then remove
- Collected items become invisible

MOVEMENT:
- On tile click → run BFS from player position to clicked tile
- Move character along the path, one step at a time
- Speed: 3.5 steps/second
- At each step, check if a collectible exists at that tile → collect it
- When all 13 items collected → set phase to "won"

Use Zustand game-store for: score, collected set, player state (gridX, gridZ, isMoving, movePath), game phase.
```

---

## Prompt 5: UI — Design Panel + HUD

```
Build the overlay UI for Eve's Garden: a Spline-inspired character design panel and game HUD.

DESIGN PANEL (src/components/ui/DesignPanel.tsx):
A right-side panel (300px wide) that slides in/out, inspired by Spline's property panel.

Structure:
- Header: "Character Design" title + "Customize your player" subtitle + 🧑 icon
- Divider line
- Sections with uppercase 10px label headers:
  - "SKIN TONE" → 6 color swatches in a row
  - "HAIR" → 6 color swatches
  - "OUTFIT" → 8 color swatches
  - "PANTS" → 6 color swatches
  - "SHOES" → 6 color swatches
  - "ACCESSORIES" → 4 pill buttons (👓 Glasses, 🎒 Backpack, 🧢 Hat, ✕ None)
- Divider
- "COLLECTIBLES" legend: icon + name + points for each type
- Footer: "Eve's Garden — Built with R3F + Drei + Zustand"

Color swatches: 28px rounded squares, selected state has #a78bfa border + glow shadow + scale(1.1)
Panel background: #111119 with #1c1c2e border
Animate width from 0 to 300px on toggle

HUD (src/components/ui/HUD.tsx):
Floating glass-morphism overlays (background rgba(17,17,25,0.85), backdrop-filter blur(12px)):

- Top-left: Score badge (⭐ + score in JetBrains Mono bold) + Progress badge (collected/total + thin progress bar)
- Top-right: 🎨 toggle button that moves with panel state (right: panelOpen ? 316px : 16px)
- Bottom-center: "🖱️ Click a tile to move" hint (pulsing opacity animation), hidden after first move
- Win overlay: centered card with 🎉, "All Collected!", score display, "Play Again" button

COLOR SYSTEM (CSS variables in globals.css):
  --color-bg: #0a0a12
  --color-panel: #111119
  --color-panel-border: #1c1c2e
  --color-accent: #7c5cfc
  --color-accent-glow: #a78bfa
  --color-text: #e2e2f0
  --color-text-dim: #6b6b88

Fonts: "DM Sans" for UI, "JetBrains Mono" for numbers/scores (import from Google Fonts)

The panel connects to the Zustand character-store. Every swatch click calls updateConfig(key, value) which instantly updates the 3D character.
```

---

## Prompt 6: Visual Polish (Post-Processing & Audio)

```
Add visual flair and sound effects to make Eve's Garden feel more immersive.

POST-PROCESSING (src/components/three/Effects.tsx):
- Install and use `@react-three/postprocessing`
- Add `Bloom` (luminanceThreshold: 1, intensity: 1.5) to make the neon edges and collectibles glow.
- Add `DepthOfField` (focusDistance: 0, focalLength: 0.02, bokehScale: 2) to give the scene a miniature/toy aesthetic.

AUDIO SYSTEM (src/hooks/useAudio.ts):
- Implement a simple hook to play UI and game sounds (using HTML5 Audio or `howler`).
- Trigger 'pop' sound on UI swatch clicks.
- Trigger 'step' sound during character hopping.
- Trigger 'chime' sound on collecting items.
- Play a low-volume ambient looping synth pad in the background.

Connect the post-processing to `Scene.tsx` and integrate the audio hook in `Character.tsx`, `Tiles.tsx`, and `Collectibles.tsx`.
```

---

## Prompt 7: Camera Controls & Day/Night Cycle

```
Enhance the environment with dynamic elements and a user-controlled camera.

CAMERA (src/components/three/Scene.tsx):
- Add `OrbitControls` but restricted to maintain the isometric feel:
  - `enablePan={false}`
  - `minZoom={40}`, `maxZoom={120}`
  - `minPolarAngle={Math.PI / 4}`, `maxPolarAngle={Math.PI / 3}`
- Add a HUD button to rotate the board by 90-degree increments (azimuth angle snaps).

ENVIRONMENT TOGGLE (src/game/stores/game-store.ts & Lighting.tsx):
- Implement a Day/Night toggle state in the HUD.
- "Day" mode: 
  - Background/Fog: #e0e7ff
  - Ambient Light: #ffffff (intensity 0.8)
  - Directional Light: #fef08a (intensity 1.5)
- "Night" mode (default):
  - Background/Fog: #0a0a12
  - Ambient Light: #b8c0ff (intensity 0.5)
  - Directional Light: #a78bfa (intensity 0.8)
```

---

## Prompt 8: Progression & Unlockables

```
Give players a reason to collect items by adding a virtual economy.

STORE SYSTEM (src/game/stores/character-store.ts):
- Lock premium accessories (e.g., Golden Crown, Neon Aura, Jetpack) or rare colors.
- When clicking a locked color/accessory in the `DesignPanel.tsx`, show a modal: "Unlock for 100 points?"
- Deduct points upon purchase.
- Save character config and unlocked items to `localStorage` using Zustand's `persist` middleware.
```

---

## Tips for Antigravity

1. **Run prompts sequentially** — each builds on the previous
2. **After each prompt**, verify in browser that the 3D scene renders correctly
3. **If the agent gets stuck on Three.js SSR errors**, remind it: "Use dynamic import with ssr: false for the Scene component in page.tsx"
4. **If R3F types cause issues**, the agent should install `@types/three`
5. **Test character customization** by clicking swatches — changes should be instant in the 3D viewport
6. **Watch out for performance**: When adding Post-processing, ensure it's only rendered on supported devices.

---

## Quick Reference: Key Files

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Main page with dynamic Scene import + HUD + DesignPanel |
| `src/components/three/Scene.tsx` | R3F Canvas, camera, fog |
| `src/components/three/Tiles.tsx` | Isometric grid with click-to-move |
| `src/components/three/Character.tsx` | Voxel character with all customizable parts |
| `src/components/three/Collectibles.tsx` | Floating items + particles |
| `src/components/three/Effects.tsx` | Post-processing pipeline (bloom, depth of field) |
| `src/components/three/Lighting.tsx` | Day/night cycle lighting |
| `src/hooks/useAudio.ts` | Sound effect management |
| `src/game/constants.ts` | All colors, grid layout, character options |
| `src/game/pathfinding.ts` | BFS algorithm |
| `src/game/stores/game-store.ts` | Zustand: score, movement, phase |
| `src/game/stores/character-store.ts` | Zustand: character customization + unlocked items |
