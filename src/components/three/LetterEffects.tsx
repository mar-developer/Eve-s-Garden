"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles, Text, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { EventType } from '../../types/letter-crash';
import { getAnimalForLetter } from '../../game/animals/animal-registry';

// Letters that have real GLB models in public/models/animals/
const LETTERS_WITH_MODELS = new Set(['B', 'C', 'D', 'E', 'F', 'G', 'L', 'O', 'R', 'S', 'U', 'W']);

// ---------------------------------------------------------------------------
// Duration per effect type (ms) — matches event-registry.ts
// ---------------------------------------------------------------------------
const EFFECT_DURATIONS: Record<EventType, number> = {
  Explosion: 1500,
  Animal: 3000,
  Stars: 2000,
  Enemy: 3000,
  Portal: 2000,
  Music: 2500,
};

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------
interface EffectInstance {
  id: string;
  type: EventType;
  position: [number, number, number];
  createdAt: number;
  letter?: string;
}

// ---------------------------------------------------------------------------
// 1. ExplosionEffect — Sparkles burst + flash sphere that scales up & fades
// ---------------------------------------------------------------------------
function ExplosionEffect({ position }: { position: [number, number, number] }) {
  const flashRef = useRef<THREE.Mesh>(null);
  const startTime = useRef(0);

  useFrame(({ clock }) => {
    if (!flashRef.current) return;
    if (startTime.current === 0) startTime.current = clock.getElapsedTime();

    const elapsed = clock.getElapsedTime() - startTime.current;
    const duration = EFFECT_DURATIONS.Explosion / 1000;
    const t = Math.min(elapsed / duration, 1);

    // Quick scale up, then hold
    const scale = t < 0.3 ? (t / 0.3) * 3 : 3;
    flashRef.current.scale.set(scale, scale, scale);

    // Fade out over full duration
    const mat = flashRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = Math.max(0, 1 - t);
  });

  return (
    <group position={position}>
      <Sparkles
        count={50}
        speed={3}
        opacity={1}
        scale={5}
        size={6}
        color="#FF6B6B"
        noise={0.5}
      />
      <mesh ref={flashRef}>
        <sphereGeometry args={[0.5, 12, 10]} />
        <meshBasicMaterial
          color="#FFAA44"
          transparent
          opacity={1}
          depthWrite={false}
        />
      </mesh>
      <pointLight color="#FF6B6B" intensity={8} distance={12} decay={2} />
    </group>
  );
}

// ---------------------------------------------------------------------------
// 2. PortalEffect — Two concentric rings spinning opposite directions
// ---------------------------------------------------------------------------
function PortalEffect({ position }: { position: [number, number, number] }) {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ring1Ref.current) ring1Ref.current.rotation.z += delta * 2;
    if (ring2Ref.current) ring2Ref.current.rotation.z -= delta * 3;
  });

  return (
    <group position={position} rotation={[Math.PI / 2, 0, 0]}>
      <mesh ref={ring1Ref}>
        <ringGeometry args={[1.2, 1.6, 32]} />
        <meshBasicMaterial
          color="#957FEF"
          side={THREE.DoubleSide}
          transparent
          opacity={0.8}
        />
      </mesh>
      <mesh ref={ring2Ref}>
        <ringGeometry args={[0.6, 1.0, 24]} />
        <meshBasicMaterial
          color="#C9B8FF"
          side={THREE.DoubleSide}
          transparent
          opacity={0.6}
        />
      </mesh>
      <pointLight color="#957FEF" intensity={5} distance={10} />
    </group>
  );
}

// ---------------------------------------------------------------------------
// 3. StarShowerEffect — Instanced falling octahedrons with spin + gravity
// ---------------------------------------------------------------------------
const STAR_COUNT = 25;

