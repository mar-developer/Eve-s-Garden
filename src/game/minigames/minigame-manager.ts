import { MiniGameType, MiniGameState, MiniGameTarget } from '../../types/letter-crash';

/**
 * Mini-game configuration per type.
 * Defines time limits, target counts, and reward amounts.
 */

interface MiniGameConfig {
  type: MiniGameType;
  timeLimit: number; // ms
  targetCount: number;
  ordered: boolean; // Whether targets must be hit in order
  rewardStars: number;
  rewardGems: number;
}

export const MINIGAME_CONFIGS: Record<MiniGameType, MiniGameConfig> = {
  TargetPractice: {
    type: 'TargetPractice',
    timeLimit: 20000,
    targetCount: 5,
    ordered: false,
    rewardStars: 10,
    rewardGems: 0,
  },
  SpeedRings: {
    type: 'SpeedRings',
    timeLimit: 15000,
    targetCount: 8,
    ordered: true,
    rewardStars: 8,
    rewardGems: 2,
  },
  ColorMatch: {
    type: 'ColorMatch',
    timeLimit: 25000,
    targetCount: 4,
    ordered: true,
    rewardStars: 6,
    rewardGems: 3,
  },
  MusicMaker: {
    type: 'MusicMaker',
    timeLimit: 30000,
    targetCount: 7,
    ordered: false, // Freestyle allowed
    rewardStars: 5,
    rewardGems: 2,
  },
  QuickBuild: {
    type: 'QuickBuild',
    timeLimit: 25000,
    targetCount: 3,
    ordered: true,
    rewardStars: 8,
    rewardGems: 5,
  },
};

const ALL_MINIGAMES: MiniGameType[] = [
  'TargetPractice', 'SpeedRings', 'ColorMatch', 'MusicMaker', 'QuickBuild',
];

const MINIGAME_COLORS = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#A06CD5', '#FF8BD0', '#6BCB77', '#45B7D1', '#FF9F1C'];

/** Pick a random mini-game type */
export function pickRandomMiniGame(): MiniGameType {
  return ALL_MINIGAMES[Math.floor(Math.random() * ALL_MINIGAMES.length)];
}

/** Create initial mini-game state */
export function createMiniGameState(type: MiniGameType): MiniGameState {
  const config = MINIGAME_CONFIGS[type];
  return {
    type,
    phase: 'starting',
    startedAt: Date.now(),
    score: 0,
    timeLimit: config.timeLimit,
  };
}

/** Generate targets for a mini-game, scattered around the car position */
export function generateTargets(
  type: MiniGameType,
  carPosition: [number, number, number],
): MiniGameTarget[] {
  const config = MINIGAME_CONFIGS[type];
  const targets: MiniGameTarget[] = [];

  for (let i = 0; i < config.targetCount; i++) {
    const angle = (i / config.targetCount) * Math.PI * 2;
    const radius = 8 + Math.random() * 15;
    const height = type === 'TargetPractice' ? 2 + Math.random() * 4 : 0.5;

    targets.push({
      id: `minigame-${type}-${i}`,
      position: [
        carPosition[0] + Math.cos(angle) * radius,
        height,
        carPosition[2] + Math.sin(angle) * radius,
      ],
      collected: false,
      color: MINIGAME_COLORS[i % MINIGAME_COLORS.length],
      order: config.ordered ? i : undefined,
    });
  }

  return targets;
}

/** Check if a mini-game has timed out */
export function isMiniGameExpired(state: MiniGameState): boolean {
  return Date.now() - state.startedAt > state.timeLimit;
}

/** Get remaining time as a fraction 0-1 */
export function getMiniGameTimeRemaining(state: MiniGameState): number {
  const elapsed = Date.now() - state.startedAt;
  return Math.max(0, 1 - elapsed / state.timeLimit);
}

/** Check if all targets are collected */
export function allTargetsCollected(targets: MiniGameTarget[]): boolean {
  return targets.every((t) => t.collected);
}

/** Get the next expected target (for ordered mini-games) */
export function getNextExpectedOrder(targets: MiniGameTarget[]): number {
  const uncollected = targets.filter((t) => !t.collected && t.order !== undefined);
  if (uncollected.length === 0) return -1;
  return Math.min(...uncollected.map((t) => t.order!));
}
