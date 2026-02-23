# Sky Islands: Letter Crash — Development Blueprint

> **Project:** Eve's Garden → Sky Islands: Letter Crash
> **Stack:** Next.js 15 · React 19 · React Three Fiber · Rapier Physics · Zustand · Blender · TypeScript
> **Target Audience:** 3–5 year olds
> **Design Language:** Toca Boca / Bluey — bright, chunky, rounded, zero-stress

---

## Game Vision

A toddler-friendly 3D driving game on floating sky islands. The player drives a car around a colorful island, types any word (or a parent types it), and giant 3D letter blocks physically spawn across the world. Drive into each letter to trigger a random surprise — explosions, silly enemies, portals to other dimensions, animals popping out. Every word is a new adventure. No fail states. No enemies that hurt. Just chaos, color, and wonder.

**Core Mechanic:** `Type → Spawn → Drive → Crash → Surprise → Repeat`

---

## Architecture Overview

```
src/
├── app/
│   ├── page.tsx                     # Original Eve's Garden (preserved)
│   └── letter-crash/
│       └── page.tsx                 # Sky Islands entry point
│
├── components/
│   ├── three/
│   │   ├── LetterCrashScene.tsx     # Main scene compositor
│   │   ├── Car.tsx                  # WASD-driven vehicle
│   │   ├── Island.tsx               # Floating island terrain
│   │   ├── LetterBlocks.tsx         # 3D letter spawning + collision
│   │   ├── LetterEffects.tsx        # Hit effects (explosions, portals...)
│   │   ├── DimensionSky.tsx         # Per-dimension sky/environment
│   │   ├── IslandDecorations.tsx    # Trees, flowers, rocks per dimension
│   │   └── NPCs.tsx                 # Friendly characters on islands
│   │
│   └── ui/
│       ├── WordInput.tsx            # Bottom word input overlay
│       ├── LetterHUD.tsx            # Score, dimension, letter tracker
│       ├── DimensionTransition.tsx  # Full-screen warp animation
│       └── ParentPanel.tsx          # Settings for parents
│
├── game/
│   ├── stores/
│   │   └── letter-crash-store.ts   # All game state
│   ├── events/
│   │   ├── event-registry.ts       # Letter event definitions + weights
│   │   ├── explosion.ts            # Explosion behavior
│   │   ├── portal.ts               # Dimension warp logic
│   │   ├── animal-spawn.ts         # Animal transform behavior
│   │   └── star-shower.ts          # Falling stars behavior
│   ├── dimensions/
│   │   └── themes.ts               # All dimension configs (sky, ground, fog, music)
│   └── audio/
│       └── sound-manager.ts        # Howler.js sound management
│
├── types/
│   └── letter-crash.ts             # All game types
│
└── public/
    ├── models/                     # GLB models from Blender
    │   ├── car.glb
    │   ├── letters/                # A.glb through Z.glb
    │   ├── animals/                # bear.glb, cat.glb, etc.
    │   ├── npcs/                   # Friendly island characters
    │   └── decorations/            # Trees, rocks, flowers per dimension
    └── sounds/                     # Audio files
        ├── crash.mp3
        ├── portal.mp3
        ├── star.mp3
        └── dimensions/             # Per-dimension ambient music
```

---

## Phase 1 — Drivable Prototype

**Goal:** Car driving on an island, letters spawn, basic collision detection. Prove the core loop works.

**Status: ✅ Built — files delivered**

### 1.1 Car Controller
- `Car.tsx` — Procedural low-poly car mesh (body, roof, wheels, headlights)
- WASD movement with Shift boost
- Rapier kinematic body for physics collision
- Circular island boundary clamping
- Squash & stretch on speed, tilt on turns
- Camera auto-follow behind car with spring damping
- Input guard: stops car controls when typing in the word input

### 1.2 Floating Island
- `Island.tsx` — Cylindrical ground surface + tapered underside + rocky bottom tip
- Ring of trees around edge (14 procedural trees with sway animation)
- Scattered flowers with bob animation
- Edge rim glow
- Ground color lerps between dimensions

### 1.3 Letter Block Spawning
- `LetterBlocks.tsx` — Type a word → 3D blocks scatter across island
- Canvas texture for letter faces on both sides of block
- Staggered spawn animation (scale-in with bounce)
- Rapier fixed body per letter, `onCollisionEnter` detects car hit
- Hit animation: fly upward + spin + scale to zero
- Random color per letter from the game palette

