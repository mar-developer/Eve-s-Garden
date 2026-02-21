import { create } from "zustand";
import type { GamePhase, GridPosition, PlayerState } from "@/types";
import {
  COLLECTIBLE_META,
  COLLECTIBLE_POSITIONS,
  PLAYER_START,
} from "@/game/constants";

const COMBO_STEPS = [1, 2, 3, 5];
const COMBO_WINDOW = 2000; // ms

interface GameState {
  // Score
  score: number;
  collected: Set<number>;

  // Combo
  combo: number;
  comboIndex: number;
  lastCollectTime: number;

  // Collection popup events
  popups: { id: number; x: number; z: number; points: number; combo: number; color: string }[];
  nextPopupId: number;

  // Player
  player: PlayerState;

  // Phase
  phase: GamePhase;
  hint: string;
  isDay: boolean;
  cameraAngle: number;

  // Actions
  startMove: (path: GridPosition[]) => void;
  advanceStep: () => void;
  collectItem: (index: number) => void;
  resetGame: () => void;
  toggleDayNight: () => void;
  rotateCamera: (dir: 1 | -1) => void;
  spendPoints: (amount: number) => void;
  removePopup: (id: number) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  score: 0,
  collected: new Set(),
  phase: "playing",
  hint: "Click a tile to move",
  isDay: false,
  cameraAngle: 0,

  // Combo
  combo: 1,
  comboIndex: 0,
  lastCollectTime: 0,

  // Popups
  popups: [],
  nextPopupId: 0,

  player: {
    gridX: PLAYER_START.x,
    gridZ: PLAYER_START.z,
    isMoving: false,
    movePath: [],
  },

  startMove: (path) => {
    set({
      player: {
        ...get().player,
        isMoving: true,
        movePath: path,
      },
      hint: "",
    });
  },

  advanceStep: () => {
    const { player, collected } = get();
    const [nextStep, ...remaining] = player.movePath;

    if (!nextStep) return;

    const newPlayer: PlayerState = {
      gridX: nextStep.x,
      gridZ: nextStep.z,
      isMoving: remaining.length > 0,
      movePath: remaining,
    };

    set({ player: newPlayer });

    // Check collectible at new position
    COLLECTIBLE_POSITIONS.forEach((cp, idx) => {
      if (collected.has(idx)) return;
      if (cp.x === nextStep.x && cp.z === nextStep.z) {
        get().collectItem(idx);
      }
    });
  },

  collectItem: (index) => {
    const { score, collected, lastCollectTime, comboIndex, nextPopupId } = get();
    const spawn = COLLECTIBLE_POSITIONS[index];
    const meta = COLLECTIBLE_META[spawn.type];

    const newCollected = new Set(collected);
    newCollected.add(index);

    // Combo logic
    const now = Date.now();
    const timeSinceLast = now - lastCollectTime;
    let newComboIndex = 0;
    if (timeSinceLast < COMBO_WINDOW && lastCollectTime > 0) {
      newComboIndex = Math.min(comboIndex + 1, COMBO_STEPS.length - 1);
    }
    const newCombo = COMBO_STEPS[newComboIndex];
    const earnedPoints = meta.points * newCombo;
    const newScore = score + earnedPoints;
    const won = newCollected.size === COLLECTIBLE_POSITIONS.length;

    // Create popup
    const popup = {
      id: nextPopupId,
      x: spawn.x,
      z: spawn.z,
      points: earnedPoints,
      combo: newCombo,
      color: meta.color,
    };

    set({
      score: newScore,
      collected: newCollected,
      phase: won ? "won" : "playing",
      combo: newCombo,
      comboIndex: newComboIndex,
      lastCollectTime: now,
      popups: [...get().popups, popup],
      nextPopupId: nextPopupId + 1,
    });
  },

  removePopup: (id) => {
    set({ popups: get().popups.filter((p) => p.id !== id) });
  },

  resetGame: () => {
    set({
      score: 0,
      collected: new Set(),
      phase: "playing",
      hint: "Click a tile to move",
      combo: 1,
      comboIndex: 0,
      lastCollectTime: 0,
      popups: [],
      player: {
        gridX: PLAYER_START.x,
        gridZ: PLAYER_START.z,
        isMoving: false,
        movePath: [],
      },
    });
  },

  toggleDayNight: () => set((state) => ({ isDay: !state.isDay })),

  rotateCamera: (dir) =>
    set((state) => ({ cameraAngle: state.cameraAngle + dir * 90 })),

  spendPoints: (amount) =>
    set((state) => ({ score: Math.max(0, state.score - amount) })),
}));
