import { IslandNode, BridgeConfig } from '../../types/letter-crash';

/**
 * Island network layout:
 *
 *          [Cloud]
 *             |
 *  [Ocean] - [HOME] - [Candy]
 *             |
 *          [Volcano]
 *             |
 *          [Space]
 *
 * Home is always accessible. Others unlock by spelling a keyword.
 * Islands are spaced 130 units apart (radius 50 each + 30 gap).
 */

const SPACING = 130;

export const ISLAND_NODES: IslandNode[] = [
  {
    id: 'home',
    dimension: 'Home',
    position: [0, 0, 0],
    radius: 50,
    unlockWords: [], // Always unlocked
    label: 'Home Island',
  },
  {
    id: 'candy',
    dimension: 'Candy',
    position: [SPACING, 0, 0],
    radius: 50,
    unlockWords: ['CAKE', 'SWEET', 'CANDY'],
    label: 'Candy Island',
  },
  {
    id: 'ocean',
    dimension: 'Ocean',
    position: [-SPACING, 0, 0],
    radius: 50,
    unlockWords: ['FISH', 'WAVE', 'OCEAN'],
    label: 'Ocean Island',
  },
  {
    id: 'cloud',
    dimension: 'Cloud',
    position: [0, 0, -SPACING],
    radius: 50,
    unlockWords: ['SNOW', 'COLD', 'CLOUD'],
    label: 'Cloud Island',
  },
  {
    id: 'volcano',
    dimension: 'Volcano',
    position: [0, 0, SPACING],
    radius: 50,
    unlockWords: ['FIRE', 'HOT', 'LAVA'],
    label: 'Volcano Island',
  },
  {
    id: 'space',
    dimension: 'Space',
    position: [0, 0, SPACING * 2],
    radius: 50,
    unlockWords: ['STAR', 'MOON', 'SPACE'],
    label: 'Space Island',
  },
];

export const BRIDGE_CONFIGS: BridgeConfig[] = [
  { from: 'home', to: 'candy', unlocked: false },
  { from: 'home', to: 'ocean', unlocked: false },
  { from: 'home', to: 'cloud', unlocked: false },
  { from: 'home', to: 'volcano', unlocked: false },
  { from: 'volcano', to: 'space', unlocked: false },
];

/** Get island node by ID */
export function getIslandById(id: string): IslandNode | undefined {
  return ISLAND_NODES.find((n) => n.id === id);
}

/** Get all bridge configs connecting to/from an island */
export function getBridgesForIsland(islandId: string): BridgeConfig[] {
  return BRIDGE_CONFIGS.filter((b) => b.from === islandId || b.to === islandId);
}
