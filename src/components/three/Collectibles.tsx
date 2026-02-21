"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useGameStore } from "@/game/stores/game-store";
import {
  COLLECTIBLE_POSITIONS,
  COLLECTIBLE_META,
  TILE_SIZE,
  TILE_HEIGHT,
} from "@/game/constants";
import type { CollectibleType } from "@/types";

/* ── GLB model paths per collectible type ── */
const MODEL_PATHS: Record<CollectibleType, string> = {
  tree: "/models/collectible-tree.glb",
  gem: "/models/collectible-gem.glb",
  crystal: "/models/collectible-crystal.glb",
  orb: "/models/collectible-orb.glb",
};

/* ── Collectible scales (tuned to match original primitive sizes) ── */
const MODEL_SCALES: Record<CollectibleType, number> = {
  tree: 0.7,
  gem: 0.55,
  crystal: 0.5,
  orb: 0.6,
};

/* ── GLB collectible shape ── */
function CollectibleShape({ type }: { type: CollectibleType }) {
  const { scene } = useGLTF(MODEL_PATHS[type]);
  const clone = useMemo(() => scene.clone(true), [scene]);
  const scale = MODEL_SCALES[type];
  return (
    <group scale={scale}>
      <primitive object={clone} />
    </group>
  );
}

/* ── Flash ring on collection ── */
function CollectFlash({
  position,
  color,
  onComplete,
}: {
  position: [number, number, number];
  color: string;
  onComplete: () => void;
}) {
  const ringRef = useRef<THREE.Mesh>(null);
  const lifeRef = useRef(0);
  const doneRef = useRef(false);

  useFrame((_, delta) => {
    if (!ringRef.current || doneRef.current) return;
    lifeRef.current += delta;
    const t = lifeRef.current / 0.5;

    const scale = 1 + t * 3;
    ringRef.current.scale.setScalar(scale);

    const mat = ringRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = Math.max(0, 1 - t);

    if (t >= 1) {
      doneRef.current = true;
      onComplete();
    }
  });

  return (
    <mesh
      ref={ringRef}
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <ringGeometry args={[0.15, 0.25, 24]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={1}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/* ── Particle burst on collection ── */
function CollectParticles({
  position,
  color,
  onComplete,
}: {
  position: [number, number, number];
  color: string;
  onComplete: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<
    { mesh: THREE.Mesh; vel: THREE.Vector3; life: number }[]
  >([]);
  const doneRef = useRef(false);

  useEffect(() => {
    if (!groupRef.current) return;
    const particles: typeof particlesRef.current = [];

    for (let i = 0; i < 16; i++) {
      const geo = new THREE.SphereGeometry(0.025, 4, 4);
      const mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 1,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(position[0], position[1], position[2]);
      groupRef.current.add(mesh);

      const angle = (i / 16) * Math.PI * 2;
      const speed = 0.06 + Math.random() * 0.06;
      particles.push({
        mesh,
        vel: new THREE.Vector3(
          Math.cos(angle) * speed,
          Math.random() * 0.1 + 0.05,
          Math.sin(angle) * speed,
        ),
        life: 1,
      });
    }
    particlesRef.current = particles;
  }, [position, color]);

  useFrame((_, delta) => {
    if (doneRef.current) return;
    let allDead = true;

    particlesRef.current.forEach((p) => {
      p.mesh.position.add(p.vel);
      p.vel.y -= 0.004;
      p.life -= delta * 2.2;
      (p.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(
        0,
        p.life,
      );
      if (p.life > 0) allDead = false;
    });

    if (allDead && particlesRef.current.length > 0) {
      doneRef.current = true;
      onComplete();
    }
  });

  return <group ref={groupRef} />;
}

/* ── Single Collectible ── */
function Collectible({ index }: { index: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const collected = useGameStore((s) => s.collected.has(index));
  const [showParticles, setShowParticles] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const wasCollectedRef = useRef(false);

  const spawn = COLLECTIBLE_POSITIONS[index];
  const meta = COLLECTIBLE_META[spawn.type];

  const worldPos: [number, number, number] = [
    spawn.x * TILE_SIZE,
    TILE_HEIGHT,
    spawn.z * TILE_SIZE,
  ];

  useFrame(({ clock }) => {
    if (!groupRef.current || collected) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y += 0.02;
    groupRef.current.position.y =
      TILE_HEIGHT + Math.sin(t * 2 + index) * 0.06 + 0.05;
  });

  useEffect(() => {
    if (collected && !wasCollectedRef.current) {
      wasCollectedRef.current = true;
      setShowParticles(true);
      setShowFlash(true);
    }
  }, [collected]);

  return (
    <>
      {!collected && (
        <group ref={groupRef} position={worldPos}>
          <CollectibleShape type={spawn.type} />
        </group>
      )}
      {showParticles && (
        <CollectParticles
          position={[worldPos[0], worldPos[1] + 0.3, worldPos[2]]}
          color={meta.color}
          onComplete={() => setShowParticles(false)}
        />
      )}
      {showFlash && (
        <CollectFlash
          position={[worldPos[0], worldPos[1] + 0.1, worldPos[2]]}
          color={meta.color}
          onComplete={() => setShowFlash(false)}
        />
      )}
    </>
  );
}

/* ── All Collectibles ── */
export function Collectibles() {
  return (
    <group>
      {COLLECTIBLE_POSITIONS.map((_, idx) => (
        <Collectible key={idx} index={idx} />
      ))}
    </group>
  );
}

/* ── Preload all collectible models ── */
useGLTF.preload("/models/collectible-tree.glb");
useGLTF.preload("/models/collectible-gem.glb");
useGLTF.preload("/models/collectible-crystal.glb");
useGLTF.preload("/models/collectible-orb.glb");