### 1.4 Basic Effects
- `LetterEffects.tsx` — 6 effect types rendered when letters are hit:
  - **Explosion** — instanced particle burst with gravity falloff
  - **Portal** — spinning concentric rings with glow light
  - **Star Shower** — instanced octahedrons falling from above
  - **Animal** — bouncy green critter with googly eyes
  - **Enemy** — wobbly purple blob (harmless, silly)
  - **Music** — floating musical note that drifts upward
- Effects self-remove after 3 seconds

### 1.5 Dimension Warping
- `letter-crash-store.ts` — 6 dimensions (Home, Candy, Space, Ocean, Volcano, Cloud)
- Each dimension has: sky color, ground color, fog settings, ambient intensity, particle color
- Portal event triggers random dimension warp after 800ms delay
- Sky, ground, and fog lerp smoothly between dimensions
- Floating ambient particles change color per dimension

### 1.6 UI Overlay
- `WordInput.tsx` — Bottom-center text input + GO button
- Top HUD: dimension indicator (emoji + name) and score/hits counter
- Letter tracker: shows each letter as a tile, fills with event icon when hit
- "ALL CLEAR" celebration when all letters smashed
- WASD + Shift key hints in bottom corners

### What to Verify After Phase 1
- [ ] `npm run dev` → navigate to `/letter-crash`
- [ ] Car drives with WASD, boosts with Shift
- [ ] Type a word → letters appear scattered on island
- [ ] Drive into a letter → it disappears with an effect
- [ ] Portal letter changes the world colors
- [ ] Camera follows the car smoothly
- [ ] Typing in input doesn't move the car

---

## Phase 2 — Blender Models & Visual Polish

**Goal:** Replace all procedural meshes with proper Blender GLB models. Add post-processing and particle systems.

### 2.1 Blender Model Pipeline

**Car Model (`car.glb`)**
- Chunky proportions — oversized wheels, rounded body, big headlights
- Vertex colors or 2-3 simple materials (body, wheels, windows)
- ~500-800 faces — low-poly but recognizable
- Origin at center-bottom for correct ground placement
- Include simple wheel objects for spin animation

**Letter Models (`letters/A.glb` — `letters/Z.glb`)**
- Extruded 3D text, Fredoka-style rounded font
- Each letter is its own GLB, ~200-400 faces
- Origin at center for easy positioning
- Beveled edges for that chunky toy-block feel
- Alternative: single `alphabet.glb` with each letter as a named mesh

**Animal Models (one per letter that has an animal)**
- `bear.glb` — B is for Bear
- `cat.glb` — C is for Cat
- `dog.glb` — D is for Dog
- `elephant.glb` — E is for Elephant
- `fish.glb` — F is for Fish
- `giraffe.glb` — G is for Giraffe
- (extend to full alphabet over time)
- Style: Toca Boca chunky, ~300-600 faces each
- Simple idle animation baked in (head bob or tail wag, 2-3 second loop)

**Decoration Sets (per dimension)**
| Dimension | Trees | Rocks | Props |
|-----------|-------|-------|-------|
| Home | Round oak trees | Mossy boulders | Picket fence, mailbox |
| Candy | Lollipop trees | Gummy rocks | Candy cane posts |
| Space | Crystal spires | Asteroids | Satellite dish, flag |
| Ocean | Coral branches | Shells | Anchor, treasure chest |
| Volcano | Charred stumps | Obsidian shards | Lava lamp rocks |
| Cloud | Cloud pillars | Fluffy rocks | Rainbow arches |

**Blender Workflow**
1. Model in Blender with low-poly style
2. Apply vertex colors OR simple materials (max 2-3 per model)
3. Export as GLB with Draco compression
4. Place in `public/models/`
5. Load in R3F with `useGLTF` + `useGLTF.preload`

### 2.2 Model Integration
- Replace `CarBody()` procedural mesh → `useGLTF("/models/car.glb")`
- Replace canvas texture letters → individual letter GLBs
- Replace procedural trees → per-dimension GLB decoration sets
- Replace procedural animal/enemy → GLB models with baked animation

### 2.3 Post-Processing
- Add `@react-three/postprocessing` (already in dependencies)
- **Bloom** — luminanceThreshold: 0.8, intensity: 0.8 (makes letter blocks and effects glow)
- **Vignette** — subtle darkening at edges for focus
- **ChromaticAberration** — very subtle (0.002) for dimension warps, ease in/out
- Skip depth of field (can cause motion sickness for young children)

