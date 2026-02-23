"use client";

import { useRef, useEffect, Suspense } from 'react';
import { KeyboardControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
} from '@react-three/postprocessing';
import * as THREE from 'three';
import { Car } from './Car';
import { IslandManager } from './IslandManager';
import { LetterBlocks } from './LetterBlocks';
import { LetterEffects } from './LetterEffects';
import { DimensionSky } from './DimensionSky';
import { Particles } from './Particles';
import { PlacedDecorations } from './PlacedDecorations';
import { MiniGameRenderer } from './MiniGameRenderer';
import { KeyboardBridge } from './KeyboardBridge';

const keyboardMap = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
  { name: 'boost', keys: ['ShiftLeft', 'ShiftRight'] },
];

/**
 * Animated chromatic aberration that pulses during dimension warps.
 * Uses a ref to avoid re-renders -- the offset Vector2 is mutated in place.
 */
function WarpChromaticAberration() {
  const offsetRef = useRef(new THREE.Vector2(0, 0));
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    const handler = () => {
      // Cancel any in-flight animation
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);

      const start = performance.now();
      const PEAK = 0.005;
      const DURATION = 600; // ms total (ramp up + ramp down)

      const tick = (now: number) => {
        const elapsed = now - start;
        const t = Math.min(elapsed / DURATION, 1);

        // Triangle wave: 0 -> peak at 0.3 -> 0 at 1.0
        let intensity: number;
        if (t < 0.3) {
          intensity = PEAK * (t / 0.3);
        } else {
          intensity = PEAK * (1 - (t - 0.3) / 0.7);
        }

        offsetRef.current.set(intensity, intensity);

        if (t < 1) {
          animRef.current = requestAnimationFrame(tick);
        } else {
          offsetRef.current.set(0, 0);
          animRef.current = null;
        }
      };

      animRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener('dimension-warp', handler);
    return () => {
      window.removeEventListener('dimension-warp', handler);
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return <ChromaticAberration offset={offsetRef.current} />;
}

export default function LetterCrashScene() {
  return (
    <div className="w-full h-full">
      <KeyboardControls map={keyboardMap}>
        <Canvas shadows camera={{ position: [0, 8, -12], fov: 45 }}>
          <Suspense fallback={null}>
            <DimensionSky />

            <KeyboardBridge />

            <Physics>
              <IslandManager />
              <Car />
              <LetterBlocks />
              <MiniGameRenderer />
            </Physics>

            <PlacedDecorations />
            <LetterEffects />
            <Particles />
          </Suspense>
          
          <EffectComposer>
            <Bloom luminanceThreshold={0.8} mipmapBlur intensity={0.8} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
            <WarpChromaticAberration />
          </EffectComposer>
        </Canvas>
      </KeyboardControls>
    </div>
  );
}
