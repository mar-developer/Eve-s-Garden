"use client";

import { useRef, useEffect, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { carRef } from '../../game/stores/car-ref';
import { DIMENSIONS } from '../../game/dimensions/themes';
import { Dimension } from '../../types/letter-crash';

// ---------------------------------------------------------------------------
// 1. CarDustTrail — small cubes behind the car when moving
// ---------------------------------------------------------------------------
const DUST_COUNT = 20;
const DUST_LIFETIME = 0.5;

interface DustParticle {
  alive: boolean;
  age: number;
  x: number;
  y: number;
  z: number;
  vy: number; // upward drift
}

function CarDustTrail() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const spawnTimer = useRef(0);

  const particles = useRef<DustParticle[]>(
    Array.from({ length: DUST_COUNT }, () => ({
      alive: false,
      age: 0,
      x: 0,
      y: 0,
      z: 0,
      vy: 0,
    })),
  );

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const { position, isMoving, rotation } = carRef;

    // Spawn new particles when moving
    if (isMoving) {
      spawnTimer.current += delta;
      // Spawn roughly every 0.04s
      if (spawnTimer.current >= 0.04) {
        spawnTimer.current = 0;

        // Find a dead particle slot
        const slot = particles.current.find((p) => !p.alive);
        if (slot) {
          // Spawn behind the car (opposite of forward direction)
          const backOffsetX = -Math.sin(rotation) * 1.5;
          const backOffsetZ = -Math.cos(rotation) * 1.5;

          slot.alive = true;
          slot.age = 0;
          slot.x = position[0] + backOffsetX + (Math.random() - 0.5) * 0.5;
          slot.y = 0.1 + Math.random() * 0.1;
          slot.z = position[2] + backOffsetZ + (Math.random() - 0.5) * 0.5;
          slot.vy = 0.5 + Math.random() * 0.5;
        }
      }
    }

    // Update all particles
    for (let i = 0; i < DUST_COUNT; i++) {
      const p = particles.current[i];

      if (p.alive) {
        p.age += delta;
        p.y += p.vy * delta;

        if (p.age >= DUST_LIFETIME) {
          p.alive = false;
        }
      }

      if (p.alive) {
        const t = p.age / DUST_LIFETIME;
        const scale = 0.1 * (1 - t); // shrink as it fades
        dummy.position.set(p.x, p.y, p.z);
        dummy.scale.setScalar(scale);
        dummy.rotation.set(0, 0, 0);
      } else {
        // Hide dead particles far away at zero scale
        dummy.position.set(0, -100, 0);
        dummy.scale.setScalar(0);
      }

      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, DUST_COUNT]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color="#C4A882"
        transparent
        opacity={0.6}
        roughness={1}
      />
    </instancedMesh>
  );
}

// ---------------------------------------------------------------------------
// 2. LetterSpawnPoof — burst of spheres when a letter block appears
// ---------------------------------------------------------------------------
const POOF_COUNT = 15;
const POOF_LIFETIME = 1.0;
const POOF_GRAVITY = 6;

interface PoofBurst {
  id: number;
  startTime: number;
  position: [number, number, number];
  color: string;
  velocities: { vx: number; vy: number; vz: number }[];
}

function LetterSpawnPoof() {
  const [bursts, setBursts] = useState<PoofBurst[]>([]);

  useEffect(() => {
    let nextId = 0;

    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        position: [number, number, number];
        color: string;
      };

      const velocities = Array.from({ length: POOF_COUNT }, () => ({
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        vz: (Math.random() - 0.5) * 4,
      }));

      const burst: PoofBurst = {
        id: nextId++,
        startTime: -1, // set on first frame
        position: detail.position,
        color: detail.color,
        velocities,
      };

      setBursts((prev) => [...prev, burst]);

      // Auto-remove after lifetime
      const burstId = burst.id;
      setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== burstId));
      }, POOF_LIFETIME * 1000 + 100);
    };

    window.addEventListener('letter-spawn-poof', handler);
    return () => window.removeEventListener('letter-spawn-poof', handler);
  }, []);

  return (
    <group>
      {bursts.map((burst) => (
        <PoofBurstMesh key={burst.id} burst={burst} />
      ))}
    </group>
  );
}