### 2.4 Enhanced Particles
- Replace instanced mesh particles → drei `<Sparkles>` for ambient
- Car exhaust/dust trail: small particle system behind car when moving
- Letter spawn: dust poof particles at base when block appears
- Dimension warp: screen-filling particle burst during transition

### 2.5 Shadows & Lighting Polish
- Soft shadows on island surface from all objects
- Per-dimension sun position and color temperature
- Rim light on car for visual pop
- Letter blocks cast colored light on nearby ground (point light matching block color)

### Deliverables
- [ ] Blender source file with all models
- [ ] Exported GLBs in `public/models/`
- [ ] Updated components using `useGLTF`
- [ ] Post-processing pipeline
- [ ] Enhanced particle systems

---

## Phase 3 — Sound, Music & Haptics

**Goal:** Make every interaction satisfying with audio feedback. Kids are driven by sensory reward.

### 3.1 Sound Effects (Howler.js)

| Trigger | Sound | Description |
|---------|-------|-------------|
| Car engine idle | `engine-idle.mp3` | Low, gentle hum. Loops. |
| Car accelerate | `engine-rev.mp3` | Pitch up on Shift boost |
| Car turn | `tire-squeak.mp3` | Quick, soft squeak |
| Letter spawn (each) | `pop-{1-3}.mp3` | Staggered pops (3 variations) |
| Letter hit: Explosion | `boom-cartoon.mp3` | Cartoony, non-scary |
| Letter hit: Portal | `whoosh-magic.mp3` | Swirling, ascending |
| Letter hit: Stars | `chime-cascade.mp3` | Descending sparkle notes |
| Letter hit: Animal | `animal-{type}.mp3` | "Moo", "Meow", "Woof" etc. |
| Letter hit: Enemy | `boing-silly.mp3` | Rubber bounce |
| Letter hit: Music | `note-{C-B}.mp3` | Musical note matching the letter's position |
| All clear | `fanfare.mp3` | Celebratory jingle |
| Dimension warp | `dimension-warp.mp3` | Dramatic whoosh + arrival chime |
| UI: type letter | `key-click.mp3` | Soft mechanical key |
| UI: submit word | `whoosh-send.mp3` | Swoosh out |

### 3.2 Ambient Music (per dimension)

Each dimension has its own looping background track (30-60 seconds, seamless loop). Crossfade between tracks on dimension warp.

| Dimension | Music Vibe |
|-----------|-----------|
| Home | Cheerful ukulele + xylophone |
| Candy | Playful music box + synth bells |
| Space | Ambient pads + soft theremin |
| Ocean | Gentle waves + soft marimba |
| Volcano | Deep drums + warm brass |
| Cloud | Dreamy harp + wind chimes |

Source: Royalty-free kids music or AI-generated with Suno/Udio.

### 3.3 Sound Manager Implementation
```typescript
// src/game/audio/sound-manager.ts
// Singleton Howler-based manager
// - Preloads all sounds on first interaction (browser autoplay policy)
// - Pool system for rapid-fire sounds (3 instances per effect)
// - Master volume + per-category volume (SFX, Music, Ambient)
// - Spatial audio: sounds louder when closer to car (pan L/R)
```

### 3.4 Haptic Feedback (Mobile)
- Vibrate on letter hit: `navigator.vibrate(50)` — short tap
- Vibrate on dimension warp: `navigator.vibrate([100, 50, 200])` — pattern
- Vibrate on all clear: `navigator.vibrate([50, 30, 50, 30, 200])` — celebratory

### Deliverables
- [ ] All sound effect files in `public/sounds/`
- [ ] 6 ambient music tracks
- [ ] `SoundManager` class with preloading, pooling, spatial audio
- [ ] Haptic integration for mobile
- [ ] Parent panel volume controls

---

## Phase 4 — Letter-Animal Learning System

**Goal:** Sneak in alphabet learning. Each letter has a signature animal that appears when hit. Over time, kids associate letters with animals naturally.

### 4.1 Animal Registry

