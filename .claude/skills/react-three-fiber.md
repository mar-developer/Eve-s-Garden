---
name: react-three-fiber
description: React Three Fiber v9, Drei, Rapier, and postprocessing patterns for declarative 3D development. Covers Canvas setup, useFrame animations, physics, custom shaders, and performance optimization.
---

# React Three Fiber & Ecosystem

Comprehensive patterns for the R3F ecosystem: `@react-three/fiber`, `@react-three/drei`, `@react-three/rapier`, and `@react-three/postprocessing`.

## Core Concepts

### R3F vs Imperative Three.js

R3F wraps Three.js in a React reconciler. All 3D is declarative JSX:

```typescript
// ❌ Imperative Three.js (NEVER do this in R3F projects)
const scene = new THREE.Scene()
const mesh = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial({ color: 'red' })
)
scene.add(mesh)
renderer.render(scene, camera)

// ✅ R3F Declarative (correct approach)
<mesh>
  <boxGeometry args={[1, 1, 1]} />
  <meshStandardMaterial color="red" />
</mesh>
```

**Key differences:**
- No manual `WebGLRenderer` — R3F creates and manages it
- No `requestAnimationFrame` — use `useFrame` hook
- No manual cleanup — R3F auto-disposes on unmount
- No `scene.add()` — JSX children are scene children
- Props map directly to Three.js constructor args and properties

---

## @react-three/fiber (Core)

### Canvas

The root component that creates a WebGL renderer, scene, and camera:

```typescript
import { Canvas } from '@react-three/fiber'

<Canvas
  shadows                              // Enable shadow maps
  orthographic                         // Use OrthographicCamera (vs perspective)
  camera={{
    zoom: 75,
    position: [8, 10, 8],
    near: 0.1,
    far: 100,
  }}
  gl={{
    antialias: true,
    toneMapping: 5,                    // ACESFilmicToneMapping
    toneMappingExposure: 1.1,
  }}
  style={{ background: '#1a1a2e' }}
  onCreated={({ camera }) => {
    camera.lookAt(5, 0, 5)             // Set camera target after creation
  }}
>
  {/* Scene children */}
</Canvas>
```

**Key Canvas props:**
| Prop | Type | Purpose |
|------|------|---------|
| `shadows` | boolean | Enable shadow mapping |
| `orthographic` | boolean | Use OrthographicCamera |
| `camera` | object | Camera config (zoom, position, fov, near, far) |
| `gl` | object | WebGLRenderer options |
| `onCreated` | function | Callback after renderer init |
| `frameloop` | 'always' \| 'demand' \| 'never' | Render loop mode |

### useFrame

Per-frame animation hook. Runs inside the render loop at display refresh rate:

```typescript
import { useFrame } from '@react-three/fiber'

// Basic: Access clock and delta
useFrame(({ clock }, delta) => {
  if (!meshRef.current) return
  meshRef.current.rotation.y += 0.02
  meshRef.current.position.y = Math.sin(clock.getElapsedTime() * 2) * 0.06
})

// Advanced: Access full render state
useFrame((state, delta) => {
  const { clock, camera, mouse, scene, gl } = state
  // state.clock.getElapsedTime() — total elapsed seconds
  // delta — seconds since last frame (~0.016 at 60fps)
  // state.mouse — normalized mouse position (-1 to 1)
})

// Priority: Lower runs first (default 0)
useFrame(callback, priority)
```

**Critical rules:**
- Use `useRef` for values updated in useFrame, NEVER `useState`
- Always null-check refs: `if (!ref.current) return`
- Use `delta` for frame-rate independent animation
- Only call inside R3F Canvas children

### useThree

Access the R3F state store (renderer, camera, scene, etc.):

```typescript
import { useThree } from '@react-three/fiber'

function MyComponent() {
  const { camera, gl, scene, size, viewport } = useThree()
  // size — canvas pixel dimensions { width, height }
  // viewport — world-unit dimensions at camera distance
  // gl — WebGLRenderer instance
}

// Selective subscription (avoids re-renders)
const camera = useThree(state => state.camera)
```

