"use client";
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../game/stores/letter-crash-store';
import { getDecorationById } from '../../game/decorations/decoration-registry';

// ─── Shared sub-components ─────────────────────────────────────────────────

const TRUNK_COLOR = '#8D6E63';

function Trunk({ height = 0.5, radius = 0.08, rotationZ = 0 }: { height?: number; radius?: number; rotationZ?: number }) {
  return (
    <mesh position={[0, height / 2, 0]} rotation={[0, 0, rotationZ]} castShadow>
      <cylinderGeometry args={[radius, radius, height, 8]} />
      <meshStandardMaterial color={TRUNK_COLOR} />
    </mesh>
  );
}

// ─── Tree meshes ───────────────────────────────────────────────────────────

function TreeRound({ color }: { color: string }) {
  return (
    <group>
      <Trunk height={0.5} radius={0.08} />
      <mesh position={[0, 0.7, 0]} castShadow>
        <sphereGeometry args={[0.35, 10, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

function TreePalm({ color }: { color: string }) {
  return (
    <group>
      <Trunk height={0.7} radius={0.06} rotationZ={0.15} />
      <mesh position={[0.05, 0.85, 0]} castShadow>
        <coneGeometry args={[0.3, 0.5, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

function TreeCone({ color }: { color: string }) {
  return (
    <group>
      <Trunk height={0.4} radius={0.07} />
      <mesh position={[0, 0.7, 0]} castShadow>
        <coneGeometry args={[0.3, 0.7, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

function TreeCactus({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.7, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.15, 0.35, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.25, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-0.12, 0.45, 0]} rotation={[0, 0, -Math.PI / 4]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.2, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

// ─── Flower ────────────────────────────────────────────────────────────────

function Flower({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.4, 6]} />
        <meshStandardMaterial color="#4CAF50" />
      </mesh>
      <mesh position={[0, 0.45, 0]} castShadow>
        <sphereGeometry args={[0.1, 8, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

// ─── Building meshes ───────────────────────────────────────────────────────

function BuildingHouse({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.6, 0]} castShadow>
        <coneGeometry args={[0.4, 0.3, 4]} />
        <meshStandardMaterial color="#D32F2F" />
      </mesh>
    </group>
  );
}

function BuildingTower({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.15, 1, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 1.1, 0]} castShadow>
        <coneGeometry args={[0.18, 0.25, 8]} />
        <meshStandardMaterial color="#D32F2F" />
      </mesh>
    </group>
  );
}

function BuildingCastle({ color }: { color: string }) {
  const turretOffset = 0.3;
  return (
    <group>
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[0.7, 0.5, 0.7]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([dx, dz], i) => (
        <mesh key={i} position={[dx * turretOffset, 0.6, dz * turretOffset]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.3, 6]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Pet ───────────────────────────────────────────────────────────────────

function PetRound({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0.2, 0]} castShadow>
        <sphereGeometry args={[0.2, 10, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.07, 0.28, 0.16]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[0.07, 0.28, 0.16]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      {/* Ears */}
      <mesh position={[-0.14, 0.38, 0]}>
        <sphereGeometry args={[0.06, 6, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.14, 0.38, 0]}>
        <sphereGeometry args={[0.06, 6, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

// ─── Fun meshes ────────────────────────────────────────────────────────────

function FunDisc({ color }: { color: string }) {
  return (
    <mesh position={[0, 0.05, 0]} castShadow>
      <cylinderGeometry args={[0.4, 0.4, 0.08, 12]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function FunRamp({ color }: { color: string }) {
  return (
    <mesh position={[0, 0.2, 0]} rotation={[0, 0, -Math.PI / 6]} castShadow>
      <boxGeometry args={[0.8, 0.08, 0.4]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function FunArch({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[-0.25, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.6, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.25, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.6, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.6, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.5, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

function FunFountain({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0.08, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.4, 0.15, 10]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.25, 0.2, 10]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 0.2, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

// ─── Vehicle meshes ────────────────────────────────────────────────────────

function VehicleBoat({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0.1, 0]} castShadow>
        <boxGeometry args={[0.7, 0.15, 0.3]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.1, 0.25, 0]} castShadow>
        <boxGeometry args={[0.2, 0.15, 0.2]} />
        <meshStandardMaterial color="#ECEFF1" />
      </mesh>
    </group>
  );
}

function VehicleHeli({ color }: { color: string }) {
  const rotorRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (rotorRef.current) {
      rotorRef.current.rotation.y += delta * 12;
    }
  });

  return (
    <group>
      <mesh position={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[0.4, 0.2, 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh ref={rotorRef} position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.02, 4]} />
        <meshStandardMaterial color="#90A4AE" />
      </mesh>
    </group>
  );
}

function VehicleTrain({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0.18, 0]} castShadow>
        <boxGeometry args={[0.8, 0.2, 0.25]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {[-0.25, 0.25].map((x, i) => (
        <mesh key={i} position={[x, 0.04, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.02, 8]} />
          <meshStandardMaterial color="#424242" />
        </mesh>
      ))}
      {[-0.25, 0.25].map((x, i) => (
        <mesh key={`b${i}`} position={[x, 0.04, -0.15]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.02, 8]} />
          <meshStandardMaterial color="#424242" />
        </mesh>
      ))}
    </group>
  );
}

// ─── Magic meshes (animated) ───────────────────────────────────────────────

function MagicArch() {
  return (
    <mesh position={[0, 0.4, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
      <torusGeometry args={[0.4, 0.06, 8, 16, Math.PI]} />
      <meshStandardMaterial color="#FF6B6B" emissive="#FF6B6B" emissiveIntensity={0.3} />
    </mesh>
  );
}

function MagicStar({ color }: { color: string }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y = 0.4 + Math.sin(clock.getElapsedTime() * 2) * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh castShadow>
        <octahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}

function MagicSparkle({ color }: { color: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const orbs = useRef<(THREE.Mesh | null)[]>([null, null, null]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    for (let i = 0; i < 3; i++) {
      const mesh = orbs.current[i];
      if (!mesh) continue;
      const angle = t * 2 + (i * Math.PI * 2) / 3;
      mesh.position.x = Math.cos(angle) * 0.25;
      mesh.position.z = Math.sin(angle) * 0.25;
      mesh.position.y = 0.3 + Math.sin(t * 3 + i) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} ref={(el) => { orbs.current[i] = el; }}>
          <sphereGeometry args={[0.06, 8, 6]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Mesh type switch ──────────────────────────────────────────────────────

function DecorationMesh({ meshType, color }: { meshType: string; color: string }) {
  switch (meshType) {
    case 'tree-round':      return <TreeRound color={color} />;
    case 'tree-palm':       return <TreePalm color={color} />;
    case 'tree-cone':       return <TreeCone color={color} />;
    case 'tree-cactus':     return <TreeCactus color={color} />;
    case 'flower':          return <Flower color={color} />;
    case 'building-house':  return <BuildingHouse color={color} />;
    case 'building-tower':  return <BuildingTower color={color} />;
    case 'building-castle': return <BuildingCastle color={color} />;
    case 'pet-round':       return <PetRound color={color} />;
    case 'fun-disc':        return <FunDisc color={color} />;
    case 'fun-ramp':        return <FunRamp color={color} />;
    case 'fun-arch':        return <FunArch color={color} />;
    case 'fun-fountain':    return <FunFountain color={color} />;
    case 'vehicle-boat':    return <VehicleBoat color={color} />;
    case 'vehicle-heli':    return <VehicleHeli color={color} />;
    case 'vehicle-train':   return <VehicleTrain color={color} />;
    case 'magic-arch':      return <MagicArch />;
    case 'magic-star':      return <MagicStar color={color} />;
    case 'magic-sparkle':   return <MagicSparkle color={color} />;
    default:                return null;
  }
}

// ─── Main component ────────────────────────────────────────────────────────

export const PlacedDecorations = () => {
  const placedDecorations = useGameStore((s) => s.placedDecorations);
  const currentIslandId = useGameStore((s) => s.currentIslandId);

  if (currentIslandId !== 'home') return null;

  return (
    <group>
      {placedDecorations.map((placed) => {
        const item = getDecorationById(placed.itemId);
        if (!item) return null;
        return (
          <group
            key={placed.instanceId}
            position={placed.position}
            rotation={[0, placed.rotationY, 0]}
            scale={item.scale}
          >
            <DecorationMesh meshType={item.meshType} color={item.color} />
          </group>
        );
      })}
    </group>
  );
};