| Letter | Animal | Model | Sound |
|--------|--------|-------|-------|
| A | Alligator | `alligator.glb` | chomp |
| B | Bear | `bear.glb` | growl (cute) |
| C | Cat | `cat.glb` | meow |
| D | Dog | `dog.glb` | woof |
| E | Elephant | `elephant.glb` | trumpet |
| F | Frog | `frog.glb` | ribbit |
| G | Giraffe | `giraffe.glb` | soft hum |
| H | Horse | `horse.glb` | neigh |
| I | Iguana | `iguana.glb` | hiss (cute) |
| J | Jellyfish | `jellyfish.glb` | bloop |
| K | Koala | `koala.glb` | chirp |
| L | Lion | `lion.glb` | roar (cute) |
| M | Monkey | `monkey.glb` | ooh-ooh |
| N | Narwhal | `narwhal.glb` | splash |
| O | Owl | `owl.glb` | hoot |
| P | Penguin | `penguin.glb` | squawk |
| Q | Quail | `quail.glb` | tweet |
| R | Rabbit | `rabbit.glb` | squeak |
| S | Snake | `snake.glb` | hiss (silly) |
| T | Turtle | `turtle.glb` | soft pop |
| U | Unicorn | `unicorn.glb` | sparkle |
| V | Vulture | `vulture.glb` | caw |
| W | Whale | `whale.glb` | song |
| X | X-ray Fish | `xrayfish.glb` | bubble |
| Y | Yak | `yak.glb` | grunt |
| Z | Zebra | `zebra.glb` | whinny |

### 4.2 Animal Event Enhancement
When a letter triggers the "animal" event:
1. The letter block morphs (scale down letter, scale up animal)
2. A speech bubble appears: **"B is for Bear!"** (large, kid-readable text)
3. The animal does a cute animation (spin, jump, wave)
4. The animal's sound plays
5. After 3 seconds, the animal shrinks away with sparkles

### 4.3 Learning Mode (Parent Toggle)
When enabled in the parent panel:
- **Every** letter triggers its animal (not random events)
- Letters spawn in alphabetical order, not scattered
- A voice says the letter name (Web Speech API or pre-recorded)
- Progress tracker: which letters has the kid "learned" (hit 3+ times)

### 4.4 Word Suggestions
Pre-loaded word sets for parents who don't want to type:
- **Kid's name** (saved in settings)
- **Animals** — CAT, DOG, FISH, BEAR
- **Colors** — RED, BLUE, GREEN
- **Family** — MOM, DAD, BABY
- **Food** — APPLE, CAKE, MILK
- **Fun** — PLAY, JUMP, STAR
- Quick-tap buttons above the input field

### Deliverables
- [ ] 26 animal GLB models (chunky, friendly style)
- [ ] 26 animal sound effects
- [ ] Speech bubble UI component
- [ ] Learning mode toggle
- [ ] Word suggestion system
- [ ] Letter progress tracker

---

## Phase 5 — Multiple Islands & Bridge Building

**Goal:** Expand from one island to a sky archipelago. Drive across bridges to reach new themed islands.

### 5.1 Island Network

```
         [Ice Island]
              |
  [Jungle] - [HOME] - [Candy]
              |
         [Ocean Island]
              |
         [Space Island]
```

Each island is a separate R3F group that loads on demand. The home island is always loaded. Adjacent islands load when the bridge to them is unlocked.

### 5.2 Bridge System
- Bridges are procedural mesh paths connecting island edges
- Bridges start invisible/broken
- **Unlock condition:** Spell a specific word related to the island theme
  - Jungle: spell "TREE" or "LEAF"
  - Candy: spell "CAKE" or "SWEET"
  - Ice: spell "SNOW" or "COLD"
  - Ocean: spell "FISH" or "WAVE"
  - Space: spell "STAR" or "MOON"
- When the word is completed (all letters hit), the bridge grows from one island to the next (animated: blocks appear one by one, rainbow trail)
- Driving across the bridge transitions the camera and loads the new island

### 5.3 Per-Island Content
Each island has:
- Unique ground material and decoration set
- Its own ambient music track
- Unique NPC character that gives the "unlock word" hint
- Unique letter block style (candy blocks on candy island, ice blocks on ice island, etc.)
- Unique set of events weighted differently (more portals on space island, more animals on jungle island)

### 5.4 Island Management
- `IslandManager` component handles loading/unloading
- Islands beyond draw distance are hidden
- LOD system: distant islands show as low-detail silhouettes
- Bridge driving: car controller switches to rail-follow mode on bridges

