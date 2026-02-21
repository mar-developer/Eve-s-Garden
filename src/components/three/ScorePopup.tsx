"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { useGameStore } from "@/game/stores/game-store";
import { TILE_SIZE, TILE_HEIGHT } from "@/game/constants";

function Popup({
  id,
  x,
  z,
  points,
  combo,
  color,
}: {
  id: number;
  x: number;
  z: number;
  points: number;
  combo: number;
  color: string;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const lifeRef = useRef(0);
  const removePopup = useGameStore((s) => s.removePopup);
  const startY = TILE_HEIGHT + 0.6;

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    lifeRef.current += delta;

    // Float up
    groupRef.current.position.y = startY + lifeRef.current * 1.5;

    // Fade out
    const opacity = Math.max(0, 1 - lifeRef.current / 1.0);
    groupRef.current.children.forEach((child) => {
      if ((child as any).material) {
        (child as any).material.opacity = opacity;
      }
    });

    // Scale bounce (quick expand then settle)
    const scale = lifeRef.current < 0.15 ? 1 + (0.15 - lifeRef.current) * 3 : 1;
    groupRef.current.scale.setScalar(scale);

    // Self-destruct
    if (lifeRef.current > 1.0) {
      removePopup(id);
    }
  });

  const label = combo > 1 ? `+${points} ×${combo}` : `+${points}`;

  return (
    <group ref={groupRef} position={[x * TILE_SIZE, startY, z * TILE_SIZE]}>
      <Text
        fontSize={0.18}
        color={color}
        anchorX="center"
        anchorY="middle"
        font="/fonts/JetBrainsMono-Bold.woff"
        outlineWidth={0.015}
        outlineColor="#000000"
        material-transparent
        material-depthWrite={false}
      >
        {label}
      </Text>
    </group>
  );
}

export function ScorePopups() {
  const popups = useGameStore((s) => s.popups);

  return (
    <group>
      {popups.map((p) => (
        <Popup key={p.id} {...p} />
      ))}
    </group>
  );
}
