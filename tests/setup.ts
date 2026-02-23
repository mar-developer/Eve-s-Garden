import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock Three.js and R3F (they need WebGL which jsdom doesn't have)
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: any) => children,
  useFrame: vi.fn(),
  useThree: vi.fn(() => ({ camera: {}, scene: {}, gl: {} })),
}));

vi.mock('@react-three/drei', () => ({
  Text: ({ children }: any) => children,
  Sparkles: () => null,
  KeyboardControls: ({ children }: any) => children,
  useKeyboardControls: vi.fn(() => [vi.fn(), vi.fn()]),
  SoftShadows: () => null,
}));

vi.mock('@react-three/rapier', () => ({
  Physics: ({ children }: any) => children,
  RigidBody: ({ children }: any) => children,
}));

vi.mock('@react-three/postprocessing', () => ({
  EffectComposer: ({ children }: any) => children,
  Bloom: () => null,
  Vignette: () => null,
}));
