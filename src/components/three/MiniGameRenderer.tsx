"use client";

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../game/stores/letter-crash-store';
import {
  isMiniGameExpired,
  allTargetsCollected,
  getNextExpectedOrder,
} from '../../game/minigames/minigame-manager';
import type { MiniGameTarget, MiniGameType } from '../../types/letter-crash';

// ---------------------------------------------------------------------------
// Per-target component -- handles animation, collision, and collect-out
// ---------------------------------------------------------------------------

interface TargetProps {
  target: MiniGameTarget;
  gameType: MiniGameType;
  isNextExpected: boolean;
}

function Target({ target, gameType, isNextExpected }: TargetProps) {
  const groupRef = useRef<THREE.Group>(null);
  const collectingRef = useRef(false);
  const scaleRef = useRef(1);

  const handleCollision = () => {
    if (collectingRef.current || target.collected) return;
    collectingRef.current = true;
    useGameStore.getState().collectMiniGameTarget(target.id);
  };

  useFrame(({ clock }) => {
    const g = groupRef.current;
    if (!g) return;

    // Collect-out animation: lerp scale toward 0
    if (target.collected || collectingRef.current) {
      scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, 0, 0.15);
      g.scale.setScalar(Math.max(scaleRef.current, 0.001));
      return;
    }

    const t = clock.getElapsedTime();

    // Floating bob
    g.position.y = target.position[1] + Math.sin(t * 2 + target.position[0]) * 0.3;

    // Next-expected pulsing scale highlight
    if (isNextExpected) {
      const pulse = 1 + Math.sin(t * 6) * 0.15;
      g.scale.setScalar(pulse);
    } else {
      g.scale.setScalar(1);
    }

    // Type-specific idle rotation
    if (gameType === 'ColorMatch' || gameType === 'QuickBuild') {
      g.rotation.y += 0.02;
    }
    if (gameType === 'MusicMaker') {
      g.rotation.z = Math.sin(t * 1.5 + target.position[2]) * 0.15;
    }
  });

  return (
    <RigidBody
      type="fixed"
      position={target.position}
      sensor
      onIntersectionEnter={handleCollision}
    >
      <group ref={groupRef}>
        <TargetMesh gameType={gameType} color={target.color} order={target.order} />
        <pointLight color={target.color} intensity={2} distance={8} />
      </group>
    </RigidBody>
  );
}

// ---------------------------------------------------------------------------
// Type-specific target meshes
// ---------------------------------------------------------------------------

interface TargetMeshProps {
  gameType: MiniGameType;
  color: string;
  order?: number;
}

function TargetMesh({ gameType, color, order }: TargetMeshProps) {
  switch (gameType) {
    case 'TargetPractice':
      return <BullseyeMesh color={color} />;
    case 'SpeedRings':
      return <SpeedRingMesh color={color} />;
    case 'ColorMatch':
      return <ColorMatchMesh color={color} order={order} />;
    case 'MusicMaker':
      return <MusicNoteMesh color={color} />;
    case 'QuickBuild':
      return <QuickBuildMesh color={color} />;
  }
}

/** TargetPractice: bullseye rings -- torus outer ring + flat cylinder center */
function BullseyeMesh({ color }: { color: string }) {
  return (
    <group>
      <mesh castShadow>
        <torusGeometry args={[1.2, 0.2, 8, 24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
      </mesh>
      <mesh castShadow>
        <torusGeometry args={[0.6, 0.15, 8, 24]} />
        <meshStandardMaterial color="#FFD93D" emissive="#FFD93D" emissiveIntensity={0.4} />
      </mesh>
      <mesh castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.15, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

/** SpeedRings: upright colored torus with emissive glow */
function SpeedRingMesh({ color }: { color: string }) {
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <mesh castShadow>
        <torusGeometry args={[2, 0.35, 10, 28]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}

/** ColorMatch: colored cube with order number label */
function ColorMatchMesh({ color, order }: { color: string; order?: number }) {
  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[1.4, 1.4, 1.4]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
      </mesh>
      {order !== undefined && (
        <>
          <Text
            position={[0, 0, 0.71]}
            fontSize={0.9}
            color="#111"
            anchorX="center"
            anchorY="middle"
          >
            {String(order + 1)}
          </Text>
          <Text
            position={[0, 0, -0.71]}
            rotation={[0, Math.PI, 0]}
            fontSize={0.9}
            color="#111"
            anchorX="center"
            anchorY="middle"
          >
            {String(order + 1)}
          </Text>
        </>
      )}
    </group>
  );
}

/** MusicMaker: sphere note-head + cylinder stem */
function MusicNoteMesh({ color }: { color: string }) {
  return (
    <group>
      <mesh castShadow position={[0, 0, 0]}>
        <sphereGeometry args={[0.5, 12, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
      <mesh castShadow position={[0.3, 0.9, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 1.6, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

/** QuickBuild: stacked wireframe boxes via EdgesGeometry */
function QuickBuildMesh({ color }: { color: string }) {
  const edges = useMemo(() => {
    const boxGeo = new THREE.BoxGeometry(1.4, 1.0, 1.4);
    const edgeGeo = new THREE.EdgesGeometry(boxGeo);
    boxGeo.dispose();
    return edgeGeo;
  }, []);

  return (
    <group>
      {[0, 1.1, 2.2].map((y, i) => (
        <lineSegments key={i} position={[0, y - 1.1, 0]} geometry={edges}>
          <lineBasicMaterial color={color} linewidth={2} />
        </lineSegments>
      ))}
      {/* Solid inner cube for the glow */}
      <mesh castShadow>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          transparent
          opacity={0.5}
        />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Parent renderer -- subscribes to store, handles expiry/completion checks
// ---------------------------------------------------------------------------

export function MiniGameRenderer() {
  const activeMiniGame = useGameStore((s) => s.activeMiniGame);
  const miniGameTargets = useGameStore((s) => s.miniGameTargets);
  const endMiniGame = useGameStore((s) => s.endMiniGame);

  // Check expiry and completion each frame
  useFrame(() => {
    if (!activeMiniGame) return;

    if (isMiniGameExpired(activeMiniGame)) {
      endMiniGame(false);
      return;
    }

    if (allTargetsCollected(miniGameTargets)) {
      endMiniGame(true);
    }
  });

  if (!activeMiniGame) return null;

  const nextExpected = getNextExpectedOrder(miniGameTargets);

  return (
    <group>
      {miniGameTargets.map((target) => (
        <Target
          key={target.id}
          target={target}
          gameType={activeMiniGame.type}
          isNextExpected={target.order === nextExpected}
        />
      ))}
    </group>
  );
}
