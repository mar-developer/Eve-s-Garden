"use client";

import { useRef, useState, useMemo, useCallback, useEffect } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import {
  MAP_LAYOUT,
  TILE_SIZE,
  TILE_GAP,
  TILE_HEIGHT,
  getBiomeForRow,
  VANISHING_TILE_POSITIONS,
  VANISH_CYCLE_MS,
} from "@/game/constants";
import { findPath } from "@/game/pathfinding";
import { useGameStore } from "@/game/stores/game-store";
import { RigidBody } from "@react-three/rapier";

/* ─── Biome-aware tile colors ─────────────────────────────────────────────
 * Each tile gets its color from the biome zone it belongs to,
 * creating themed regions across the map.
 */
function getTileColors(gridX: number, gridZ: number) {
  const biome = getBiomeForRow(gridZ);
  const topIdx = (gridX * 3 + gridZ * 7) % biome.topPalette.length;
  const sideIdx = (gridX + gridZ * 4) % biome.sidePalette.length;
  return { top: biome.topPalette[topIdx], side: biome.sidePalette[sideIdx] };
}

/* Height variation per tile — some tiles slightly taller for depth */
function getTileHeight(gridX: number, gridZ: number): number {
  const v = Math.sin(gridX * 1.7 + gridZ * 2.3);
  return TILE_HEIGHT + v * 0.04; // ±0.04 variation
}

/* ─── Single Tile ─────────────────────────────────────────────────────────── */
function Tile({
  gridX,
  gridZ,
  onHover,
  isVanishing,
  isGone,
}: {
  gridX: number;
  gridZ: number;
  onHover: (pos: [number, number, number] | null) => void;
  isVanishing?: boolean;
  isGone?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const posX = gridX * TILE_SIZE;
  const posZ = gridZ * TILE_SIZE;
  const tiltH = getTileHeight(gridX, gridZ);
  const { top: topColor, side: sideColor } = useMemo(
    () => getTileColors(gridX, gridZ),
    [gridX, gridZ],
  );

  // Materials
  const topMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: topColor,
        roughness: 0.15,
        metalness: 0.1,
        clearcoat: 0.8,
        clearcoatRoughness: 0.2,
        emissive: topColor,
        emissiveIntensity: 0.12,
      }),
    [topColor],
  );
  const sideMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: sideColor,
        roughness: 0.6,
        metalness: 0.1,
      }),
    [sideColor],
  );

  // Animate: idle pulse + hover scale
  useFrame(({ clock }) => {
    if (!meshRef.current || !glowRef.current) return;
    const t = clock.getElapsedTime();

    // Vanishing tile fade
    const targetOpacity = isGone ? 0 : 1;
    const targetY = isGone ? -0.3 : 0;
    const group = meshRef.current.parent;
    if (group) {
      group.position.y = THREE.MathUtils.lerp(group.position.y, (tiltH / 2) + targetY, 0.1);
    }

    // Warn pulse for vanishing tiles about to disappear
    const vanishPulse = isVanishing && !isGone
      ? Math.sin(t * 8) * 0.3 + 0.5
      : 1;

    // Idle emissive pulse
    const offset = gridX * 0.3 + gridZ * 0.5;
    const pulse = Math.sin(t * 1.8 + offset) * 0.5 + 0.5;
    topMat.emissiveIntensity = hovered ? 0.55 : (0.06 + pulse * 0.1) * vanishPulse;
    topMat.opacity = THREE.MathUtils.lerp(topMat.opacity ?? 1, targetOpacity, 0.1);
    sideMat.opacity = THREE.MathUtils.lerp(sideMat.opacity ?? 1, targetOpacity, 0.1);

    // Hover scale bounce
    const targetScale = hovered ? 1.06 : 1.0;
    meshRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.15,
    );

    // Glow underlight pulse
    const glowMat = glowRef.current.material as THREE.MeshStandardMaterial;
    glowMat.opacity = (hovered ? 0.7 : 0.15 + pulse * 0.1) * (isGone ? 0 : 1);
  });

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      if (isGone) return; // block click on vanished
      const { player, startMove } = useGameStore.getState();
      if (player.isMoving) return;
      const path = findPath(
        { x: player.gridX, z: player.gridZ },
        { x: gridX, z: gridZ },
        MAP_LAYOUT,
      );
      if (path && path.length >= 1) startMove(path);
    },
    [gridX, gridZ, isGone],
  );

  const tileW = TILE_SIZE - TILE_GAP;

  return (
    <RigidBody type="fixed" colliders="cuboid">
      <group position={[posX, tiltH / 2, posZ]}>
        {/* Glow underplane */}
        <mesh ref={glowRef} position={[0, -tiltH / 2 + 0.01, 0]} renderOrder={-1}>
          <planeGeometry args={[tileW + 0.15, tileW + 0.15]} />
          <meshStandardMaterial
            color={topColor}
            emissive={topColor}
            emissiveIntensity={1}
            transparent
            opacity={0.15}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Main tile body — side walls */}
        <mesh
          receiveShadow
          castShadow
          onClick={handleClick}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            onHover([posX, tiltH + 0.05, posZ]);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            setHovered(false);
            onHover(null);
            document.body.style.cursor = "default";
          }}
        >
          <boxGeometry args={[tileW, tiltH, tileW]} />
          {/* Per-face: top bright, all sides/bottom dark */}
          <meshStandardMaterial attach="material-0" {...(sideMat as any)} />
          <meshStandardMaterial attach="material-1" {...(sideMat as any)} />
          <meshStandardMaterial attach="material-2" {...(topMat as any)} />
          <meshStandardMaterial attach="material-3" {...(sideMat as any)} />
          <meshStandardMaterial attach="material-4" {...(sideMat as any)} />
          <meshStandardMaterial attach="material-5" {...(sideMat as any)} />
        </mesh>

        {/* Beveled top cap — slightly wider, very thin, rounded look */}
        <mesh
          ref={meshRef}
          receiveShadow
          position={[0, tiltH / 2, 0]}
          onClick={handleClick}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            onHover([posX, tiltH + 0.05, posZ]);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            setHovered(false);
            onHover(null);
            document.body.style.cursor = "default";
          }}
        >
          <boxGeometry args={[tileW + 0.02, 0.035, tileW + 0.02]} />
          <meshPhysicalMaterial
            color={topColor}
            roughness={0.1}
            metalness={0.2}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
            emissive={topColor}
            emissiveIntensity={0.25}
          />
        </mesh>

        {/* Top edge rim highlight */}
        <mesh position={[0, tiltH / 2, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 4]}>
          <ringGeometry args={[tileW * 0.48, tileW * 0.52, 4]} />
          <meshStandardMaterial
            color={topColor}
            emissive={topColor}
            emissiveIntensity={0.8}
            transparent
            opacity={hovered ? 0.9 : 0.25}
            depthWrite={false}
          />
        </mesh>
      </group>
    </RigidBody>
  );
}

