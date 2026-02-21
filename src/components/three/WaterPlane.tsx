"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "@/game/stores/game-store";

const WaterShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uColorA: new THREE.Color("#0a0a20"),
    uColorB: new THREE.Color("#1a1040"),
    uOpacity: 0.55,
  },
  // Vertex shader
  `
    uniform float uTime;
    varying vec2 vUv;
    varying float vWave;

    void main() {
      vUv = uv;
      vec3 pos = position;
      float wave = sin(pos.x * 2.5 + uTime * 0.6) * 0.025
                 + sin(pos.z * 3.0 + uTime * 0.8) * 0.02
                 + sin((pos.x + pos.z) * 1.5 + uTime * 0.4) * 0.015;
      pos.y += wave;
      vWave = wave;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    uniform float uTime;
    uniform float uOpacity;
    varying vec2 vUv;
    varying float vWave;

    void main() {
      float gradient = smoothstep(0.0, 1.0, vUv.y);
      vec3 color = mix(uColorA, uColorB, gradient);

      // Subtle shimmer based on wave height
      float shimmer = smoothstep(-0.02, 0.03, vWave) * 0.15;
      color += shimmer;

      // Soft radial fade at edges
      vec2 center = vUv - 0.5;
      float dist = length(center);
      float fade = 1.0 - smoothstep(0.3, 0.5, dist);

      gl_FragColor = vec4(color, uOpacity * fade);
    }
  `
);

extend({ WaterShaderMaterial });

// Augment JSX
declare module "@react-three/fiber" {
  interface ThreeElements {
    waterShaderMaterial: any;
  }
}

const NIGHT_A = new THREE.Color("#0a0a20");
const NIGHT_B = new THREE.Color("#1a1040");
const DAY_A = new THREE.Color("#8ab4d8");
const DAY_B = new THREE.Color("#a0c8e8");

const _targetA = new THREE.Color();
const _targetB = new THREE.Color();

export function WaterPlane() {
  const matRef = useRef<any>(null);
  const isDay = useGameStore((s) => s.isDay);

  useFrame(({ clock }, delta) => {
    if (!matRef.current) return;
    matRef.current.uTime = clock.getElapsedTime();

    // Lerp colors for smooth day/night transition
    _targetA.copy(isDay ? DAY_A : NIGHT_A);
    _targetB.copy(isDay ? DAY_B : NIGHT_B);
    matRef.current.uColorA.lerp(_targetA, delta * 3);
    matRef.current.uColorB.lerp(_targetB, delta * 3);
    matRef.current.uOpacity = THREE.MathUtils.lerp(
      matRef.current.uOpacity,
      isDay ? 0.4 : 0.55,
      delta * 3,
    );
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4.4, -0.12, 4.4]}>
      <planeGeometry args={[40, 40, 64, 64]} />
      <waterShaderMaterial
        ref={matRef}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
