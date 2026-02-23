/**
 * Module-level mutable ref for sharing the car's position and movement state
 * between Car.tsx (writer) and Particles.tsx (reader) without Zustand overhead.
 *
 * This avoids putting per-frame position data in a reactive store.
 */
export const carRef = {
  position: [0, 1, 0] as [number, number, number],
  isMoving: false,
  rotation: 0,
};
