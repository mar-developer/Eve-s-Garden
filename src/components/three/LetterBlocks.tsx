"use client";

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../game/stores/letter-crash-store';
import { LetterBlock } from '../../types/letter-crash';
import { dispatchEffect } from './LetterEffects';
import { getRandomEvent } from '../../game/events/event-registry';
import { getAnimalForLetter } from '../../game/animals/animal-registry';
import { soundManager } from '../../game/audio/sound-manager';
import { vibrateHit } from '../../game/audio/haptics';
import { carRef } from '../../game/stores/car-ref';

const SPAWN_STAGGER_MS = 150;
const SPAWN_OVERSHOOT = 1.15;
const SPAWN_SCALE_SPEED = 0.08;
const SETTLE_SCALE_SPEED = 0.12;
const DEATH_FLY_SPEED = 8;
const DEATH_SPIN_SPEED = 12;
const DEATH_SHRINK_FACTOR = 0.05;
const DEATH_REMOVE_THRESHOLD = 0.05;
const PORTAL_DELAY_MS = 800;

const HIT_DISTANCE = 2.5; // car radius ~1 + block half-size ~0.75 + tolerance

function Block({ block }: { block: LetterBlock }) {
  const meshRef = useRef<THREE.Group>(null);

  // Spawn timing: each block waits spawnIndex * 150ms before appearing
  const spawnTime = useRef(Date.now() + block.spawnIndex * SPAWN_STAGGER_MS);
  const spawnPhase = useRef<'waiting' | 'growing' | 'settling' | 'idle'>('waiting');

  // Death animation state
  const dying = useRef(false);
  const isHit = useRef(false);

  const handleCollision = () => {
    if (isHit.current) return;
    isHit.current = true;

    dying.current = true;

    const store = useGameStore.getState();
    const eventType = store.learningMode ? 'Animal' as const : getRandomEvent();

    store.incrementScore();
    store.markLetterHit(block.id, block.letter, eventType);
    dispatchEffect(eventType, block.position, eventType === 'Animal' ? block.letter : undefined);

    if (eventType === 'Animal') {
      store.recordAnimalHit(block.letter);
      const animal = getAnimalForLetter(block.letter);
      if (animal) {
        store.showSpeechBubble({
          letter: block.letter,
          animalName: animal.name,
          position: block.position,
          timestamp: Date.now(),
        });
        setTimeout(() => {
          useGameStore.getState().clearSpeechBubble();
        }, 3000);
      }
    }

    soundManager.playSfx('crash');
    vibrateHit();

    if (eventType === 'Portal') {
      soundManager.playSfx('portal');
    } else if (eventType === 'Stars') {
      soundManager.playSfx('star');
    } else if (eventType === 'Enemy') {
      soundManager.playSfx('boing');
    } else if (eventType === 'Music') {
      soundManager.playSfx('note');
    }

    if (eventType === 'Portal') {
      setTimeout(() => {
        useGameStore.getState().changeDimension();
      }, PORTAL_DELAY_MS);
    }
  };

  useFrame((state, delta) => {
    const group = meshRef.current;
    if (!group) return;

    const now = Date.now();

    // --- Spawn animation (staggered with overshoot bounce) ---
    if (!dying.current) {
      if (spawnPhase.current === 'waiting') {
        group.scale.set(0, 0, 0);
        if (now >= spawnTime.current) {
          spawnPhase.current = 'growing';

          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('letter-spawn-poof', {
                detail: { position: block.position, color: block.color },
              }),
            );
          }
        }
        return;
      }

      if (spawnPhase.current === 'growing') {
        const s = THREE.MathUtils.lerp(group.scale.x, SPAWN_OVERSHOOT, SPAWN_SCALE_SPEED);
        group.scale.set(s, s, s);
        if (s >= SPAWN_OVERSHOOT - 0.01) {
          spawnPhase.current = 'settling';
        }
        return;
      }

      if (spawnPhase.current === 'settling') {
        const s = THREE.MathUtils.lerp(group.scale.x, 1.0, SETTLE_SCALE_SPEED);
        group.scale.set(s, s, s);
        if (Math.abs(s - 1.0) < 0.01) {
          group.scale.set(1, 1, 1);
          spawnPhase.current = 'idle';
        }
        return;
      }

      // Idle: gentle bob + slow spin + collision check
      if (spawnPhase.current === 'idle') {
        group.position.y = Math.sin(state.clock.elapsedTime * 2 + block.spawnIndex) * 0.2;
        group.rotation.y += delta * 0.5;

        // Manual distance-based collision with car
        if (!isHit.current) {
          const [cx, , cz] = carRef.position;
          const dx = cx - block.position[0];
          const dz = cz - block.position[2];
          if (dx * dx + dz * dz < HIT_DISTANCE * HIT_DISTANCE) {
            handleCollision();
          }
        }
      }
      return;
    }

    // --- Death animation: fly up, spin fast, shrink to zero ---
    group.position.y += delta * DEATH_FLY_SPEED;
    group.rotation.y += delta * DEATH_SPIN_SPEED;

    const newScale = THREE.MathUtils.lerp(group.scale.x, 0, DEATH_SHRINK_FACTOR);
    group.scale.set(newScale, newScale, newScale);

    if (newScale < DEATH_REMOVE_THRESHOLD) {
      const store = useGameStore.getState();
      store.removeLetterBlock(block.id);

      // Check if this was the last block (store still has it until next tick,
      // so <= 1 means only this block remains in the array)
      if (store.letterBlocks.length <= 1) {
        store.setGamePhase('allClear');
      }
    }
  });

  return (
    <group position={block.position}>
      <group ref={meshRef}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.5, 1.5, 1.5]} />
          <meshStandardMaterial
            color={block.color}
            emissive={block.color}
            emissiveIntensity={0.5}
          />
        </mesh>

        <Text
          position={[0, 0, 0.76]}
          fontSize={1.2}
          color="#111"
          font="/fonts/dm-sans-bold.ttf"
          anchorX="center"
          anchorY="middle"
        >
          {block.letter.toUpperCase()}
        </Text>
        <Text
          position={[0, 0, -0.76]}
          rotation={[0, Math.PI, 0]}
          fontSize={1.2}
          color="#111"
          font="/fonts/dm-sans-bold.ttf"
          anchorX="center"
          anchorY="middle"
        >
          {block.letter.toUpperCase()}
        </Text>
      </group>
    </group>
  );
}

export const LetterBlocks = () => {
  const letterBlocks = useGameStore((state) => state.letterBlocks);

  return (
    <group>
      {letterBlocks.map((block) => (
        <Block key={block.id} block={block} />
      ))}
    </group>
  );
};