/* ─── Hover Destination Marker ────────────────────────────────────────────── */
function DestinationMarker({
  position,
}: {
  position: [number, number, number] | null;
}) {
  const ringRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ringRef.current || !outerRef.current) return;
    const t = clock.getElapsedTime();
    const visible = position !== null;
    ringRef.current.visible = visible;
    outerRef.current.visible = visible;
    if (!visible) return;

    ringRef.current.position.set(...position);
    outerRef.current.position.set(position[0], position[1] + 0.005, position[2]);

    // Spinning outer ring
    outerRef.current.rotation.z = t * 2.5;

    // Pulsing inner
    const s = 1 + Math.sin(t * 4) * 0.08;
    ringRef.current.scale.setScalar(s);
    (ringRef.current.material as THREE.MeshStandardMaterial).opacity =
      0.4 + Math.sin(t * 4) * 0.2;
  });

  return (
    <>
      {/* Inner pulsing disc */}
      <mesh ref={ringRef} visible={false} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.28, 32]} />
        <meshStandardMaterial
          color="#10b981"
          emissive="#34d399"
          emissiveIntensity={1.2}
          transparent
          opacity={0.5}
          depthWrite={false}
        />
      </mesh>
      {/* Outer spinning square ring */}
      <mesh ref={outerRef} visible={false} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.38, 4]} />
        <meshStandardMaterial
          color="#059669"
          emissive="#10b981"
          emissiveIntensity={1.5}
          transparent
          opacity={0.8}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

/* ─── Tile Grid ───────────────────────────────────────────────────────────── */
export function Tiles() {
  const [hoverPos, setHoverPos] = useState<[number, number, number] | null>(null);
  const [vanished, setVanished] = useState<Set<string>>(new Set());

  // Cycle vanishing tiles with staggered offsets
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const newVanished = new Set<string>();

      VANISHING_TILE_POSITIONS.forEach((pos, i) => {
        // Stagger each tile by index
        const offset = i * (VANISH_CYCLE_MS / VANISHING_TILE_POSITIONS.length);
        const phase = (now + offset) % VANISH_CYCLE_MS;
        // Gone for 40% of cycle
        if (phase > VANISH_CYCLE_MS * 0.6) {
          newVanished.add(`${pos.x},${pos.z}`);
        }
      });

      setVanished(newVanished);
    }, 200); // Check every 200ms

    return () => clearInterval(interval);
  }, []);

  const tiles = useMemo(() => {
    const result: { x: number; z: number }[] = [];
    MAP_LAYOUT.forEach((row, rz) => {
      row.forEach((val, rx) => {
        if (val === 1) result.push({ x: rx, z: rz });
      });
    });
    return result;
  }, []);

  // Pre-compute vanishing tile lookup
  const vanishingSet = useMemo(() => {
    const s = new Set<string>();
    VANISHING_TILE_POSITIONS.forEach((p) => s.add(`${p.x},${p.z}`));
    return s;
  }, []);

  return (
    <group>
      {tiles.map(({ x, z }) => {
        const key = `${x},${z}`;
        const isVanishingTile = vanishingSet.has(key);
        return (
          <Tile
            key={key}
            gridX={x}
            gridZ={z}
            onHover={setHoverPos}
            isVanishing={isVanishingTile}
            isGone={vanished.has(key)}
          />
        );
      })}
      <DestinationMarker position={hoverPos} />
    </group>
  );
}
