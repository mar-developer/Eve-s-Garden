import type {
  AccessoryMeta,
  AccessoryType,
  CharacterConfig,
  CollectibleMeta,
  CollectibleSpawn,
  CollectibleType,
  GridPosition,
  TileGrid,
} from "@/types";

/* ── Tile Grid ── */
export const TILE_SIZE = 1.1;
export const TILE_GAP = 0.08;
export const TILE_HEIGHT = 0.18;
export const MOVE_SPEED = 3.5;
export const HOP_HEIGHT = 0.2;

/* ── Colors ── */
export const COLORS = {
  bg: "#040a0c",
} as const;

/* ── Map Layout (1 = tile, 0 = empty) ── */
export const MAP_LAYOUT: TileGrid = [
  [0, 0, 1, 1, 1, 1, 1, 0, 0], // row 0 — top terrace
  [0, 1, 1, 0, 1, 0, 1, 1, 0], // row 1
  [1, 1, 0, 0, 1, 0, 0, 1, 1], // row 2
  [1, 0, 0, 1, 1, 1, 0, 0, 1], // row 3
  [1, 1, 1, 1, 1, 1, 1, 1, 1], // row 4 — central boulevard
  [1, 0, 0, 1, 1, 1, 0, 0, 1], // row 5
  [1, 1, 0, 0, 1, 0, 0, 1, 1], // row 6
  [0, 1, 1, 0, 1, 0, 1, 1, 0], // row 7
  [0, 0, 1, 1, 1, 1, 1, 0, 0], // row 8 — bottom terrace
];

export const PLAYER_START = { x: 4, z: 4 } as const;

/* ── Collectibles ── */
export const COLLECTIBLE_POSITIONS: CollectibleSpawn[] = [
  { x: 4, z: 0, type: "gem" },
  { x: 1, z: 1, type: "orb" },
  { x: 7, z: 1, type: "crystal" },
  { x: 0, z: 2, type: "tree" },
  { x: 8, z: 2, type: "gem" },
  { x: 3, z: 3, type: "crystal" },
  { x: 5, z: 3, type: "orb" },
  { x: 0, z: 4, type: "tree" },
  { x: 8, z: 4, type: "gem" },
  { x: 3, z: 5, type: "orb" },
  { x: 5, z: 5, type: "crystal" },
  { x: 1, z: 7, type: "tree" },
  { x: 4, z: 8, type: "gem" },
];

export const COLLECTIBLE_META: Record<CollectibleType, CollectibleMeta> = {
  tree: { icon: "🌲", label: "Tree", points: 10, color: "#2ecc71" },
  orb: { icon: "🔷", label: "Orb", points: 15, color: "#0984e3" },
  gem: { icon: "💎", label: "Gem", points: 25, color: "#f1c40f" },
  crystal: { icon: "🔮", label: "Crystal", points: 50, color: "#e84393" },
};

/* ── Character Customization Options ── */
export const SKIN_TONES = [
  "#ffdbac",
  "#f1c27d",
  "#e0a370",
  "#c68642",
  "#8d5524",
  "#614335",
] as const;

export const HAIR_COLORS = [
  "#6d4c2a",
  "#2d1b0e",
  "#d4a46a",
  "#c0392b",
  "#1a1a2e",
  "#f39c12",
] as const;

export const BODY_COLORS = [
  "#5b7db1",
  "#e17055",
  "#00b894",
  "#fdcb6e",
  "#a29bfe",
  "#fd79a8",
  "#2d3436",
  "#dfe6e9",
] as const;

export const PANTS_COLORS = [
  "#7f8c8d",
  "#6d4c2a",
  "#2d3436",
  "#0984e3",
  "#b2bec3",
  "#636e72",
] as const;

export const SHOE_COLORS = [
  "#ffeaa7",
  "#dfe6e9",
  "#e17055",
  "#2d3436",
  "#a29bfe",
  "#00b894",
] as const;

export const ACCESSORIES: Record<AccessoryType, AccessoryMeta> = {
  glasses: { label: "Glasses", icon: "👓" },
  backpack: { label: "Backpack", icon: "🎒" },
  hat: { label: "Hat", icon: "🧢" },
  none: { label: "None", icon: "✕" },
};

