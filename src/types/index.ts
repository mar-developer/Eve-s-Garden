import type { Vector3Tuple } from "three";

/* ── Character ── */
export interface CharacterConfig {
  skinTone: string;
  bodyColor: string;
  shoeColor: string;
  hairColor: string;
  pantsColor: string;
  accessory: AccessoryType;
}

export type AccessoryType = "glasses" | "backpack" | "hat" | "none";

export interface AccessoryMeta {
  label: string;
  icon: string;
}

/* ── Map & Grid ── */
export type TileState = "solid" | "vanishing" | "gone" | "appearing";
export type TileGrid = number[][];

export interface GridPosition {
  x: number;
  z: number;
}

/* ── Collectibles ── */
export type CollectibleType = "tree" | "gem" | "crystal" | "orb";

export interface CollectibleSpawn {
  x: number;
  z: number;
  type: CollectibleType;
}

export interface CollectibleMeta {
  icon: string;
  label: string;
  points: number;
  color: string;
}

/* ── Game State ── */
export type GamePhase = "playing" | "won";

export interface PlayerState {
  gridX: number;
  gridZ: number;
  isMoving: boolean;
  movePath: GridPosition[];
}
