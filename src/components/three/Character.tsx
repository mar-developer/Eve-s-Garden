"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useGameStore } from "@/game/stores/game-store";
import { useCharacterStore } from "@/game/stores/character-store";
import {
  TILE_SIZE,
  TILE_HEIGHT,
  MOVE_SPEED,
  HOP_HEIGHT,
} from "@/game/constants";
import { RigidBody, type RapierRigidBody } from "@react-three/rapier";
import type { CharacterConfig } from "@/types";

/* ── Material name → config key mapping ── */
const MATERIAL_CONFIG_MAP: Record<string, keyof CharacterConfig> = {
  Skin: "skinTone",
  Hair: "hairColor",
  Outfit: "bodyColor",
  Pants: "pantsColor",
  Shoes: "shoeColor",
};

/* ── GLB Character Model ── */
function CharacterModel({
  config,
  isMoving,
}: {
  config: CharacterConfig;
  isMoving: boolean;
}) {
  const { scene } = useGLTF("/models/character.glb");
  const leftArmRef = useRef<THREE.Object3D | null>(null);
  const rightArmRef = useRef<THREE.Object3D | null>(null);

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          mesh.material = (mesh.material as THREE.Material).clone();
        }
        mesh.castShadow = true;
      }
    });
    return clone;
  }, [scene]);

  // Find arm nodes for animation
  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child.name === "Char_Arm_Upper_L") leftArmRef.current = child;
      if (child.name === "Char_Arm_Upper_R") rightArmRef.current = child;
    });
  }, [clonedScene]);

  // Update materials when config changes
  useEffect(() => {
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mat = (child as THREE.Mesh)
          .material as THREE.MeshStandardMaterial;
        if (!mat.name) return;
        const configKey = MATERIAL_CONFIG_MAP[mat.name];
        if (configKey && config[configKey]) {
          mat.color.set(config[configKey] as string);
        }
      }
    });
  }, [config, clonedScene]);

  // Arm swing animation
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (isMoving) {
      if (leftArmRef.current)
        leftArmRef.current.rotation.x = Math.sin(t * 8) * 0.5;
      if (rightArmRef.current)
        rightArmRef.current.rotation.x = Math.sin(t * 8 + Math.PI) * 0.5;
    } else {
      if (leftArmRef.current) leftArmRef.current.rotation.x *= 0.9;
      if (rightArmRef.current) rightArmRef.current.rotation.x *= 0.9;
    }
  });

  // Character height in GLB: ~1.31 units (0 to 1.31 after centering)
  // Current primitive character: ~0.80 units (-0.02 to 0.78)
  // Scale to match: 0.80 / 1.31 ≈ 0.61
  return (
    <group position={[0, -0.02, 0]} scale={0.61}>
      <primitive object={clonedScene} />
    </group>
  );
}

/* ── GLB Accessory wrapper ── */
function AccessoryModel({ path }: { path: string }) {
  const { scene } = useGLTF(path);
  const clone = useMemo(() => scene.clone(true), [scene]);
  return (
    <group position={[0, -0.02, 0]} scale={0.61}>
      <primitive object={clone} />
    </group>
  );
}

/* ── Main Character Component ── */
export function Character() {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<RapierRigidBody>(null);
  const moveProgressRef = useRef(0);
  const prevPosRef = useRef({ x: 0, z: 0 });

  const config = useCharacterStore((s) => s.config);
  const player = useGameStore((s) => s.player);
  const advanceStep = useGameStore((s) => s.advanceStep);
  const collectedSize = useGameStore((s) => s.collected.size);

  const spinRef = useRef(0);
  const prevCollectedRef = useRef(0);

  useMemo(() => {
    prevPosRef.current = { x: player.gridX, z: player.gridZ };
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current || !bodyRef.current) return;
    const group = groupRef.current;
    const body = bodyRef.current;
    const time = state.clock.getElapsedTime();

    if (collectedSize > prevCollectedRef.current) {
      prevCollectedRef.current = collectedSize;
      spinRef.current = 0.3;
    }

    if (spinRef.current > 0) {
      spinRef.current -= delta;
      group.rotation.y += delta * 22;
    }

    let nextX, nextY, nextZ;

    if (player.isMoving && player.movePath.length > 0) {
      moveProgressRef.current += delta * MOVE_SPEED;

      if (moveProgressRef.current >= 1) {
        const step = player.movePath[0];
        prevPosRef.current = { x: step.x, z: step.z };
        moveProgressRef.current = 0;
        advanceStep();
      } else {
        const nextStep = player.movePath[0];
        const fromX = prevPosRef.current.x * TILE_SIZE;
        const fromZ = prevPosRef.current.z * TILE_SIZE;
        const toX = nextStep.x * TILE_SIZE;
        const toZ = nextStep.z * TILE_SIZE;
        const t = moveProgressRef.current;

        nextX = fromX + (toX - fromX) * t;
        nextZ = fromZ + (toZ - fromZ) * t;
        nextY = TILE_HEIGHT + Math.sin(t * Math.PI) * HOP_HEIGHT;

        const angle = Math.atan2(toX - fromX, toZ - fromZ);
        group.rotation.y = angle;
      }
    } else {
      nextX = player.gridX * TILE_SIZE;
      nextZ = player.gridZ * TILE_SIZE;
      nextY = TILE_HEIGHT + Math.sin(time * 2) * 0.03;
      moveProgressRef.current = 0;
      prevPosRef.current = { x: player.gridX, z: player.gridZ };
    }

    if (
      nextX !== undefined &&
      nextY !== undefined &&
      nextZ !== undefined &&
      !isNaN(nextX) &&
      !isNaN(nextY) &&
      !isNaN(nextZ)
    ) {
      body.setNextKinematicTranslation({ x: nextX, y: nextY, z: nextZ });
    }
  });

  return (
    <RigidBody ref={bodyRef} type="kinematicPosition" colliders="ball">
      <group ref={groupRef}>
        <CharacterModel config={config} isMoving={player.isMoving} />

        {config.accessory === "glasses" && (
          <AccessoryModel path="/models/accessory-glasses.glb" />
        )}
        {config.accessory === "backpack" && (
          <AccessoryModel path="/models/accessory-backpack.glb" />
        )}
        {config.accessory === "hat" && (
          <AccessoryModel path="/models/accessory-hat.glb" />
        )}
      </group>
    </RigidBody>
  );
}

/* ── Preload all character models ── */
useGLTF.preload("/models/character.glb");
useGLTF.preload("/models/accessory-glasses.glb");
useGLTF.preload("/models/accessory-backpack.glb");
useGLTF.preload("/models/accessory-hat.glb");