/* ── Premium Items (Costs) ── */
export const PREMIUM_ITEMS: Record<string, number> = {
  // Rare colors
  "#614335": 50, // Darkest skin tone
  "#1a1a2e": 50, // Dark blue hair
  "#fdcb6e": 50, // Yellow outfit
  "#fd79a8": 50, // Pink outfit
  "#00b894": 50, // Green pants
  "#a29bfe": 50, // Purple shoes
  
  // Accessories
  "hat": 100,
  "backpack": 100,
};

/* ── Default Character ── */
export const DEFAULT_CHARACTER: CharacterConfig = {
  skinTone: SKIN_TONES[0],
  bodyColor: BODY_COLORS[0],
  shoeColor: SHOE_COLORS[0],
  hairColor: HAIR_COLORS[0],
  pantsColor: PANTS_COLORS[0],
  accessory: "none",
};

/* ── Biome Zones ── */
export interface BiomeZone {
  rows: number[];
  topPalette: string[];
  sidePalette: string[];
  accentColor: string;
}

export const BIOMES: Record<string, BiomeZone> = {
  meadow: {
    rows: [0, 1, 7, 8],
    topPalette: ["#78b060", "#6ca858", "#8cc070", "#a0d088"],
    sidePalette: ["#3a5e30", "#2e4a28", "#446838"],
    accentColor: "#c5e8a0",
  },
  moss: {
    rows: [2, 3, 5, 6],
    topPalette: ["#4ca89a", "#3e9a8c", "#5ab8aa", "#68c4b8"],
    sidePalette: ["#1c5248", "#1a4a42", "#245e54"],
    accentColor: "#7ed4c0",
  },
  enchanted: {
    rows: [4],
    topPalette: ["#fbbf24", "#fcd34d", "#fde68a", "#fbbf24"],
    sidePalette: ["#b45309", "#d97706", "#92400e"],
    accentColor: "#fef3c7",
  },
};

export function getBiomeForRow(gridZ: number): BiomeZone {
  for (const biome of Object.values(BIOMES)) {
    if (biome.rows.includes(gridZ)) return biome;
  }
  return BIOMES.meadow; // fallback
}

/* ── Decoration Spawns ── */
export type DecorationType = "mushroom" | "flower" | "rock" | "lantern";

export interface DecorationSpawn {
  x: number;
  z: number;
  type: DecorationType;
  scale?: number;
  rotY?: number;
}

export const DECORATION_POSITIONS: DecorationSpawn[] = [
  // Meadow edges
  { x: 3.5, z: -0.3, type: "flower" },
  { x: 5.5, z: -0.3, type: "flower" },
  { x: -0.3, z: 1.5, type: "lantern" },
  { x: 8.7, z: 1.5, type: "lantern" },
  // Moss zone
  { x: 2.5, z: 2.5, type: "mushroom" },
  { x: 6.5, z: 2.5, type: "rock", scale: 0.6 },
  { x: 1.5, z: 4.5, type: "flower" },
  { x: 7.5, z: 4.5, type: "flower" },
  // Lower moss
  { x: 2.5, z: 5.5, type: "rock", scale: 0.7 },
  { x: 6.5, z: 5.5, type: "mushroom" },
  // Bottom meadow
  { x: -0.3, z: 6.5, type: "lantern" },
  { x: 8.7, z: 6.5, type: "lantern" },
  { x: 3.5, z: 8.3, type: "flower" },
  { x: 5.5, z: 8.3, type: "mushroom" },
];

/* ── Vanishing Tiles ── */
export const VANISHING_TILE_POSITIONS: GridPosition[] = [
  { x: 4, z: 1 },
  { x: 0, z: 3 },
  { x: 8, z: 3 },
  { x: 2, z: 4 },
  { x: 6, z: 4 },
  { x: 0, z: 5 },
  { x: 8, z: 5 },
];

export const VANISH_CYCLE_MS = 4000; // total cycle: visible → warn → gone → appear