function StarShowerEffect({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const startTime = useRef(0);

  // Per-star state: velocity, spin axis, spin speed, lateral offset
  const starData = useMemo(() => {
    const data: {
      vx: number;
      vy: number;
      vz: number;
      spinAxis: THREE.Vector3;
      spinSpeed: number;
      offset: THREE.Vector3;
    }[] = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      data.push({
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 2 + 1, // initial upward velocity
        vz: (Math.random() - 0.5) * 2,
        spinAxis: new THREE.Vector3(
          Math.random() - 0.5,
          Math.random() - 0.5,
          Math.random() - 0.5,
        ).normalize(),
        spinSpeed: Math.random() * 4 + 2,
        offset: new THREE.Vector3(
          (Math.random() - 0.5) * 3,
          Math.random() * 10, // spread start heights above position
          (Math.random() - 0.5) * 3,
        ),
      });
    }
    return data;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const GRAVITY = 9.8;

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    if (startTime.current === 0) startTime.current = clock.getElapsedTime();

    const elapsed = clock.getElapsedTime() - startTime.current;

    for (let i = 0; i < STAR_COUNT; i++) {
      const s = starData[i];

      // Position: start high, fall with gravity
      const x = s.offset.x + s.vx * elapsed;
      const y = s.offset.y + s.vy * elapsed - 0.5 * GRAVITY * elapsed * elapsed;
      const z = s.offset.z + s.vz * elapsed;

      dummy.position.set(x, y, z);

      // Spin
      dummy.quaternion.setFromAxisAngle(s.spinAxis, elapsed * s.spinSpeed);

      // Scale: fade out near end
      const duration = EFFECT_DURATIONS.Stars / 1000;
      const fade = elapsed > duration * 0.7
        ? Math.max(0, 1 - (elapsed - duration * 0.7) / (duration * 0.3))
        : 1;
      dummy.scale.setScalar(0.25 * fade);

      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group position={position}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, STAR_COUNT]}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#FFD93D"
          emissive="#FFD93D"
          emissiveIntensity={0.6}
          roughness={0.3}
        />
      </instancedMesh>
      <pointLight color="#FFD93D" intensity={4} distance={10} />
    </group>
  );
}

// ---------------------------------------------------------------------------
// 4. AnimalEffect — Loads real GLB model when available, falls back to blob
// ---------------------------------------------------------------------------

/** Loads a GLB and renders the scene — must be a separate component for useGLTF hook */
const ANIMAL_MODEL_SCALE = 3;

function AnimalModel({ modelPath }: { modelPath: string }) {
  const { scene } = useGLTF(modelPath);
  const cloned = useMemo(() => scene.clone(), [scene]);
  return (
    <group scale={[ANIMAL_MODEL_SCALE, ANIMAL_MODEL_SCALE, ANIMAL_MODEL_SCALE]}>
      <primitive object={cloned} />
    </group>
  );
}

/** Fallback green blob for letters without a real model */
function AnimalBlobFallback() {
  return (
    <>
      <mesh castShadow>
        <sphereGeometry args={[0.7, 14, 12]} />
        <meshStandardMaterial color="#6BCB77" roughness={0.5} />
      </mesh>
      <mesh position={[-0.22, 0.2, 0.58]}>
        <sphereGeometry args={[0.18, 10, 8]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[-0.22, 0.2, 0.72]}>
        <sphereGeometry args={[0.09, 8, 6]} />
        <meshBasicMaterial color="#222222" />
      </mesh>
      <mesh position={[0.22, 0.2, 0.58]}>
        <sphereGeometry args={[0.18, 10, 8]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[0.22, 0.2, 0.72]}>
        <sphereGeometry args={[0.09, 8, 6]} />
        <meshBasicMaterial color="#222222" />
      </mesh>
      <mesh position={[0, -0.05, 0.65]} rotation={[0.2, 0, 0]}>
        <torusGeometry args={[0.15, 0.03, 6, 12, Math.PI]} />
        <meshBasicMaterial color="#2D6A30" />
      </mesh>
    </>
  );
}