### extend

Register custom classes for use as JSX elements:

```typescript
import { extend } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'

const WaterMaterial = shaderMaterial(
  { uTime: 0, uColor: new THREE.Color('#48dbfb') },
  vertexShader,
  fragmentShader
)

extend({ WaterMaterial })

// Now usable as JSX:
// <waterMaterial uTime={0} transparent />

// TypeScript: declare the JSX element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      waterMaterial: any  // or typed props
    }
  }
}
```

### ThreeEvent

Typed pointer events on meshes:

```typescript
import { type ThreeEvent } from '@react-three/fiber'

function Tile() {
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()   // Prevent event bubbling through scene
    const point = e.point // World-space intersection point
  }

  return (
    <mesh
      onClick={handleClick}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'default' }}
    >
      <boxGeometry args={[1, 0.5, 1]} />
      <meshStandardMaterial color="green" />
    </mesh>
  )
}
```

**Available events:** onClick, onDoubleClick, onPointerOver, onPointerOut, onPointerDown, onPointerUp, onPointerMove, onWheel

---

## @react-three/drei (Helpers)

### OrbitControls

Camera orbit controls with constraints:

```typescript
import { OrbitControls } from '@react-three/drei'

<OrbitControls
  enablePan={false}           // Disable panning
  enableZoom={true}
  minZoom={50}                // Orthographic zoom limits
  maxZoom={120}
  minPolarAngle={Math.PI / 4} // Lock vertical rotation
  maxPolarAngle={Math.PI / 4}
  enableRotate={false}         // Disable rotation entirely
/>
```

### shaderMaterial

Create custom shader materials as React components:

```typescript
import { shaderMaterial } from '@react-three/drei'

const GlowMaterial = shaderMaterial(
  // Uniforms (with defaults)
  { uTime: 0, uColor: new THREE.Color('#ff0000'), uIntensity: 1.0 },
  // Vertex shader
  `varying vec2 vUv;
   void main() {
     vUv = uv;
     gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
   }`,
  // Fragment shader
  `uniform float uTime;
   uniform vec3 uColor;
   uniform float uIntensity;
   varying vec2 vUv;
   void main() {
     float glow = sin(vUv.y * 10.0 + uTime) * 0.5 + 0.5;
     gl_FragColor = vec4(uColor * glow * uIntensity, 1.0);
   }`
)

extend({ GlowMaterial })

// Animate uniform in useFrame:
const matRef = useRef<any>(null)
useFrame((state) => {
  if (matRef.current) matRef.current.uTime = state.clock.elapsedTime
})

<mesh>
  <sphereGeometry args={[1, 32, 32]} />
  {/* @ts-expect-error - Custom shader material */}
  <glowMaterial ref={matRef} transparent />
</mesh>
```

### Other Useful Drei Components

```typescript
import { Html, Float, Text, Billboard, useGLTF, Environment } from '@react-three/drei'

// HTML overlay anchored to 3D position
<Html position={[0, 2, 0]} center>
  <div className="tooltip">Hello</div>
</Html>

// Floating animation wrapper
<Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
  <mesh>...</mesh>
</Float>

// 3D text
<Text fontSize={0.5} color="white" anchorX="center" anchorY="middle">
  Score: 100
</Text>

// Always face camera
<Billboard>
  <mesh>...</mesh>
</Billboard>

// Load GLTF model
const { scene } = useGLTF('/model.glb')
<primitive object={scene} />

// Environment lighting
<Environment preset="sunset" />
```

---

## @react-three/rapier (Physics)

### Setup

