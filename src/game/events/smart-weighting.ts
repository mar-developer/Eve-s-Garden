import { EventType } from '../../types/letter-crash';
import { EVENT_REGISTRY } from './event-registry';

/**
 * Smart event weighting — reduces weight for recently seen events,
 * boosts unseen events, and respects learning mode.
 */

const HISTORY_SIZE = 20;
const DECAY_FACTOR = 0.5; // Recent events lose 50% weight
const UNSEEN_BOOST = 1.5; // Unseen events get 50% boost

/** Circular history of recent event types */
const recentEvents: EventType[] = [];

/** Record that an event was triggered */
export function recordEvent(type: EventType): void {
  recentEvents.push(type);
  if (recentEvents.length > HISTORY_SIZE) {
    recentEvents.shift();
  }
}

/** Count how many times an event type appears in recent history */
function countRecent(type: EventType): number {
  return recentEvents.filter((e) => e === type).length;
}

/**
 * Pick a weighted random event type using smart weighting.
 * @param learningMode If true, Animal events get 3x weight
 * @param reducedPortals If true, Portal events get 0.3x weight
 */
export function getSmartEvent(
  learningMode = false,
  reducedPortals = false,
): EventType {
  const weights: { type: EventType; weight: number }[] = EVENT_REGISTRY.map((config) => {
    let weight = config.weight;

    // Reduce weight for recently seen events
    const count = countRecent(config.type);
    if (count > 0) {
      weight *= Math.pow(DECAY_FACTOR, count);
    } else if (recentEvents.length > 5) {
      // Boost unseen events once there's enough history
      weight *= UNSEEN_BOOST;
    }

    // Learning mode: boost Animal events
    if (learningMode && config.type === 'Animal') {
      weight *= 3;
    }

    // Reduced portals (if kid seems disoriented)
    if (reducedPortals && config.type === 'Portal') {
      weight *= 0.3;
    }

    return { type: config.type, weight: Math.max(weight, 0.1) };
  });

  // Weighted random selection
  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
  let random = Math.random() * totalWeight;

  for (const entry of weights) {
    if (random < entry.weight) {
      return entry.type;
    }
    random -= entry.weight;
  }

  return 'Explosion';
}