function AnimalEffect({ position, letter }: { position: [number, number, number]; letter?: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const sparkleRef = useRef<THREE.Group>(null);
  const startTime = useRef(0);

  const upperLetter = letter?.toUpperCase() ?? '';
  const hasModel = LETTERS_WITH_MODELS.has(upperLetter);
  const animal = hasModel ? getAnimalForLetter(upperLetter) : undefined;

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    if (startTime.current === 0) startTime.current = clock.getElapsedTime();

    const elapsed = clock.getElapsedTime() - startTime.current;
    const duration = EFFECT_DURATIONS.Animal / 1000;

    let scale: number;
    let yOffset = 0;

    if (elapsed < 0.5) {
      const t = elapsed / 0.5;
      scale = t < 0.6
        ? (t / 0.6) * 1.35
        : 1.35 - (t - 0.6) / 0.4 * 0.35;
    } else if (elapsed < 2.2) {
      scale = 1;
      const hopT = elapsed - 0.5;
      yOffset = Math.abs(Math.sin(hopT * Math.PI * 2)) * 1.2;
    } else if (elapsed < duration) {
      const t = (elapsed - 2.2) / (duration - 2.2);
      scale = Math.max(0, 1 - t);
    } else {
      scale = 0;
    }

    scale = Math.max(0, scale);
    groupRef.current.scale.set(scale, scale, scale);
    groupRef.current.position.y = yOffset;
    groupRef.current.rotation.z = Math.sin(elapsed * 8) * 0.1;

    if (sparkleRef.current) {
      sparkleRef.current.rotation.y = elapsed * 3;
    }
  });

  return (
    <group position={position}>
      <group ref={groupRef}>
        {animal ? <AnimalModel modelPath={animal.model} /> : <AnimalBlobFallback />}

        {letter && (
          <Text
            position={[0, 1.4, 0]}
            fontSize={0.8}
            color="#FFD93D"
            font="/fonts/dm-sans-bold.ttf"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.04}
            outlineColor="#333"
          >
            {letter.toUpperCase()}
          </Text>
        )}

        <group ref={sparkleRef}>
          {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => (
            <mesh key={i} position={[Math.cos(angle) * 1.2, 0.3 + Math.sin(angle * 2) * 0.3, Math.sin(angle) * 1.2]}>
              <sphereGeometry args={[0.08, 6, 4]} />
              <meshBasicMaterial color="#FFD93D" />
            </mesh>
          ))}
        </group>
      </group>
      <pointLight color="#6BCB77" intensity={4} distance={8} />
    </group>
  );
}

// ---------------------------------------------------------------------------
// 5. EnemyEffect — Cute ghost model with wobble and sway
// ---------------------------------------------------------------------------
const GHOST_MODEL_SCALE = 3;

function GhostModel() {
  const { scene } = useGLTF('/models/animals/ghost.glb');
  const cloned = useMemo(() => scene.clone(), [scene]);
  return (
    <group scale={[GHOST_MODEL_SCALE, GHOST_MODEL_SCALE, GHOST_MODEL_SCALE]}>
      <primitive object={cloned} />
    </group>
  );
}

function EnemyEffect({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const startTime = useRef(0);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    if (startTime.current === 0) startTime.current = clock.getElapsedTime();

    const elapsed = clock.getElapsedTime() - startTime.current;
    const duration = EFFECT_DURATIONS.Enemy / 1000;

    // Sway side to side
    groupRef.current.position.x = Math.sin(elapsed * 3) * 0.5;
    groupRef.current.rotation.z = Math.sin(elapsed * 3) * 0.2;

    // Gentle float up and down
    groupRef.current.position.y = Math.sin(elapsed * 2) * 0.3;

    // Fade in / out with scale
    let masterScale: number;
    if (elapsed < 0.3) {
      masterScale = elapsed / 0.3;
    } else if (elapsed > duration - 0.5) {
      masterScale = Math.max(0, (duration - elapsed) / 0.5);
    } else {
      masterScale = 1;
    }

    groupRef.current.scale.set(masterScale, masterScale, masterScale);
  });

  return (
    <group position={position}>
      <group ref={groupRef}>
        <GhostModel />
      </group>
    </group>
  );
}

