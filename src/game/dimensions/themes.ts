import { DimensionConfig, Dimension } from '../../types/letter-crash';

export const DIMENSIONS: Record<Dimension, DimensionConfig> = {
  Home: {
    id: 'Home',
    skyColor: '#FFF4E6', // Warm Off-white
    groundColor: '#2F2A38', // Dark Charcoal
    fogColor: '#FF6B6B', // Coral
    fogDensity: 0.015,
    ambientIntensity: 0.9,
    particleColor: '#D4FF00' // Acid Green
  },
  Candy: {
    id: 'Candy',
    skyColor: '#FEE440', // Bright Yellow
    groundColor: '#1A1A1A', // Void Black
    fogColor: '#F15BB5', // Neon Pink
    fogDensity: 0.015,
    ambientIntensity: 0.8,
    particleColor: '#00F5D4' // Neon Turquoise
  },
  Space: {
    id: 'Space',
    skyColor: '#F2F9F1', // Stark White
    groundColor: '#101010', // Vantablack
    fogColor: '#000000', // Black
    fogDensity: 0.02,
    ambientIntensity: 0.4,
    particleColor: '#FF0054' // Neon Red
  },
  Ocean: {
    id: 'Ocean',
    skyColor: '#D4FF00', // Acid Green Sky
    groundColor: '#0A2239', // Deep Sea
    fogColor: '#1D8A99', // Teal
    fogDensity: 0.02,
    ambientIntensity: 0.6,
    particleColor: '#FF3366' // Hot Coral
  },
  Volcano: {
    id: 'Volcano',
    skyColor: '#FF3366', // Neon Crimson
    groundColor: '#111111', // Charcoal
    fogColor: '#FF9F1C', // Molten Orange
    fogDensity: 0.025,
    ambientIntensity: 0.7,
    particleColor: '#FFBF00' // Amber
  },
  Cloud: {
    id: 'Cloud',
    skyColor: '#111111', // Pitch Black
    groundColor: '#E8ECEF', // Sharp Gray
    fogColor: '#FFFFFF', // White
    fogDensity: 0.01,
    ambientIntensity: 0.9,
    particleColor: '#D4FF00' // Acid Green
  }
};