### Deliverables
- [ ] 5 additional themed islands (geometry + decorations)
- [ ] Bridge mesh generator with grow animation
- [ ] Island unlock word system
- [ ] NPC hint characters per island
- [ ] Island manager with LOD
- [ ] Bridge driving rail system

---

## Phase 6 — Home Island Customization

**Goal:** Give kids ownership. Rewards from exploring let them build and decorate their home island.

### 6.1 Reward Currency
- **Stars** — earned from hitting letters (1 star per letter)
- **Gems** — earned from special events (portal = 3 gems, all-clear = 5 gems)
- Stars buy decorations, gems buy premium items

### 6.2 Decoration Shop
Categories of placeable items:

| Category | Items | Cost |
|----------|-------|------|
| Trees | Oak, Palm, Cherry Blossom, Cactus, Pine | 5-15 ⭐ |
| Flowers | Daisy, Sunflower, Rose, Tulip | 3-8 ⭐ |
| Buildings | Treehouse, Windmill, Lighthouse, Castle | 20-50 ⭐ |
| Animals | Cat, Dog, Bunny, Duckling (walk around!) | 15-30 ⭐ |
| Fun | Trampoline, Slide, Swing, Fountain | 10-25 ⭐ |
| Vehicles | Boat, Helicopter, Train | 25-40 💎 |
| Magic | Rainbow, Shooting Star, Fairy Lights | 15-30 💎 |

### 6.3 Placement System
- Open build mode from HUD button
- Tap an item from inventory → drag to place on home island
- Snap to grid (1 unit squares) or free placement
- Items can be rotated (90° increments) and picked up/moved
- Placed items have idle animations (windmill spins, animals wander, fountain sprays)

### 6.4 Persistence
- Save home island layout to `localStorage` (Zustand persist)
- Future: cloud save with Supabase for cross-device play
- Export: screenshot of your island to share

### Deliverables
- [ ] Star + gem currency system
- [ ] Decoration shop UI
- [ ] Drag-and-drop placement system
- [ ] Grid snapping and rotation
- [ ] Idle animations for placed items
- [ ] localStorage persistence
- [ ] Build mode toggle

---

## Phase 7 — Mobile & Touch Controls

**Goal:** Make it work perfectly on tablets and phones. Most 3-5 year olds play on iPads.

### 7.1 Touch Controls
- Replace WASD with a virtual joystick (nipple.js or custom)
  - Left thumb: joystick for steering
  - Right thumb: tap anywhere = boost
- Joystick positioned in bottom-left, semi-transparent
- Auto-hide joystick when not touching

### 7.2 Word Input (Mobile)
- Large, colorful on-screen keyboard (not the system keyboard)
- Letters are big (56px+ touch targets), spaced generously
- Tap a letter → it appears in the word bar with a pop animation
- "GO" button is large and red
- Quick-word buttons above keyboard for common words

### 7.3 Responsive Layout
- Canvas fills full viewport on all devices
- HUD elements scale with viewport (CSS clamp())
- Touch targets minimum 48x48px (accessibility standard)
- No hover states — all interactions are tap-based
- Portrait and landscape support (camera adjusts)

### 7.4 Performance (Mobile)
- Reduce shadow map to 512x512 on mobile
- Disable post-processing on low-end devices
- Reduce particle counts by 50%
- Use `useDetectGPU` from drei for automatic quality scaling
- Target: 30fps minimum on iPad Air 4+

### 7.5 PWA / Capacitor
- `next-pwa` for installable web app (add to home screen)
- Future: Capacitor wrapper for App Store / Google Play
- Offline support: cache all models and sounds with service worker

### Deliverables
- [ ] Virtual joystick component
- [ ] Custom on-screen keyboard
- [ ] Responsive HUD layout
- [ ] Mobile performance optimizations
- [ ] PWA manifest + service worker
- [ ] Touch event handling throughout

---

## Phase 8 — Multiplayer & Sharing

**Goal:** Let siblings or friends play together, and let kids share their creations.

### 8.1 Local Co-op (Same Screen)
- Split screen: two cars on the same island
- Player 1: WASD + Shift
- Player 2: Arrow keys + Space
- Each player's letters are a different color
- Shared score — encourages cooperation, not competition
- "Help your friend hit their letters!"

