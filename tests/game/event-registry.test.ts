import { describe, it, expect } from 'vitest';
import { EVENT_REGISTRY, getRandomEvent } from '@/game/events/event-registry';
import { EventType } from '@/types/letter-crash';

const ALL_EVENT_TYPES: EventType[] = [
  'Explosion',
  'Portal',
  'Stars',
  'Animal',
  'Enemy',
  'Music',
];

describe('EVENT_REGISTRY', () => {
  it('has exactly 6 entries', () => {
    expect(EVENT_REGISTRY).toHaveLength(6);
  });

  it('has a total weight of 100', () => {
    const totalWeight = EVENT_REGISTRY.reduce((sum, e) => sum + e.weight, 0);
    expect(totalWeight).toBe(100);
  });

  it('contains all 6 event types', () => {
    const types = EVENT_REGISTRY.map((e) => e.type);
    for (const eventType of ALL_EVENT_TYPES) {
      expect(types).toContain(eventType);
    }
  });

  it('each entry has a positive weight', () => {
    for (const entry of EVENT_REGISTRY) {
      expect(entry.weight).toBeGreaterThan(0);
    }
  });

  it('each entry has a positive duration', () => {
    for (const entry of EVENT_REGISTRY) {
      expect(entry.duration).toBeGreaterThan(0);
    }
  });

  it('each entry has a non-empty sound string', () => {
    for (const entry of EVENT_REGISTRY) {
      expect(entry.sound.length).toBeGreaterThan(0);
    }
  });
});

describe('getRandomEvent', () => {
  it('returns a valid EventType', () => {
    const result = getRandomEvent();
    expect(ALL_EVENT_TYPES).toContain(result);
  });

  it('returns all 6 event types over 1000 runs', () => {
    const seen = new Set<EventType>();
    for (let i = 0; i < 1000; i++) {
      seen.add(getRandomEvent());
    }
    for (const eventType of ALL_EVENT_TYPES) {
      expect(seen.has(eventType)).toBe(true);
    }
  });

  it('produces approximately correct distribution over many runs', () => {
    const counts: Record<string, number> = {};
    for (const t of ALL_EVENT_TYPES) {
      counts[t] = 0;
    }

    const runs = 10000;
    for (let i = 0; i < runs; i++) {
      counts[getRandomEvent()]++;
    }

    // Expected weights: Explosion 30%, Animal 20%, Stars 15%, Enemy 15%, Portal 10%, Music 10%
    // Allow +/- 5% tolerance from expected proportion
    const tolerance = 0.05;
    const expectations: Record<string, number> = {
      Explosion: 0.3,
      Animal: 0.2,
      Stars: 0.15,
      Enemy: 0.15,
      Portal: 0.1,
      Music: 0.1,
    };

    for (const [type, expectedProportion] of Object.entries(expectations)) {
      const actualProportion = counts[type] / runs;
      expect(actualProportion).toBeGreaterThan(expectedProportion - tolerance);
      expect(actualProportion).toBeLessThan(expectedProportion + tolerance);
    }
  });
});
