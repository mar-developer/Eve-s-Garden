"use client";

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { useGameStore } from '../../game/stores/letter-crash-store';
import { DIMENSIONS } from '../../game/dimensions/themes';
import { DimensionConfig } from '../../types/letter-crash';

const TREE_COUNT = 14;
const TREE_RING_RADIUS = 42;
const FLOWER_COUNT = 20;
const FLOWER_RADIUS = 35;
const FLOWER_PALETTE = ['#D4FF00', '#FF3366', '#FF9F1C', '#00F5D4', '#FEE440', '#FF0054'] as const;

// ---------------------------------------------------------------------------
// ElementalPools: Fun water and lava areas scattered on the ground
// ---------------------------------------------------------------------------
const POOL_DATA = [
  { x: 25, z: 15, radius: 8, type: 'water', color: '#00F5D4' },
  { x: -20, z: 25, radius: 6, type: 'water', color: '#00F5D4' },
  { x: -30, z: -10, radius: 10, type: 'lava', color: '#FF3366' },
  { x: 15, z: -25, radius: 7, type: 'lava', color: '#FF9F1C' },
];

const ElementalPools = () => {
  const poolRefs = useRef<(THREE.Group | null)[]>([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    poolRefs.current.forEach((ref, i) => {
      if (ref) {
        // Slow pulsing animation for the pools to feel alive
        const pulse = 1 + Math.sin(t * 2 + i) * 0.05;
        ref.scale.set(pulse, 1, pulse);
      }
    });
  });

  return (
    <group position={[0, 0.05, 0]}>
      {POOL_DATA.map((pool, i) => (
        <group
          key={`pool-${i}`}
          position={[pool.x, 0, pool.z]}
          ref={(el) => { poolRefs.current[i] = el; }}
        >
          {/* Base Pool - Hexagonal to match the island theme */}
          <mesh rotation={[Math.PI / 2, 0, 0]} receiveShadow>
            <cylinderGeometry args={[pool.radius, pool.radius, 0.2, 6]} />
            <meshStandardMaterial 
              color={pool.color} 
              flatShading 
              emissive={pool.color} 
              emissiveIntensity={pool.type === 'lava' ? 0.8 : 0.2} 
            />
          </mesh>
          
          {/* Inner bright core for lava/water depth effect */}
          <mesh position={[0, 0.11, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[pool.radius * 0.7, pool.radius * 0.7, 0.1, 6]} />
            <meshStandardMaterial 
              color="#FFFFFF" 
              transparent 
              opacity={0.3} 
              flatShading
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};

/**
 * Deterministic pseudo-random from index. Returns 0-1.
 * Uses sine to avoid needing a seed library.
 */
function seededRandom(index: number, offset = 0): number {
  return (Math.sin(index * 127.1 + offset * 311.7) * 43758.5453) % 1;
}

/** Ensures seededRandom result is positive 0-1. */
function rand(index: number, offset = 0): number {
  return Math.abs(seededRandom(index, offset));
}

/** Lerp a value between min and max using a 0-1 factor. */
function lerp(min: number, max: number, t: number): number {
  return min + (max - min) * t;
}

// ---------------------------------------------------------------------------
// Tree data type
// ---------------------------------------------------------------------------
interface TreeData {
  x: number;
  z: number;
  trunkHeight: number;
  foliageRadius: number;
  foliageHeight: number;
}

// ---------------------------------------------------------------------------
// Flower data type
// ---------------------------------------------------------------------------
interface FlowerData {
  x: number;
  z: number;
  stemHeight: number;
  color: string;
}

// ---------------------------------------------------------------------------
// TreeRing: 14 chunky trees in a ring, with gentle sway
// ---------------------------------------------------------------------------
const TreeRing = ({ theme }: { theme: DimensionConfig }) => {
  const groupRef = useRef<THREE.Group>(null);

  const trees: TreeData[] = useMemo(() => {
    const result: TreeData[] = [];
    for (let i = 0; i < TREE_COUNT; i++) {
      const angle = (i / TREE_COUNT) * Math.PI * 2;
      result.push({
        x: Math.cos(angle) * TREE_RING_RADIUS,
        z: Math.sin(angle) * TREE_RING_RADIUS,
        trunkHeight: lerp(2, 3, rand(i, 1)),
        foliageRadius: lerp(1.5, 2.5, rand(i, 2)),
        foliageHeight: lerp(3, 4, rand(i, 3)),
      });
    }
    return result;
  }, []);

  // Store individual tree refs for per-tree sway
  const treeRefs = useRef<(THREE.Group | null)[]>([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    for (let i = 0; i < TREE_COUNT; i++) {
      const ref = treeRefs.current[i];
      if (ref) {
        ref.rotation.z = Math.sin(t * 0.5 + i) * 0.03;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {trees.map((tree, i) => (
        <group
          key={`tree-${i}`}
          ref={(el) => { treeRefs.current[i] = el; }}
          position={[tree.x, 0, tree.z]}
        >
          {/* Trunk */}
          <mesh
            position={[0, tree.trunkHeight / 2, 0]}
            castShadow
          >
            <cylinderGeometry args={[0.2, 0.4, tree.trunkHeight, 5]} />
            <meshStandardMaterial color="#111111" roughness={0.9} flatShading />
          </mesh>

          {/* Foliage */}
          <mesh
            position={[0, tree.trunkHeight + tree.foliageRadius, 0]}
            scale={[1, 1.5, 1]}
            castShadow
          >
            <icosahedronGeometry args={[tree.foliageRadius, 0]} />
            <meshStandardMaterial color={theme.particleColor} roughness={0.7} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// ---------------------------------------------------------------------------
// FlowerField: ~20 scattered flowers with bobbing animation
// ---------------------------------------------------------------------------
const FlowerField = ({ theme }: { theme: DimensionConfig }) => {
  const flowers: FlowerData[] = useMemo(() => {
    const result: FlowerData[] = [];
    for (let i = 0; i < FLOWER_COUNT; i++) {
      // Random position within a circle of FLOWER_RADIUS
      const angle = rand(i, 10) * Math.PI * 2;
      const dist = Math.sqrt(rand(i, 20)) * FLOWER_RADIUS; // sqrt for uniform distribution
      result.push({
        x: Math.cos(angle) * dist,
        z: Math.sin(angle) * dist,
        stemHeight: lerp(0.3, 0.5, rand(i, 30)),
        color: FLOWER_PALETTE[Math.floor(rand(i, 40) * FLOWER_PALETTE.length)],
      });
    }
    return result;
  }, []);

  const flowerRefs = useRef<(THREE.Group | null)[]>([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    for (let i = 0; i < FLOWER_COUNT; i++) {
      const ref = flowerRefs.current[i];
      if (ref) {
        ref.position.y = Math.sin(t * 2 + i) * 0.06;
      }
    }
  });

  return (
    <group>
      {flowers.map((flower, i) => (
        <group
          key={`flower-${i}`}
          ref={(el) => { flowerRefs.current[i] = el; }}
          position={[flower.x, 0, flower.z]}
        >
          {/* Stem */}
          <mesh position={[0, flower.stemHeight / 2, 0]}>
            <cylinderGeometry args={[0.05, 0.05, flower.stemHeight, 3]} />
            <meshStandardMaterial color="#111111" roughness={0.8} flatShading />
          </mesh>

          {/* Blossom */}
          <mesh position={[0, flower.stemHeight + 0.1, 0]}>
            <dodecahedronGeometry args={[0.2, 0]} />
            <meshStandardMaterial color={flower.color} roughness={0.5} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// ---------------------------------------------------------------------------
// Island: main component
// ---------------------------------------------------------------------------
export const Island = () => {
  const currentDimension = useGameStore((state) => state.dimension);
  const theme = DIMENSIONS[currentDimension];

  return (
    <group>
      {/* Main Ground Cylinder - Hexagon base */}
      <RigidBody type="fixed" colliders="hull">
        <mesh receiveShadow position={[0, -2, 0]}>
          <cylinderGeometry args={[50, 48, 4, 6]} />
          <meshStandardMaterial color={theme.groundColor} flatShading />
        </mesh>

        {/* Rocky underside - Chunky Hexagon Point */}
        <mesh receiveShadow position={[0, -12, 0]}>
          <coneGeometry args={[48, 16, 6]} />
          <meshStandardMaterial color="#111111" roughness={0.9} flatShading />
        </mesh>
      </RigidBody>

      {/* Edge Rim Glow Indicator */}
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[49, 50, 6]} />
        <meshBasicMaterial color={theme.particleColor} transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* Decorations */}
      <ElementalPools />
      <TreeRing theme={theme} />
      <FlowerField theme={theme} />
    </group>
  );
};
