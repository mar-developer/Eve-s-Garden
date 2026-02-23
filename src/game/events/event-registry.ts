import { EventType } from '../../types/letter-crash';

export interface EventConfig {
  type: EventType;
  weight: number;
  duration: number; // in milliseconds
  sound: string;
}

// Probability weights based on the blueprint Appendix B
export const EVENT_REGISTRY: EventConfig[] = [
  { type: 'Explosion', weight: 30, duration: 1500, sound: 'boom-cartoon' },
  { type: 'Animal', weight: 20, duration: 3000, sound: 'per-animal' },
  { type: 'Stars', weight: 15, duration: 2000, sound: 'chime-cascade' },
  { type: 'Enemy', weight: 15, duration: 3000, sound: 'boing-silly' },
  { type: 'Portal', weight: 10, duration: 2000, sound: 'whoosh-magic' },
  { type: 'Music', weight: 10, duration: 2500, sound: 'musical-note' },
];

export function getRandomEvent(): EventType {
  const totalWeight = EVENT_REGISTRY.reduce((sum, e) => sum + e.weight, 0);
  let random = Math.random() * totalWeight;

  for (const event of EVENT_REGISTRY) {
    if (random < event.weight) {
      return event.type;
    }
    random -= event.weight;
  }
  
  return 'Explosion'; // Fallback
}