### 8.2 Photo Mode
- Pause button → freeze the scene
- Free camera orbit
- Emoji stamps / stickers overlay
- Screenshot → downloads as PNG
- Frame options: polaroid, postcard, birthday card

### 8.3 Replay System
- Record last 10 seconds of gameplay
- Export as short GIF or video clip
- Share to parents' phone via QR code or direct download

### 8.4 Cloud Features (Future — Supabase)
- Save game progress (unlocked islands, decorations, stars)
- Leaderboard: most letters crashed today (friendly, no rankings — just fun stats)
- Share your island: generate a link that shows your home island in view-only mode

### Deliverables
- [ ] Split-screen co-op mode
- [ ] Photo mode with stickers
- [ ] GIF replay capture
- [ ] Cloud save with Supabase
- [ ] Island sharing links

---

## Phase 9 — Advanced Events & Mini-Games

**Goal:** Deepen the surprise system. Some letter events trigger short interactive mini-games.

### 9.1 Mini-Game Events
These replace the "instant effect" with a 15-30 second interactive moment:

**🎯 Target Practice**
- 5 floating targets appear in the sky
- Drive through them before they disappear
- Reward: bonus stars

**🏎️ Speed Ring Challenge**
- A series of glowing rings appears in a path
- Drive through all rings within the time limit
- Reward: speed boost for 10 seconds

**🎨 Color Match**
- 4 colored platforms light up in sequence
- Drive to each color in the right order
- Reward: unlock a new decoration color

**🎵 Music Maker**
- 7 musical blocks appear (do re mi fa sol la ti)
- Drive through them in order to play a song
- Drive through in any order for freestyle
- Reward: new ambient music unlocked

**🏗️ Quick Build**
- 3 pieces spawn on the island (roof, walls, door)
- Drive them to the build site in the right order
- A little house assembles itself
- Reward: the house is added to your home island

### 9.2 Event Weighting System
Events become smarter over time:
- Track which events the kid has seen recently
- Reduce weight for repeated events
- Increase weight for unseen events
- Portal events become rarer if the kid seems disoriented by warps
- Learning events weighted higher if learning mode is on

### 9.3 Seasonal / Time-Based Events
- **Morning play** → Sunny sky, cheerful music
- **Evening play** → Sunset colors, calmer music
- **Holidays** → Special themed letter blocks (pumpkins for Halloween, snowflakes for winter)
- **Birthday mode** → Parent sets birthday, special effects and decorations on that day

### Deliverables
- [ ] 5 mini-game implementations
- [ ] Smart event weighting system
- [ ] Time-of-day theming
- [ ] Seasonal event system
- [ ] Birthday mode

---

## Phase 10 — Accessibility, Analytics & Parent Dashboard

**Goal:** Make the game inclusive and give parents insight into their child's play.

### 10.1 Accessibility
- **Color-blind modes:** Deuteranopia, Protanopia, Tritanopia filter options
- **High contrast mode:** Bold outlines on all interactive elements
- **Screen reader:** ARIA labels on all UI elements (for parent settings screens)
- **Motor accessibility:** Auto-drive mode (car moves forward automatically, kid just steers)
- **Switch access:** Single-button mode where car auto-drives and tap triggers interactions
- **Text size:** Scalable UI text (120%, 150%, 200%)

### 10.2 Parent Dashboard
Accessible via a PIN-protected settings panel:

**Play Stats**
- Total play time today / this week
- Letters crashed
- Words typed
- Dimensions visited
- Most-typed word

**Learning Progress**
- Which letters have been learned (hit 3+ times with animal trigger)
- Alphabet completion percentage
- Visualization: alphabet grid with green checkmarks

**Settings**
- Sound volume (Master, SFX, Music)
- Difficulty presets (Easy: bigger blocks, slower car / Normal / Explorer: more dimensions)
- Time limit: auto-pause after X minutes
- Content toggles: enable/disable specific dimensions or events
- Learning mode on/off

### 10.3 Analytics (Privacy-First)
- All analytics stored locally (no cloud tracking for kids)
- Optional: parent can email themselves a weekly progress report
- Data format: simple JSON in localStorage, exportable
- Never collect personal information from the child

### Deliverables
- [ ] Color-blind mode shader/filter
- [ ] High contrast mode
- [ ] Auto-drive accessibility mode
- [ ] Parent dashboard with PIN gate
- [ ] Play stats tracking
- [ ] Learning progress visualization
- [ ] Time limit system
- [ ] Privacy-first local analytics