```typescript
import { Physics, RigidBody } from '@react-three/rapier'
import type { RapierRigidBody } from '@react-three/rapier'

<Canvas>
  <Physics>
    {/* All physics bodies must be inside Physics */}
    <RigidBody type="fixed" colliders="cuboid">
      <mesh>  {/* Floor */}
        <boxGeometry args={[10, 0.5, 10]} />
        <meshStandardMaterial />
      </mesh>
    </RigidBody>

    <RigidBody type="dynamic" colliders="ball">
      <mesh>  {/* Bouncing ball */}
        <sphereGeometry args={[0.5]} />
        <meshStandardMaterial />
      </mesh>
    </RigidBody>
  </Physics>
</Canvas>
```

### RigidBody Types

| Type | Behavior |
|------|----------|
| `"dynamic"` | Affected by gravity and forces |
| `"fixed"` | Immovable (floors, walls) |
| `"kinematicPosition"` | Moved programmatically via `setNextKinematicTranslation` |
| `"kinematicVelocity"` | Moved via velocity |

### Kinematic Movement (Character Pattern)

```typescript
const bodyRef = useRef<RapierRigidBody>(null)

useFrame(() => {
  if (!bodyRef.current) return
  bodyRef.current.setNextKinematicTranslation({
    x: targetX,
    y: targetY,
    z: targetZ,
  })
})

<RigidBody ref={bodyRef} type="kinematicPosition" colliders="ball">
  <group>{/* Character mesh */}</group>
</RigidBody>
```

### Collider Types

| Collider | Shape |
|----------|-------|
| `"cuboid"` | Box (from mesh geometry) |
| `"ball"` | Sphere |
| `"hull"` | Convex hull |
| `"trimesh"` | Exact mesh (expensive) |

---

## @react-three/postprocessing

### Effects Setup

```typescript
import { EffectComposer, Bloom, DepthOfField } from '@react-three/postprocessing'

<Canvas>
  {/* Scene content */}
  <EffectComposer>
    <Bloom
      intensity={0.5}
      luminanceThreshold={0.8}
      luminanceSmoothing={0.9}
    />
    <DepthOfField
      focusDistance={0.02}
      focalLength={0.05}
      bokehScale={3}
    />
  </EffectComposer>
</Canvas>
```

---

## Declarative Mesh Patterns

### JSX Mesh Structure

```typescript
// Every mesh needs geometry + material
<mesh position={[x, y, z]} rotation={[rx, ry, rz]} scale={[sx, sy, sz]} castShadow>
  <boxGeometry args={[width, height, depth]} />
  <meshStandardMaterial color="#ff0000" roughness={0.5} metalness={0.3} />
</mesh>
```

### Common Geometries

| JSX Element | Three.js Class | args |
|-------------|---------------|------|
| `<boxGeometry>` | BoxGeometry | [width, height, depth] |
| `<sphereGeometry>` | SphereGeometry | [radius, widthSegs, heightSegs] |
| `<cylinderGeometry>` | CylinderGeometry | [radiusTop, radiusBot, height, radialSegs] |
| `<coneGeometry>` | ConeGeometry | [radius, height, radialSegs] |
| `<octahedronGeometry>` | OctahedronGeometry | [radius, detail] |
| `<torusGeometry>` | TorusGeometry | [radius, tube, radialSegs, tubularSegs] |
| `<planeGeometry>` | PlaneGeometry | [width, height] |
| `<edgesGeometry>` | EdgesGeometry | [geometry] |

### Common Materials

| JSX Element | Use Case |
|-------------|----------|
| `<meshStandardMaterial>` | PBR material (most common) |
| `<meshBasicMaterial>` | Unlit, no shadows |
| `<meshPhongMaterial>` | Cheap specular highlights |
| `<lineBasicMaterial>` | For line/edge rendering |

### Material Properties

```typescript
<meshStandardMaterial
  color="#ff0000"
  roughness={0.5}          // 0 = mirror, 1 = matte
  metalness={0.3}          // 0 = dielectric, 1 = metal
  emissive="#ff0000"       // Self-illumination color
  emissiveIntensity={0.4}  // Glow strength
  transparent              // Enable transparency
  opacity={0.8}            // 0 = invisible, 1 = opaque
  side={THREE.DoubleSide}  // Render both faces
  depthWrite={false}       // For transparent objects
/>
```