function PoofBurstMesh({ burst }: { burst: PoofBurst }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const startTime = useRef(-1);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    if (startTime.current < 0) startTime.current = clock.getElapsedTime();
    const elapsed = clock.getElapsedTime() - startTime.current;

    for (let i = 0; i < POOF_COUNT; i++) {
      const v = burst.velocities[i];
      const t = Math.min(elapsed / POOF_LIFETIME, 1);

      const x = v.vx * elapsed;
      const y = v.vy * elapsed - 0.5 * POOF_GRAVITY * elapsed * elapsed;
      const z = v.vz * elapsed;

      const scale = 0.12 * (1 - t);

      dummy.position.set(x, Math.max(0, y), z);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group position={burst.position}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, POOF_COUNT]} frustumCulled={false}>
        <sphereGeometry args={[1, 6, 5]} />
        <meshStandardMaterial
          color={burst.color}
          emissive={burst.color}
          emissiveIntensity={0.4}
          transparent
          opacity={0.8}
        />
      </instancedMesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// 3. DimensionWarpBurst — radial particle burst during dimension warp
// ---------------------------------------------------------------------------
const WARP_COUNT = 80;
const WARP_LIFETIME = 1.5;

interface WarpBurst {
  id: number;
  startTime: number;
  color: string;
  directions: { dx: number; dy: number; dz: number }[];
}

function DimensionWarpBurst() {
  const [bursts, setBursts] = useState<WarpBurst[]>([]);

  useEffect(() => {
    let nextId = 0;

    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { dimension: Dimension };
      const theme = DIMENSIONS[detail.dimension];

      // Pre-compute 80 uniformly-ish distributed directions on a sphere
      const directions = Array.from({ length: WARP_COUNT }, () => {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        return {
          dx: Math.sin(phi) * Math.cos(theta),
          dy: Math.sin(phi) * Math.sin(theta),
          dz: Math.cos(phi),
        };
      });

      const burst: WarpBurst = {
        id: nextId++,
        startTime: -1,
        color: theme.particleColor,
        directions,
      };

      setBursts((prev) => [...prev, burst]);

      const burstId = burst.id;
      setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== burstId));
      }, WARP_LIFETIME * 1000 + 100);
    };

    window.addEventListener('dimension-warp', handler);
    return () => window.removeEventListener('dimension-warp', handler);
  }, []);

  return (
    <group>
      {bursts.map((burst) => (
        <WarpBurstMesh key={burst.id} burst={burst} />
      ))}
    </group>
  );
}

function WarpBurstMesh({ burst }: { burst: WarpBurst }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const startTime = useRef(-1);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock, camera }) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    if (startTime.current < 0) startTime.current = clock.getElapsedTime();
    const elapsed = clock.getElapsedTime() - startTime.current;
    const t = Math.min(elapsed / WARP_LIFETIME, 1);

    // Center the burst at the camera's current look target (car position)
    const center = carRef.position;
    const expansionRadius = 15 * t;

    for (let i = 0; i < WARP_COUNT; i++) {
      const d = burst.directions[i];

      const x = center[0] + d.dx * expansionRadius;
      const y = center[1] + 2 + d.dy * expansionRadius; // offset up slightly
      const z = center[2] + d.dz * expansionRadius;

      // Fade: full at start, zero at end
      const scale = 0.15 * (1 - t * t); // quadratic fade for smoother feel

      dummy.position.set(x, y, z);
      dummy.scale.setScalar(scale);
      // Face camera for a billboard-like feel
      dummy.lookAt(camera.position);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, WARP_COUNT]} frustumCulled={false}>
      <sphereGeometry args={[1, 6, 5]} />
      <meshStandardMaterial
        color={burst.color}
        emissive={burst.color}
        emissiveIntensity={0.8}
        transparent
        opacity={0.9}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

// ---------------------------------------------------------------------------
// Combined export
// ---------------------------------------------------------------------------
export const Particles = () => {
  return (
    <group>
      <CarDustTrail />
      <LetterSpawnPoof />
      <DimensionWarpBurst />
    </group>
  );
};
