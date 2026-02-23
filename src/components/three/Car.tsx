import { forwardRef, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, CapsuleCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { useGameStore } from '../../game/stores/letter-crash-store';
import { carRef } from '../../game/stores/car-ref';
import { inputRef } from '../../game/stores/input-ref';
import { ISLAND_NODES } from '../../game/dimensions/island-network';

const SPEED = 10;
const BOOST_SPEED = 20;
const TURN_SPEED = 5;

// Sleek, organic hover-style car to contrast with the sharp island
const CarBody = () => (
  <group position={[0, 0.7, 0]}>
    {/* Main Pod Body - Smooth Capsule */}
    <mesh castShadow receiveShadow position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <capsuleGeometry args={[0.7, 1.2, 16, 32]} />
      <meshStandardMaterial color="#FF3366" roughness={0.2} metalness={0.5} /> {/* Sleek Neon Red */}
    </mesh>
    
    {/* Glass Cabin / Bubble Canopy */}
    <mesh castShadow position={[0, 0.4, -0.2]}>
      <sphereGeometry args={[0.6, 32, 32, 0, Math.PI * 2, 0, Math.PI / 1.5]} />
      <meshPhysicalMaterial 
        color="#1A1A1A" 
        transmission={0.9} 
        opacity={1} 
        metalness={0} 
        roughness={0}
        ior={1.5}
        thickness={0.5}
      />
    </mesh>

    {/* Hover/Magnetic Thrusters instead of traditional wheels */}
    <Wheel position={[-0.8, -0.4, 0.8]} />
    <Wheel position={[0.8, -0.4, 0.8]} />
    <Wheel position={[-0.8, -0.4, -0.8]} />
    <Wheel position={[0.8, -0.4, -0.8]} />

    {/* Futuristic Strip Headlight */}
    <mesh position={[0, 0.2, 1.25]} rotation={[0, 0, 0]}>
      <capsuleGeometry args={[0.08, 0.6, 8, 16]} />
      <meshStandardMaterial color="#00F5D4" emissive="#00F5D4" emissiveIntensity={3} />
    </mesh>
    
    {/* Tail lights */}
    <mesh position={[-0.4, 0.3, -1.2]}>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshStandardMaterial color="#FF0054" emissive="#FF0054" emissiveIntensity={2} />
    </mesh>
    <mesh position={[0.4, 0.3, -1.2]}>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshStandardMaterial color="#FF0054" emissive="#FF0054" emissiveIntensity={2} />
    </mesh>
  </group>
);

const Wheel = ({ position }: { position: [number, number, number] }) => (
  <mesh castShadow position={position}>
    <sphereGeometry args={[0.25, 32, 32]} />
    <meshStandardMaterial color="#111111" roughness={0.7} metalness={0.8} />
  </mesh>
);

export const Car = forwardRef<RapierRigidBody>((props, ref) => {
  const bodyRef = useRef<RapierRigidBody>(null);
  const meshRef = useRef<THREE.Group>(null);
  
  // Custom hook setup to sync ref
  useFrame(() => {
    if (typeof ref === 'function') {
      ref(bodyRef.current);
    } else if (ref) {
      ref.current = bodyRef.current;
    }
  });

  const isInputFocused = useGameStore((state) => state.isInputFocused);

  // Rotation state explicitly stored to handle turning manually for kinematic bodies
  const currentRotation = useRef(0);
  const smoothLookAt = useRef(new THREE.Vector3(0, 1, 0));

  useFrame((state, delta) => {
    if (!bodyRef.current || isInputFocused) return;

    // Read from shared input ref (written by KeyboardBridge or VirtualJoystick)
    const { forward, backward, left, right, boost } = inputRef;
    const isMoving = forward || backward;

    // Handle turning
    if (isMoving) {
      if (left) currentRotation.current += TURN_SPEED * delta;
      if (right) currentRotation.current -= TURN_SPEED * delta;
    }

    // Prepare quaternion from new rotation
    const quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), currentRotation.current);

    // Calculate movement direction relative to current rotation
    const moveZ = (forward ? 1 : 0) - (backward ? 1 : 0);
    const direction = new THREE.Vector3(0, 0, moveZ).applyQuaternion(quaternion);
    
    // Calculate final speed
    const currentSpeed = boost ? BOOST_SPEED : SPEED;
    
    // Apply movement internally to the current position
    const position = bodyRef.current.translation();
    
    const newPos = new THREE.Vector3(
      position.x + direction.x * currentSpeed * delta,
      position.y,
      position.z + direction.z * currentSpeed * delta
    );

    // Multi-island bounds: find nearest island, check if within any island or bridge area
    const onAnyIsland = ISLAND_NODES.some((node) => {
      const dx = newPos.x - node.position[0];
      const dz = newPos.z - node.position[2];
      return Math.sqrt(dx * dx + dz * dz) <= node.radius - 5;
    });

    if (!onAnyIsland) {
      // Find nearest island and clamp to its edge
      let nearestDist = Infinity;
      const nearestCenter = new THREE.Vector3(0, 0, 0);
      let nearestRadius = 45;
      for (const node of ISLAND_NODES) {
        const dx = newPos.x - node.position[0];
        const dz = newPos.z - node.position[2];
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestCenter.set(node.position[0], 0, node.position[2]);
          nearestRadius = node.radius - 5;
        }
      }

      // Only clamp if not on a bridge (y > 0 means on bridge arc)
      if (newPos.y <= 1.5) {
        const dx = newPos.x - nearestCenter.x;
        const dz = newPos.z - nearestCenter.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist > nearestRadius) {
          const falloff = nearestRadius / dist;
          newPos.x = nearestCenter.x + dx * falloff;
          newPos.z = nearestCenter.z + dz * falloff;
        }
      }
    }

    // Detect island transition: update current island when car enters a new one
    for (const node of ISLAND_NODES) {
      const dx = newPos.x - node.position[0];
      const dz = newPos.z - node.position[2];
      if (Math.sqrt(dx * dx + dz * dz) <= node.radius * 0.5) {
        const store = useGameStore.getState();
        if (store.currentIslandId !== node.id) {
          store.setCurrentIsland(node.id);
        }
        break;
      }
    }

    // Update Kinematic Body
    bodyRef.current.setNextKinematicTranslation(newPos);
    bodyRef.current.setNextKinematicRotation(quaternion);

    // Squash & stretch visuals based on speed and turning
    if (meshRef.current) {
        const targetScaleZ = isMoving ? (boost ? 1.15 : 1.05) : 1;
        const targetScaleY = isMoving ? (boost ? 0.9 : 0.95) : 1;
        
        meshRef.current.scale.z = THREE.MathUtils.lerp(meshRef.current.scale.z, targetScaleZ, 0.1);
        meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, targetScaleY, 0.1);
        
        // Tilt mesh slightly when turning
        const targetTilt = (left ? 0.1 : 0) - (right ? 0.1 : 0);
        meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, targetTilt, 0.1);
    }
    
    // Sync shared ref for particles (no store overhead)
    carRef.position = [newPos.x, newPos.y, newPos.z];
    carRef.isMoving = isMoving;
    carRef.rotation = currentRotation.current;

    // Camera follow mechanics
    const cameraOffset = new THREE.Vector3(0, 14, -20).applyQuaternion(quaternion);
    const targetCameraPos = new THREE.Vector3().copy(newPos).add(cameraOffset);

    state.camera.position.lerp(targetCameraPos, 0.1);
    const targetLookAt = new THREE.Vector3(newPos.x, newPos.y + 1, newPos.z);
    smoothLookAt.current.lerp(targetLookAt, 0.1);
    state.camera.lookAt(smoothLookAt.current);
  });

  return (
    <RigidBody
      ref={bodyRef}
      type="kinematicPosition"
      colliders={false}
      position={[0, 0.1, 0]}
    >
      <CapsuleCollider args={[0.5, 1]} position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]} />
      <group ref={meshRef}>
        <CarBody />
      </group>
    </RigidBody>
  );
});

Car.displayName = 'Car';
