"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "@/game/stores/game-store";

// Day/Night target values
const HEMI_SKY_NIGHT = new THREE.Color("#0c1b21");
const HEMI_SKY_DAY = new THREE.Color("#e0f2fe");
const HEMI_GND_NIGHT = new THREE.Color("#040a0c");
const HEMI_GND_DAY = new THREE.Color("#6b4f2a");

const AMB_NIGHT = new THREE.Color("#99f6e4");
const AMB_DAY = new THREE.Color("#ffffff");

const DIR_NIGHT = new THREE.Color("#6ee7b7");
const DIR_DAY = new THREE.Color("#fef08a");

const RIM_NIGHT = new THREE.Color("#34d399");
const RIM_DAY = new THREE.Color("#fcd34d");

const PT_NIGHT = new THREE.Color("#059669");
const PT_DAY = new THREE.Color("#f59e0b");


export function Lighting() {
  const isDay = useGameStore((s) => s.isDay);

  const hemiRef = useRef<THREE.HemisphereLight>(null);
  const ambRef = useRef<THREE.AmbientLight>(null);
  const dirRef = useRef<THREE.DirectionalLight>(null);
  const rimRef = useRef<THREE.DirectionalLight>(null);
  const ptRef = useRef<THREE.PointLight>(null);

  useFrame((_, delta) => {
    const speed = delta * 3;

    if (hemiRef.current) {
      hemiRef.current.color.lerp(isDay ? HEMI_SKY_DAY : HEMI_SKY_NIGHT, speed);
      hemiRef.current.groundColor.lerp(isDay ? HEMI_GND_DAY : HEMI_GND_NIGHT, speed);
      hemiRef.current.intensity = THREE.MathUtils.lerp(
        hemiRef.current.intensity,
        isDay ? 0.6 : 0.4,
        speed,
      );
    }

    if (ambRef.current) {
      ambRef.current.color.lerp(isDay ? AMB_DAY : AMB_NIGHT, speed);
      ambRef.current.intensity = THREE.MathUtils.lerp(
        ambRef.current.intensity,
        isDay ? 0.5 : 0.35,
        speed,
      );
    }

    if (dirRef.current) {
      dirRef.current.color.lerp(isDay ? DIR_DAY : DIR_NIGHT, speed);
      dirRef.current.intensity = THREE.MathUtils.lerp(
        dirRef.current.intensity,
        isDay ? 1.8 : 1.0,
        speed,
      );
    }

    if (rimRef.current) {
      rimRef.current.color.lerp(isDay ? RIM_DAY : RIM_NIGHT, speed);
      rimRef.current.intensity = THREE.MathUtils.lerp(
        rimRef.current.intensity,
        isDay ? 0.35 : 0.5,
        speed,
      );
    }

    if (ptRef.current) {
      ptRef.current.color.lerp(isDay ? PT_DAY : PT_NIGHT, speed);
      ptRef.current.intensity = THREE.MathUtils.lerp(
        ptRef.current.intensity,
        isDay ? 0.5 : 0.8,
        speed,
      );
    }
  });

  return (
    <>
      <hemisphereLight
        ref={hemiRef}
        args={["#0c1b21", "#040a0c", 0.4]}
      />

      <ambientLight
        ref={ambRef}
        color="#99f6e4"
        intensity={0.35}
      />

      <directionalLight
        ref={dirRef}
        color="#6ee7b7"
        intensity={1.0}
        position={[8, 14, 6]}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.001}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
      />

      <directionalLight
        ref={rimRef}
        color="#34d399"
        intensity={0.5}
        position={[-6, 4, -6]}
      />

      <pointLight
        ref={ptRef}
        color="#059669"
        intensity={0.8}
        distance={22}
        decay={2}
        position={[5, 5, 5]}
      />
    </>
  );
}
