# Common Patterns

## R3F Scene Setup

```typescript
// src/components/three/Scene.tsx
import { Canvas } from '@react-three/fiber'

export function Scene() {
  return (
    <Canvas
      shadows
      orthographic
      camera={{ zoom: 75, position: [8, 10, 8], near: 0.1, far: 100 }}
      style={{ background: COLORS.bg }}
      onCreated={({ camera }) => { camera.lookAt(5, 0, 5) }}
    >
      <Lighting />
      <Tiles />
      <Character />
      <Collectibles />
    </Canvas>
  )
}
```

## useFrame Animation Pattern

```typescript
// Per-frame animation via R3F useFrame (not manual RAF)
import { useFrame } from '@react-three/fiber'

useFrame(({ clock }, delta) => {
  if (!groupRef.current) return
  const t = clock.getElapsedTime()
  // Rotation, float, interpolation
  groupRef.current.rotation.y += 0.02
  groupRef.current.position.y = baseY + Math.sin(t * 2) * 0.06
})
```

## Zustand Store Pattern

```typescript
// src/game/stores/game-store.ts
import { create } from 'zustand'

export const useGameStore = create<GameState>((set, get) => ({
  score: 0,
  collected: new Set(),
  phase: 'playing',

  collectItem: (index) => {
    const { score, collected } = get()
    const newCollected = new Set(collected)
    newCollected.add(index)
    set({ score: score + meta.points, collected: newCollected })
  },
}))

// Usage in components:
const score = useGameStore((s) => s.score)
```

## Declarative Mesh Components

```typescript
// Voxel character parts as R3F JSX (not imperative Three.js)
function Head({ skinTone }: { skinTone: string }) {
  return (
    <mesh position={[0, 0.78, 0]} castShadow>
      <sphereGeometry args={[0.2, 12, 10]} />
      <meshStandardMaterial color={skinTone} roughness={0.6} />
    </mesh>
  )
}
```

## BFS Pathfinding Pattern

```typescript
// src/game/pathfinding.ts
export function findPath(
  start: GridPosition,
  end: GridPosition,
  layout: TileGrid,
): GridPosition[] | null {
  const queue: [number, number, GridPosition[]][] = [[start.x, start.z, []]]
  const visited = new Set<string>()
  // BFS traversal...
}
```

## Custom Hooks Pattern

```typescript
// Zustand selector hooks for fine-grained subscriptions
const config = useCharacterStore((s) => s.config)
const updateConfig = useCharacterStore((s) => s.updateConfig)

// useRef for animation values (60fps, no re-renders)
const moveProgressRef = useRef(0)
const prevPosRef = useRef({ x: 0, z: 0 })
```

## Constants-Driven Configuration

```typescript
// src/game/constants.ts — all game config in one place
export const TILE_SIZE = 1.1
export const COLORS = { bg: '#0a0a12', tileBase: '#2a2050', ... } as const
export const MAP_LAYOUT: TileGrid = [[0,0,1,1,...], ...]
export const COLLECTIBLE_META: Record<CollectibleType, CollectibleMeta> = { ... }
```

## Blender MCP Workflow Pattern

```python
# Step-by-step Blender manipulation via MCP tools
# 1. Inspect scene state first
get_scene_info()

# 2. Execute code in small chunks
execute_blender_code(code="""
import bpy
bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=10, radius=0.2)
obj = bpy.context.active_object
obj.name = "Collectible_Gem"
""")

# 3. Verify visually after each change
get_viewport_screenshot()

# 4. Apply materials matching Eve's Garden palette
execute_blender_code(code="""
import bpy
mat = bpy.data.materials.new(name="GemMaterial")
mat.use_nodes = True
bsdf = mat.node_tree.nodes["Principled BSDF"]
bsdf.inputs["Base Color"].default_value = (0.424, 0.361, 0.906, 1.0)  # #6c5ce7
bsdf.inputs["Emission Color"].default_value = (0.424, 0.361, 0.906, 1.0)
bsdf.inputs["Emission Strength"].default_value = 0.5
bpy.data.objects["Collectible_Gem"].data.materials.append(mat)
""")

# 5. Export as glTF for web
execute_blender_code(code="""
import bpy
bpy.ops.export_scene.gltf(
    filepath="/path/to/gem.glb",
    export_format='GLB',
    use_selection=True,
    export_apply=True,
)
""")
```
