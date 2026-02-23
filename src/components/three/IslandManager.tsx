"use client";

import { useMemo } from 'react';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { useGameStore } from '../../game/stores/letter-crash-store';
import { ISLAND_NODES, BRIDGE_CONFIGS, getIslandById } from '../../game/dimensions/island-network';
import { DIMENSIONS } from '../../game/dimensions/themes';
import { Bridge } from './Bridge';

/**
 * Manages rendering of all islands and bridges in the archipelago.
 * Each island is a simplified version of the original Island component
 * but positioned according to the network layout.
 */

// Simplified tree for non-home islands (fewer details)
function MiniTree({ position, height }: { position: [number, number, number]; height: number }) {
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, height, 6]} />
        <meshStandardMaterial color="#8B6914" roughness={0.9} />
      </mesh>
      <mesh position={[0, height + 1.2, 0]} castShadow>
        <coneGeometry args={[1.8, 3, 6]} />
        <meshStandardMaterial color="#4CAF50" roughness={0.7} />
      </mesh>
    </group>
  );
}

function IslandMesh({
  islandPosition,
  radius,
  groundColor,
  particleColor,
  isHome,
}: {
  islandPosition: [number, number, number];
  radius: number;
  groundColor: string;
  particleColor: string;
  isHome: boolean;
}) {
  // Generate tree positions in a ring
  const trees = useMemo(() => {
    const count = isHome ? 14 : 8;
    const ringRadius = radius - 8;
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      return {
        position: [
          Math.cos(angle) * ringRadius,
          0,
          Math.sin(angle) * ringRadius,
        ] as [number, number, number],
        height: 2 + Math.abs(Math.sin(i * 127.1) * 1.5),
      };
    });
  }, [radius, isHome]);

  return (
    <group position={islandPosition}>
      {/* Main ground */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[0, -2, 0]}>
          <cylinderGeometry args={[radius, radius - 2, 4, 48]} />
          <meshStandardMaterial color={groundColor} />
        </mesh>
        <mesh receiveShadow position={[0, -9, 0]}>
          <coneGeometry args={[radius - 2, 10, 48]} />
          <meshStandardMaterial color="#444444" roughness={0.9} />
        </mesh>
      </RigidBody>

      {/* Edge glow */}
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius - 1, radius, 48]} />
        <meshBasicMaterial color={particleColor} transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* Trees */}
      {trees.map((tree, i) => (
        <MiniTree key={i} position={tree.position} height={tree.height} />
      ))}
    </group>
  );
}

export const IslandManager = () => {
  const currentIslandId = useGameStore((s) => s.currentIslandId);
  const unlockedBridges = useGameStore((s) => s.unlockedBridges);

  return (
    <group>
      {/* Render all islands */}
      {ISLAND_NODES.map((node) => {
        const theme = DIMENSIONS[node.dimension];
        const isHome = node.id === 'home';
        const isCurrent = node.id === currentIslandId;

        // Only render current island and directly connected unlocked islands
        // This keeps performance manageable
        const isVisible = isCurrent || isHome || isConnectedAndUnlocked(node.id, currentIslandId, unlockedBridges);
        if (!isVisible) return null;

        return (
          <IslandMesh
            key={node.id}
            islandPosition={node.position}
            radius={node.radius}
            groundColor={theme.groundColor}
            particleColor={theme.particleColor}
            isHome={isHome}
          />
        );
      })}

      {/* Render bridges */}
      {BRIDGE_CONFIGS.map((bridge) => {
        const fromNode = getIslandById(bridge.from);
        const toNode = getIslandById(bridge.to);
        if (!fromNode || !toNode) return null;

        // Only show bridges connected to visible islands
        const fromVisible = bridge.from === currentIslandId || bridge.from === 'home';
        const toVisible = bridge.to === currentIslandId || bridge.to === 'home';
        if (!fromVisible && !toVisible) return null;

        const isUnlocked = unlockedBridges.has(`${bridge.from}->${bridge.to}`);

        return (
          <Bridge
            key={`${bridge.from}-${bridge.to}`}
            from={fromNode.position}
            to={toNode.position}
            fromRadius={fromNode.radius}
            toRadius={toNode.radius}
            unlocked={isUnlocked}
          />
        );
      })}
    </group>
  );
};

/** Check if an island is connected to the current one via an unlocked bridge */
function isConnectedAndUnlocked(
  islandId: string,
  currentId: string,
  unlockedBridges: Set<string>,
): boolean {
  return (
    unlockedBridges.has(`${currentId}->${islandId}`) ||
    unlockedBridges.has(`${islandId}->${currentId}`)
  );
}