### Grouping and Composition

```typescript
// Use <group> for logical grouping (like a div for 3D)
<group position={[0, 1, 0]} scale={[0.85, 0.85, 0.85]}>
  <Head />
  <Body />
  <Arms />
</group>

// Nested groups for local transforms
<group rotation={[0, Math.PI / 4, 0]}>   {/* Rotate everything */}
  <group position={[0, 2, 0]}>            {/* Offset child */}
    <mesh>...</mesh>
  </group>
</group>
```

---

## Lighting Patterns

```typescript
// Ambient: Base illumination (no shadows)
<ambientLight color="#b8c0ff" intensity={0.5} />

// Directional: Sun-like parallel light (casts shadows)
<directionalLight
  color="#ffffff"
  intensity={1.2}
  position={[8, 12, 6]}
  castShadow
  shadow-mapSize-width={2048}
  shadow-mapSize-height={2048}
  shadow-camera-left={-15}
  shadow-camera-right={15}
  shadow-camera-top={15}
  shadow-camera-bottom={-15}
/>

// Point: Omnidirectional light (lamps, torches)
<pointLight color="#6c5ce7" intensity={0.6} distance={20} position={[5, 4, 5]} />

// Spot: Cone-shaped light
<spotLight position={[0, 10, 0]} angle={0.3} penumbra={0.5} castShadow />

// Fog: Distance-based fade
<fog attach="fog" args={['#1a1a2e', 15, 35]} />
```

---

## Animation Patterns

### useFrame + useRef (Standard)

```typescript
const meshRef = useRef<THREE.Mesh>(null)

useFrame(({ clock }, delta) => {
  if (!meshRef.current) return
  // Continuous rotation
  meshRef.current.rotation.y += delta * 0.5
  // Sine wave bobbing
  meshRef.current.position.y = Math.sin(clock.getElapsedTime() * 2) * 0.06
})

<mesh ref={meshRef}>...</mesh>
```

### Interpolated Movement (Character Hop)

```typescript
const moveProgressRef = useRef(0)

useFrame((_, delta) => {
  if (!isMoving) return
  moveProgressRef.current += delta * MOVE_SPEED

  const t = moveProgressRef.current
  group.position.x = fromX + (toX - fromX) * t
  group.position.z = fromZ + (toZ - fromZ) * t
  group.position.y = TILE_HEIGHT + Math.sin(t * Math.PI) * HOP_HEIGHT

  // Face movement direction
  group.rotation.y = Math.atan2(toX - fromX, toZ - fromZ)

  if (t >= 1) {
    moveProgressRef.current = 0
    advanceStep()
  }
})
```

### Smooth Camera/Rotation Lerp

```typescript
useFrame((_, delta) => {
  if (!groupRef.current) return
  const targetRotation = (cameraAngle * Math.PI) / 180
  groupRef.current.rotation.y = THREE.MathUtils.lerp(
    groupRef.current.rotation.y,
    targetRotation,
    delta * 5  // Smoothing factor
  )
})
```

---

## Performance Optimization

### 1. Low Segment Counts

```typescript
// ✅ Low-poly for game objects
<sphereGeometry args={[0.2, 12, 10]} />    // Head: 12x10 segments
<cylinderGeometry args={[0.04, 0.06, 0.2, 6]} />  // Trunk: 6 sides
<coneGeometry args={[0.18, 0.35, 6]} />    // Tree: 6 sides

// ❌ Too many segments for game objects
<sphereGeometry args={[0.2, 64, 64]} />    // 64x64 is excessive
```

### 2. Memoize Expensive Objects

```typescript
// ✅ Memoize materials and geometries that don't change
const materials = useMemo(() => [
  new THREE.MeshStandardMaterial({ color: '#2d5016', roughness: 0.6 }),
  new THREE.MeshStandardMaterial({ color: '#3a6b1e', roughness: 0.4 }),
], [])

<mesh material={materials} />
```

