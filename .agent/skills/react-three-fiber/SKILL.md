---
name: react-three-fiber
description: React Three Fiber v9, Drei, Rapier physics, and postprocessing for declarative 3D web development. Use when building 3D scenes, animations, physics, or custom shaders with R3F.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# React Three Fiber & Ecosystem

> Declarative 3D development with React Three Fiber, Drei, Rapier, and postprocessing.

---

## 1. R3F Core Principles

### Declarative, Not Imperative

```
❌ Imperative: new THREE.Mesh() → scene.add() → render loop
✅ Declarative: <mesh> → JSX children → useFrame hook
```

**Key rule:** If you're calling `scene.add()`, `renderer.render()`, or `requestAnimationFrame` — you're doing it wrong. R3F handles all of this.

### The R3F Mental Model

| React Concept | R3F Equivalent |
|---------------|---------------|
| `<div>` | `<mesh>`, `<group>` |
| `children` | Scene graph children |
| `ref` | Three.js object reference |
| `useState` | DON'T use for animation |
| `useRef` | Animation values (60fps) |
| `useEffect` | Setup/cleanup |
| `useFrame` | Per-frame updates (replaces RAF) |

---

## 2. Canvas Setup

```typescript
import { Canvas } from '@react-three/fiber'

<Canvas
  shadows                    // Enable shadow maps
  orthographic               // OrthographicCamera (isometric games)
  camera={{
    zoom: 75,
    position: [8, 10, 8],
    near: 0.1, far: 100,
  }}
  gl={{
    antialias: true,
    toneMapping: 5,          // ACESFilmicToneMapping
    toneMappingExposure: 1.1,
  }}
  onCreated={({ camera }) => camera.lookAt(5, 0, 5)}
>
  <fog attach="fog" args={['#1a1a2e', 15, 35]} />
  <Lighting />
  <SceneContent />
</Canvas>
```

---

## 3. useFrame (Animation)

The most important R3F hook. Runs every frame inside the render loop.

### Rules

| Rule | Why |
|------|-----|
| Use `useRef`, never `useState` | useState causes 60 re-renders/sec |
| Always null-check refs | Ref may not be assigned yet |
| Use `delta` for speed | Frame-rate independent animation |
| Only inside Canvas children | Not in HTML overlay components |

### Patterns

```typescript
// Continuous rotation + bobbing
useFrame(({ clock }, delta) => {
  if (!ref.current) return
  ref.current.rotation.y += delta * 0.5
  ref.current.position.y = Math.sin(clock.getElapsedTime() * 2) * 0.06
})

// Smooth lerp interpolation
useFrame((_, delta) => {
  group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, target, delta * 5)
})

// Movement with step completion
useFrame((_, delta) => {
  progressRef.current += delta * SPEED
  if (progressRef.current >= 1) { advanceStep(); progressRef.current = 0 }
})
```

---

## 4. Drei Helpers

### Key Components

| Component | Purpose |
|-----------|---------|
| `OrbitControls` | Camera orbit with constraints |
| `shaderMaterial` | Custom shader factory → `extend()` |
| `Html` | HTML anchored to 3D position |
| `Float` | Floating animation wrapper |
| `Text` | 3D text rendering |
| `useGLTF` | Load .glb/.gltf models |
| `Environment` | HDR environment lighting |

### Custom Shader Pattern

```typescript
import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'

const MyMaterial = shaderMaterial(
  { uTime: 0, uColor: new THREE.Color('#ff0000') },
  vertexShader,
  fragmentShader
)
extend({ MyMaterial })

// Animate uniform:
const matRef = useRef<any>(null)
useFrame(({ clock }) => { matRef.current.uTime = clock.elapsedTime })
```

---

## 5. Rapier Physics

### Setup

```typescript
import { Physics, RigidBody } from '@react-three/rapier'

<Physics>
  <RigidBody type="fixed" colliders="cuboid">
    <mesh>{/* Floor */}</mesh>
  </RigidBody>
  <RigidBody type="kinematicPosition" colliders="ball">
    <mesh>{/* Character */}</mesh>
  </RigidBody>
</Physics>
```

### Body Types

| Type | Use |
|------|-----|
| `"fixed"` | Immovable (floors, walls) |
| `"dynamic"` | Gravity-affected |
| `"kinematicPosition"` | Programmatic movement |

### Kinematic Movement

```typescript
const bodyRef = useRef<RapierRigidBody>(null)
useFrame(() => {
  bodyRef.current?.setNextKinematicTranslation({ x, y, z })
})
```

---

## 6. Postprocessing

```typescript
import { EffectComposer, Bloom, DepthOfField } from '@react-three/postprocessing'

<EffectComposer>
  <Bloom intensity={0.5} luminanceThreshold={0.8} />
  <DepthOfField focusDistance={0.02} focalLength={0.05} bokehScale={3} />
</EffectComposer>
```

---

## 7. Performance

### Optimization Priority

1. **Low segment counts** — `SphereGeometry(r, 12, 10)` not `(r, 64, 64)`
2. **Memoize materials** — `useMemo(() => new Material(...), [])`
3. **Conditional rendering** — Don't render invisible objects
4. **Fine-grained Zustand selectors** — `useStore(s => s.score)` not `useStore()`
5. **Shadow budget** — Only key meshes `castShadow`, ground `receiveShadow`
6. **useRef over useState** — For any value updated per-frame

---

## 8. Common Pitfalls

| Mistake | Fix |
|---------|-----|
| `useState` in `useFrame` | Use `useRef` |
| Missing `"use client"` | Add to every R3F component file |
| Event bubbling | Call `e.stopPropagation()` in onClick |
| Store access in useFrame | Use `useStore.getState()` not selector |
| Camera shows nothing | Check position + `lookAt` + near/far |

---

## 9. Next.js Integration

```typescript
"use client"  // Required for all R3F components

// HTML overlays are OUTSIDE Canvas, absolutely positioned
<div className="relative w-full h-screen">
  <Canvas>...</Canvas>
  <div className="absolute top-0 left-0 z-10">
    {/* HUD, panels — HTML, not R3F */}
  </div>
</div>
```

---

> **Remember:** R3F = React for Three.js. Components, refs, hooks. No imperative scene graphs.