// ---------------------------------------------------------------------------
// 6. MusicEffect — Musical note shape drifting upward while rotating
// ---------------------------------------------------------------------------
function MusicEffect({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const startTime = useRef(0);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    if (startTime.current === 0) startTime.current = clock.getElapsedTime();

    const elapsed = clock.getElapsedTime() - startTime.current;
    const duration = EFFECT_DURATIONS.Music / 1000;
    const t = Math.min(elapsed / duration, 1);

    // Drift upward
    groupRef.current.position.y = elapsed * 1.5;

    // Gentle sway
    groupRef.current.position.x = Math.sin(elapsed * 2) * 0.4;

    // Rotate
    groupRef.current.rotation.y = elapsed * 1.5;

    // Scale in then fade out
    let scale: number;
    if (t < 0.1) {
      scale = t / 0.1;
    } else if (t > 0.7) {
      scale = Math.max(0, (1 - t) / 0.3);
    } else {
      scale = 1;
    }

    groupRef.current.scale.set(scale, scale, scale);

    // Fade opacity via material traversal
    groupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material as THREE.MeshStandardMaterial;
        if (mat.transparent) {
          mat.opacity = t > 0.7 ? Math.max(0, (1 - t) / 0.3) : 1;
        }
      }
    });
  });

  return (
    <group position={position}>
      <group ref={groupRef}>
        {/* Note head — filled oval */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, -0.3]} castShadow>
          <sphereGeometry args={[0.3, 10, 8]} />
          <meshStandardMaterial
            color="#FF8BD0"
            emissive="#FF8BD0"
            emissiveIntensity={0.5}
            roughness={0.4}
            transparent
            opacity={1}
          />
        </mesh>

        {/* Stem — thin cylinder */}
        <mesh position={[0.22, 0.8, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 1.4, 6]} />
          <meshStandardMaterial
            color="#FF8BD0"
            emissive="#FF8BD0"
            emissiveIntensity={0.3}
            transparent
            opacity={1}
          />
        </mesh>

        {/* Flag — small box at top of stem */}
        <mesh position={[0.42, 1.35, 0]} rotation={[0, 0, -0.5]}>
          <boxGeometry args={[0.35, 0.2, 0.05]} />
          <meshStandardMaterial
            color="#FF8BD0"
            emissive="#FF8BD0"
            emissiveIntensity={0.4}
            transparent
            opacity={1}
          />
        </mesh>

        <pointLight color="#FF8BD0" intensity={3} distance={8} />
      </group>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Effect router
// ---------------------------------------------------------------------------
function VisualEffect({ effect }: { effect: EffectInstance }) {
  switch (effect.type) {
    case 'Explosion':
      return <ExplosionEffect position={effect.position} />;
    case 'Portal':
      return <PortalEffect position={effect.position} />;
    case 'Stars':
      return <StarShowerEffect position={effect.position} />;
    case 'Animal':
      return <AnimalEffect position={effect.position} letter={effect.letter} />;
    case 'Enemy':
      return <EnemyEffect position={effect.position} />;
    case 'Music':
      return <MusicEffect position={effect.position} />;
    default:
      return <ExplosionEffect position={effect.position} />;
  }
}

// ---------------------------------------------------------------------------
// Main manager — listens for events, manages lifecycle, cleans up via ref
// ---------------------------------------------------------------------------
export const LetterEffects = () => {
  const [effects, setEffects] = useState<EffectInstance[]>([]);
  const effectsRef = useRef<EffectInstance[]>([]);

  // Keep ref in sync with state
  useEffect(() => {
    effectsRef.current = effects;
  }, [effects]);

  useEffect(() => {
    const handleSpawnEffect = (e: CustomEvent) => {
      const newEffect: EffectInstance = {
        id: Math.random().toString(36).slice(2),
        type: e.detail.type,
        position: e.detail.position,
        createdAt: Date.now(),
        letter: e.detail.letter,
      };

      // Schedule removal after the effect's specific duration
      const duration = EFFECT_DURATIONS[newEffect.type] ?? 3000;
      setTimeout(() => {
        setEffects((prev) => prev.filter((fx) => fx.id !== newEffect.id));
      }, duration);

      setEffects((prev) => [...prev, newEffect]);
    };

    window.addEventListener('spawn-effect' as never, handleSpawnEffect);
    return () =>
      window.removeEventListener('spawn-effect' as never, handleSpawnEffect);
  }, []);

  return (
    <group>
      {effects.map((effect) => (
        <VisualEffect key={effect.id} effect={effect} />
      ))}
    </group>
  );
};

// ---------------------------------------------------------------------------
// Dispatch helper (used by LetterBlocks and other consumers)
// ---------------------------------------------------------------------------
export const dispatchEffect = (
  type: EventType,
  position: [number, number, number],
  letter?: string,
) => {
  window.dispatchEvent(
    new CustomEvent('spawn-effect', { detail: { type, position, letter } }),
  );
};
