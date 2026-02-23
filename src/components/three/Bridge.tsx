"use client";

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';

interface BridgeProps {
  from: [number, number, number];
  to: [number, number, number];
  fromRadius: number;
  toRadius: number;
  unlocked: boolean;
}

const BRIDGE_WIDTH = 6;
const BLOCK_COUNT = 12;

/**
 * Procedural bridge between two islands.
 * When locked: faint ghost blocks showing where it will appear.
 * When unlocked: solid colorful blocks the car can drive over.
 */
export const Bridge = ({ from, to, fromRadius, toRadius, unlocked }: BridgeProps) => {
  const groupRef = useRef<THREE.Group>(null);

  // Calculate bridge geometry
  const bridgeData = useMemo(() => {
    const fromVec = new THREE.Vector3(...from);
    const toVec = new THREE.Vector3(...to);
    const dir = new THREE.Vector3().subVectors(toVec, fromVec).normalize();

    // Start/end points are at island edges (offset by radius)
    const start = new THREE.Vector3().copy(fromVec).addScaledVector(dir, fromRadius);
    const end = new THREE.Vector3().copy(toVec).addScaledVector(dir, -toRadius);

    const totalLength = start.distanceTo(end);
    const blockLength = totalLength / BLOCK_COUNT;

    // Angle to rotate the bridge planks
    const angle = Math.atan2(dir.x, dir.z);

    const blocks: { position: THREE.Vector3; index: number }[] = [];
    for (let i = 0; i < BLOCK_COUNT; i++) {
      const t = (i + 0.5) / BLOCK_COUNT;
      const pos = new THREE.Vector3().lerpVectors(start, end, t);
      // Slight arc: raise middle blocks
      pos.y = Math.sin(t * Math.PI) * 3;
      blocks.push({ position: pos, index: i });
    }

    return { blocks, angle, blockLength };
  }, [from, to, fromRadius, toRadius]);

  // Animate unlock: blocks appear one by one
  const unlockTime = useRef<number | null>(null);

  useFrame(({ clock }) => {
    if (unlocked && unlockTime.current === null) {
      unlockTime.current = clock.getElapsedTime();
    }
  });

  const RAINBOW = ['#FF6B6B', '#FFD93D', '#4ECDC4', '#A06CD5', '#FF8BD0', '#6BCB77'];

  return (
    <group ref={groupRef}>
      {bridgeData.blocks.map((block, i) => {
        const color = RAINBOW[i % RAINBOW.length];

        if (!unlocked) {
          // Ghost preview — faint transparent blocks
          return (
            <mesh
              key={`ghost-${i}`}
              position={block.position.toArray() as [number, number, number]}
              rotation={[0, bridgeData.angle, 0]}
            >
              <boxGeometry args={[BRIDGE_WIDTH, 0.5, bridgeData.blockLength * 0.9]} />
              <meshStandardMaterial
                color="#FFFFFF"
                transparent
                opacity={0.1}
                depthWrite={false}
              />
            </mesh>
          );
        }

        // Solid drivable bridge block
        return (
          <RigidBody
            key={`bridge-${i}`}
            type="fixed"
            colliders="cuboid"
            position={block.position.toArray() as [number, number, number]}
            rotation={[0, bridgeData.angle, 0]}
          >
            <mesh castShadow receiveShadow>
              <boxGeometry args={[BRIDGE_WIDTH, 0.5, bridgeData.blockLength * 0.9]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.2}
                roughness={0.6}
              />
            </mesh>

            {/* Railings */}
            <mesh position={[-BRIDGE_WIDTH / 2 + 0.2, 0.6, 0]} castShadow>
              <boxGeometry args={[0.3, 0.8, bridgeData.blockLength * 0.9]} />
              <meshStandardMaterial color="#FFD93D" roughness={0.7} />
            </mesh>
            <mesh position={[BRIDGE_WIDTH / 2 - 0.2, 0.6, 0]} castShadow>
              <boxGeometry args={[0.3, 0.8, bridgeData.blockLength * 0.9]} />
              <meshStandardMaterial color="#FFD93D" roughness={0.7} />
            </mesh>
          </RigidBody>
        );
      })}
    </group>
  );
};
