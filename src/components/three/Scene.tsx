"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import { Lighting } from "./Lighting";
import { Tiles } from "./Tiles";
import { Character } from "./Character";
import { Collectibles } from "./Collectibles";
import { WaterPlane } from "./WaterPlane";
import { AmbientParticles } from "./AmbientParticles";
import { ScorePopups } from "./ScorePopup";
import { Decorations } from "./Decorations";
import { COLORS, TILE_SIZE, MAP_LAYOUT } from "@/game/constants";
import { useRef } from "react";
import * as THREE from "three";
import { useGameStore } from "@/game/stores/game-store";

// Compute map center once (fixed pivot for rotation)
const MAP_ROWS = MAP_LAYOUT.length;       // 11
const MAP_COLS = MAP_LAYOUT[0].length;    // 9
const PIVOT_X = ((MAP_COLS - 1) / 2) * TILE_SIZE; // 4.4
const PIVOT_Z = ((MAP_ROWS - 1) / 2) * TILE_SIZE; // 5.5

/**
 * WorldRoot rotates the world around the island's geographic center.
 * Uses the same two-group offset technique for a clean, stable pivot.
 */
function WorldRoot({ children }: { children: React.ReactNode }) {
  const outerRef = useRef<THREE.Group>(null);
  const cameraAngle = useGameStore((s) => s.cameraAngle);

  useFrame((_, delta) => {
    if (!outerRef.current) return;
    outerRef.current.rotation.y = THREE.MathUtils.lerp(
      outerRef.current.rotation.y,
      (cameraAngle * Math.PI) / 180,
      delta * 5,
    );
  });

  return (
    // Outer group at center pivot point — rotates around it
    <group ref={outerRef} position={[PIVOT_X, 0, PIVOT_Z]}>
      {/* Inner group shifts content so island center = local origin */}
      <group position={[-PIVOT_X, 0, -PIVOT_Z]}>
        {children}
      </group>
    </group>
  );
}

const BG_NIGHT = new THREE.Color(COLORS.bg);
const BG_DAY = new THREE.Color("#dde4f5");

function SmoothBackground() {
  const isDay = useGameStore((s) => s.isDay);
  const colorRef = useRef(new THREE.Color(COLORS.bg));

  useFrame(({ scene }, delta) => {
    const target = isDay ? BG_DAY : BG_NIGHT;
    colorRef.current.lerp(target, delta * 3);
    scene.background = colorRef.current.clone();
    if (scene.fog && scene.fog instanceof THREE.Fog) {
      scene.fog.color.copy(colorRef.current);
    }
  });

  return <fog attach="fog" args={[COLORS.bg, 20, 50]} />;
}

function SceneContent() {
  return (
    <>
      <SmoothBackground />
      <Lighting />
      <WorldRoot>
        <WaterPlane />
        <Physics gravity={[0, -9.81, 0]}>
          <Tiles />
          <Character />
          <Collectibles />
          <Decorations />
        </Physics>
        <AmbientParticles />
        <ScorePopups />
      </WorldRoot>
      <OrbitControls
        makeDefault
        target={[PIVOT_X, 0, PIVOT_Z]}
        enablePan={false}
        enableZoom={true}
        minZoom={50}
        maxZoom={140}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 3.2}
      />
    </>
  );
}

export function Scene() {
  return (
    <Canvas
      orthographic
      camera={{ zoom: 80, position: [10, 12, 10] }}
      shadows
      gl={{
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
        antialias: true,
      }}
    >
      <SceneContent />
    </Canvas>
  );
}