### 3. Conditional Rendering

```typescript
// ✅ Don't render invisible objects
{!collected && (
  <group ref={groupRef} position={worldPos}>
    <Shape />
  </group>
)}
```

### 4. Fine-Grained Zustand Selectors

```typescript
// ✅ Only re-render when specific value changes
const score = useGameStore(s => s.score)
const collected = useGameStore(s => s.collected.has(index))

// ❌ Re-renders on ANY store change
const store = useGameStore()
```

### 5. Shadow Optimization

```typescript
// Only key meshes cast shadows, large surfaces receive
<mesh castShadow>...</mesh>      // Characters, collectibles
<mesh receiveShadow>...</mesh>   // Ground tiles

// Shadow map size (2048 is good balance)
<directionalLight shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
```

---

## Common Pitfalls

### 1. useState in useFrame

```typescript
// ❌ Causes 60 re-renders per second
const [y, setY] = useState(0)
useFrame(() => setY(Math.sin(Date.now())))

// ✅ Use refs for animation values
const yRef = useRef(0)
useFrame(({ clock }) => {
  yRef.current = Math.sin(clock.getElapsedTime())
  meshRef.current.position.y = yRef.current
})
```

### 2. Missing "use client" Directive

R3F components use hooks and browser APIs — they must be client components in Next.js:

```typescript
"use client"  // Required at top of every R3F component file

import { Canvas } from '@react-three/fiber'
```

### 3. Event Propagation

```typescript
// ❌ Click passes through overlapping meshes
<mesh onClick={handleClick}>

// ✅ Stop propagation to prevent bubbling
<mesh onClick={(e) => { e.stopPropagation(); handleClick(e) }}>
```

### 4. Accessing Store Outside React

```typescript
// Inside useFrame (not a React lifecycle), use getState():
useFrame(() => {
  const { player, startMove } = useGameStore.getState()
})
```

### 5. Camera Not Pointing at Scene

```typescript
// Orthographic camera needs explicit lookAt after creation
<Canvas
  orthographic
  camera={{ position: [8, 10, 8] }}
  onCreated={({ camera }) => camera.lookAt(5, 0, 5)}
>
```

---

## Next.js + R3F Integration

### Component Structure

```typescript
// src/app/page.tsx — "use client" required
"use client"

export default function GamePage() {
  return (
    <div className="relative w-full h-screen">
      <Scene />       {/* R3F Canvas */}
      <HUD />         {/* HTML overlay, absolutely positioned */}
      <DesignPanel />  {/* HTML sidebar, absolutely positioned */}
    </div>
  )
}
```

### R3F + Zustand Integration

```typescript
// Zustand store works seamlessly with R3F components
// Inside useFrame — use getState() (no React re-render)
useFrame(() => {
  const { player } = useGameStore.getState()
})

// Inside component body — use selector (React re-render)
const score = useGameStore(s => s.score)
```

---

## Debugging

### Black/Empty Canvas
1. Check camera position and lookAt target
2. Verify lights exist in scene
3. Check material `side` property
4. Verify `near`/`far` planes include your objects

### Objects Not Visible
1. Check position coordinates (are they in camera frustum?)
2. Check scale (not zero?)
3. Check material opacity and transparency
4. Check if conditionally rendered (`{show && <mesh>}`)

### Jittery Animation
1. Using `useState` instead of `useRef`? → Switch to ref
2. Not using `delta` for speed? → Multiply by delta
3. Missing null check on ref? → Add `if (!ref.current) return`

### Shadows Missing
1. `shadows` prop on Canvas?
2. `castShadow` on light and mesh?
3. `receiveShadow` on ground?
4. Shadow camera bounds large enough?

**Remember**: R3F is React for Three.js. Think in components, refs, and hooks — not imperative scene graphs.