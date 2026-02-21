"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import {
  DECORATION_POSITIONS,
  TILE_SIZE,
  TILE_HEIGHT,
  type DecorationType,
} from "@/game/constants";

/* ── GLB Mushroom ── */
function Mushroom({ scale = 1 }: { scale?: number }) {
  const { scene } = useGLTF("/models/mushroom-toadstool.glb");
  const clone = useMemo(() => scene.clone(true), [scene]);
  return (
    <group scale={scale * 0.5}>
      <primitive object={clone} />
    </group>
  );
}

/* ── GLB Flower ── */
function Flower({ scale = 1 }: { scale?: number }) {
  const { scene } = useGLTF("/models/env-flower.glb");
  const clone = useMemo(() => scene.clone(true), [scene]);
  return (
    <group scale={scale * 0.6}>
      <primitive object={clone} />
    </group>
  );
}

/* ── GLB Rock ── */
function Rock({ scale = 1 }: { scale?: number }) {
  const { scene } = useGLTF("/models/env-rock.glb");
  const clone = useMemo(() => scene.clone(true), [scene]);
  return (
    <group scale={scale * 0.8}>
      <primitive object={clone} />
    </group>
  );
}

/* ── Lantern (kept as procedural — no GLB model) ── */
function Lantern({ scale = 1 }: { scale?: number }) {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (!lightRef.current) return;
    const t = clock.getElapsedTime();
    lightRef.current.intensity =
      0.4 + Math.sin(t * 1.5) * 0.15 + Math.sin(t * 3.7) * 0.05;
  });

  return (
    <group scale={[scale, scale, scale]}>
      <mesh position={[0, 0.09, 0]}>
        <cylinderGeometry args={[0.015, 0.02, 0.18, 5]} />
        <meshStandardMaterial color="#78716c" />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshStandardMaterial
          color="#fde68a"
          emissive="#fde68a"
          emissiveIntensity={0.8}
          transparent
          opacity={0.9}
        />
      </mesh>
      <pointLight
        ref={lightRef}
        color="#fde68a"
        intensity={0.4}
        distance={2.5}
        decay={2}
        position={[0, 0.22, 0]}
      />
    </group>
  );
}

const SHAPE_MAP: Record<DecorationType, React.FC<{ scale?: number }>> = {
  mushroom: Mushroom,
  flower: Flower,
  rock: Rock,
  lantern: Lantern,
};

export function Decorations() {
  return (
    <group>
      {DECORATION_POSITIONS.map((d, i) => {
        const Shape = SHAPE_MAP[d.type];
        return (
          <group
            key={i}
            position={[d.x * TILE_SIZE, TILE_HEIGHT - 0.02, d.z * TILE_SIZE]}
            rotation={[0, d.rotY ?? 0, 0]}
          >
            <Shape scale={d.scale ?? 1} />
          </group>
        );
      })}
    </group>
  );
}

/* ── Preload decoration models ── */
useGLTF.preload("/models/mushroom-toadstool.glb");
useGLTF.preload("/models/env-flower.glb");
useGLTF.preload("/models/env-rock.glb");
