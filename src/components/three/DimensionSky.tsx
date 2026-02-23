import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../game/stores/letter-crash-store';
import { DIMENSIONS } from '../../game/dimensions/themes';
import { soundManager } from '../../game/audio/sound-manager';
import { getTimeOfDay } from '../../game/analytics/local-analytics';

/** Time-of-day tint multipliers applied to dimension sky/fog colors */
const TOD_TINTS: Record<string, { sky: THREE.Color; fog: THREE.Color; ambient: number; sunY: number }> = {
  morning: { sky: new THREE.Color('#FFF5E6'), fog: new THREE.Color('#FFE8CC'), ambient: 0.9, sunY: 15 },
  afternoon: { sky: new THREE.Color('#FFFFFF'), fog: new THREE.Color('#FFFFFF'), ambient: 1.0, sunY: 20 },
  evening: { sky: new THREE.Color('#2C1654'), fog: new THREE.Color('#1A0A3E'), ambient: 0.5, sunY: 5 },
};

export const DimensionSky = () => {
  const currentDimension = useGameStore((state) => state.dimension);
  const theme = DIMENSIONS[currentDimension];
  const tod = useMemo(() => getTimeOfDay(), []);
  const todTint = TOD_TINTS[tod];

  // Memoize blended colors to avoid allocating every render
  const skyColor = useMemo(
    () => new THREE.Color(theme.skyColor).lerp(todTint.sky.clone(), 0.2),
    [theme.skyColor, todTint.sky],
  );
  const fogColor = useMemo(
    () => new THREE.Color(theme.fogColor).lerp(todTint.fog.clone(), 0.2),
    [theme.fogColor, todTint.fog],
  );
  const ambientIntensity = theme.ambientIntensity * todTint.ambient;
  const sceneRef = useRef<THREE.Scene | null>(null);

  // Crossfade music when dimension changes
  const prevDimension = useRef(currentDimension);
  useEffect(() => {
    if (prevDimension.current !== currentDimension) {
      soundManager.crossfadeTo(currentDimension, 1000);
      prevDimension.current = currentDimension;
    }
  }, [currentDimension]);

  useFrame((state) => {
    if (!sceneRef.current) {
        sceneRef.current = state.scene;
    }

    // Lerp background/fog
    if (state.scene.background instanceof THREE.Color) {
      state.scene.background.lerp(skyColor, 0.05);
    } else {
      state.scene.background = skyColor.clone();
    }
    
    // Use FogExp2 for density support
    if (state.scene.fog instanceof THREE.FogExp2) {
      state.scene.fog.color.lerp(fogColor, 0.05);
      state.scene.fog.density = THREE.MathUtils.lerp(state.scene.fog.density, theme.fogDensity, 0.05);
    } else {
      state.scene.fog = new THREE.FogExp2(fogColor.getHex(), theme.fogDensity);
    }
  });

  return (
    <>
      <ambientLight intensity={ambientIntensity} />
      <directionalLight
        castShadow
        position={[10, todTint.sunY, 10]}
        intensity={tod === 'evening' ? 0.8 : 1.5}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <Sparkles count={150} scale={50} size={4} speed={0.4} opacity={0.5} noise={2} color={theme.particleColor} />
    </>
  );
};