---

## Appendix A — Color System

### Base Palette

| Name | Hex | Usage |
|------|-----|-------|
| Sky Blue | `#7EC8E3` | Primary sky, UI accents |
| Sunshine | `#FFD93D` | Stars, rewards, highlights |
| Coral Pop | `#FF6B6B` | Car body, action buttons, explosions |
| Leaf Green | `#6BCB77` | Nature, success, animals |
| Candy Pink | `#FF8BD0` | Fun accents, music events |
| Grape | `#957FEF` | Magic, portals, enemies |
| Ocean Teal | `#45B7D1` | Water, portals, ice |
| Cloud White | `#F8F9FA` | Backgrounds, clouds |
| Soft Navy | `#2C3E6B` | Text, contrast, UI panels |

### Per-Dimension Palettes

| Dimension | Sky | Ground | Fog | Accent |
|-----------|-----|--------|-----|--------|
| Home | `#87CEEB` | `#6BCB77` | `#B8E6FF` | `#FFD93D` |
| Candy | `#FFB6C1` | `#FF8BD0` | `#FFD6E8` | `#FF69B4` |
| Space | `#0a0a1a` | `#957FEF` | `#1a1a2e` | `#FFD93D` |
| Ocean | `#006994` | `#45B7D1` | `#0088AA` | `#00CED1` |
| Volcano | `#FF4500` | `#8B4513` | `#FF6347` | `#FF4500` |
| Cloud | `#E8F4FD` | `#D4E8F0` | `#F0F8FF` | `#87CEEB` |

---

## Appendix B — Event Probability Table

| Event | Weight | Chance | Effect Duration | Audio |
|-------|--------|--------|----------------|-------|
| Explosion | 30 | ~30% | 1.5s | boom-cartoon |
| Animal | 20 | ~20% | 3.0s | per-animal |
| Stars | 15 | ~15% | 2.0s | chime-cascade |
| Enemy | 15 | ~15% | 3.0s | boing-silly |
| Portal | 10 | ~10% | 2.0s + warp | whoosh-magic |
| Music | 10 | ~10% | 2.5s | musical-note |

---

## Appendix C — Technical Constraints

### Performance Targets
| Platform | FPS Target | Max Triangles | Shadow Map | Particles |
|----------|-----------|---------------|------------|-----------|
| Desktop (Chrome) | 60 | 100K | 2048 | Full |
| Tablet (iPad Air+) | 30 | 50K | 512 | 50% |
| Phone (iPhone 12+) | 30 | 30K | Off | 30% |

### Key Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| `@react-three/fiber` | ^9.0 | React renderer for Three.js |
| `@react-three/drei` | ^10.0 | R3F helpers |
| `@react-three/rapier` | ^2.2 | Physics engine |
| `@react-three/postprocessing` | ^3.0 | Visual effects |
| `zustand` | ^5.0 | State management |
| `howler` | ^2.2 | Audio system |
| `gsap` | ^3.12 | UI animations |
| `three` | ^0.170 | 3D engine |
| `next` | ^15.1 | Framework |

### Browser Support
- Chrome 90+ (primary)
- Safari 15+ (iOS/iPadOS)
- Firefox 90+ (secondary)
- Edge 90+ (secondary)
- WebGL 2.0 required

---

## Appendix D — Milestone Timeline (Suggested)

| Phase | Duration | Milestone |
|-------|----------|-----------|
| **Phase 1** ✅ | Done | Drivable prototype with letters + effects |
| **Phase 2** | 2-3 weeks | Blender models replace all procedurals |
| **Phase 3** | 1-2 weeks | Full audio system (SFX + music) |
| **Phase 4** | 2-3 weeks | Animal-letter system + learning mode |
| **Phase 5** | 3-4 weeks | Multiple islands + bridge building |
| **Phase 6** | 2-3 weeks | Home island customization |
| **Phase 7** | 2 weeks | Mobile + touch controls |
| **Phase 8** | 2-3 weeks | Multiplayer + sharing |
| **Phase 9** | 3-4 weeks | Mini-games + advanced events |
| **Phase 10** | 2 weeks | Accessibility + parent dashboard |

**Total estimated: ~5-6 months for full game**

Each phase is a playable milestone. Ship early, ship often. Your kid can start playing at Phase 2.

---

*Last updated: February 2026*
*Built with love for Eve 💛*
