"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "@/game/stores/game-store";

const PARTICLE_COUNT = 80;
const BOUNDS = { x: 11, y: 4, z: 11 };
const OFFSET = { x: -1, y: 0.3, z: -1 };

const NIGHT_COLOR = new THREE.Color("#f5c542");
const DAY_COLOR = new THREE.Color("#ffffff");
const _target = new THREE.Color();

export function AmbientParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const isDay = useGameStore((s) => s.isDay);

  // Pre-compute per-particle data
  const { positions, velocities, phases } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);
    const phases = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      positions[i3] = Math.random() * BOUNDS.x + OFFSET.x;
      positions[i3 + 1] = Math.random() * BOUNDS.y + OFFSET.y;
      positions[i3 + 2] = Math.random() * BOUNDS.z + OFFSET.z;

      velocities[i3] = (Math.random() - 0.5) * 0.003;
      velocities[i3 + 1] = Math.random() * 0.005 + 0.002;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.003;

      phases[i] = Math.random() * Math.PI * 2;
    }

    return { positions, velocities, phases };
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  useFrame(({ clock }, delta) => {
    if (!pointsRef.current) return;
    const t = clock.getElapsedTime();
    const posAttr = geometry.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      // Move with velocity + sinusoidal sway
      arr[i3] += velocities[i3] + Math.sin(t * 0.5 + phases[i]) * 0.002;
      arr[i3 + 1] += velocities[i3 + 1];
      arr[i3 + 2] += velocities[i3 + 2] + Math.cos(t * 0.4 + phases[i]) * 0.002;

      // Wrap particles back when they exit bounds
      if (arr[i3 + 1] > BOUNDS.y + OFFSET.y) {
        arr[i3 + 1] = OFFSET.y;
        arr[i3] = Math.random() * BOUNDS.x + OFFSET.x;
        arr[i3 + 2] = Math.random() * BOUNDS.z + OFFSET.z;
      }
      if (arr[i3] > BOUNDS.x + OFFSET.x) arr[i3] = OFFSET.x;
      if (arr[i3] < OFFSET.x) arr[i3] = BOUNDS.x + OFFSET.x;
      if (arr[i3 + 2] > BOUNDS.z + OFFSET.z) arr[i3 + 2] = OFFSET.z;
      if (arr[i3 + 2] < OFFSET.z) arr[i3 + 2] = BOUNDS.z + OFFSET.z;
    }

    posAttr.needsUpdate = true;

    // Smooth color transition
    const mat = pointsRef.current.material as THREE.PointsMaterial;
    _target.copy(isDay ? DAY_COLOR : NIGHT_COLOR);
    mat.color.lerp(_target, delta * 3);
    mat.size = THREE.MathUtils.lerp(mat.size, isDay ? 0.03 : 0.05, delta * 3);
    mat.opacity = THREE.MathUtils.lerp(mat.opacity, isDay ? 0.4 : 0.7, delta * 3);
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        color={NIGHT_COLOR}
        size={0.05}
        transparent
        opacity={0.7}
        depthWrite={false}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
