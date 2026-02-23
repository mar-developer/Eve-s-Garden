import { describe, it, expect } from 'vitest';
import { DIMENSIONS } from '@/game/dimensions/themes';
import { Dimension, DimensionConfig } from '@/types/letter-crash';

const ALL_DIMENSIONS: Dimension[] = ['Home', 'Candy', 'Space', 'Ocean', 'Volcano', 'Cloud'];
const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

const REQUIRED_FIELDS: (keyof DimensionConfig)[] = [
  'id',
  'skyColor',
  'groundColor',
  'fogColor',
  'fogDensity',
  'ambientIntensity',
  'particleColor',
];

describe('DIMENSIONS', () => {
  it('defines all 6 dimensions', () => {
    for (const dim of ALL_DIMENSIONS) {
      expect(DIMENSIONS[dim]).toBeDefined();
    }
  });

  it('has exactly 6 dimensions', () => {
    expect(Object.keys(DIMENSIONS)).toHaveLength(6);
  });

  describe.each(ALL_DIMENSIONS)('dimension "%s"', (dimensionName) => {
    const config = DIMENSIONS[dimensionName];

    it('has all required fields', () => {
      for (const field of REQUIRED_FIELDS) {
        expect(config).toHaveProperty(field);
      }
    });

    it('has id matching the key', () => {
      expect(config.id).toBe(dimensionName);
    });

    it('has a valid hex skyColor', () => {
      expect(config.skyColor).toMatch(HEX_COLOR_REGEX);
    });

    it('has a valid hex groundColor', () => {
      expect(config.groundColor).toMatch(HEX_COLOR_REGEX);
    });

    it('has a valid hex fogColor', () => {
      expect(config.fogColor).toMatch(HEX_COLOR_REGEX);
    });

    it('has a valid hex particleColor', () => {
      expect(config.particleColor).toMatch(HEX_COLOR_REGEX);
    });

    it('has fogDensity > 0', () => {
      expect(config.fogDensity).toBeGreaterThan(0);
    });

    it('has ambientIntensity between 0 and 1 (inclusive)', () => {
      expect(config.ambientIntensity).toBeGreaterThanOrEqual(0);
      expect(config.ambientIntensity).toBeLessThanOrEqual(1);
    });
  });
});
