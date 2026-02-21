import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AccessoryType, CharacterConfig } from "@/types";
import { DEFAULT_CHARACTER } from "@/game/constants";
import { useGameStore } from "./game-store";

interface CharacterState {
  config: CharacterConfig;
  panelOpen: boolean;
  unlockedItems: string[];

  // Actions
  updateConfig: <K extends keyof CharacterConfig>(
    key: K,
    value: CharacterConfig[K],
  ) => void;
  setPanelOpen: (open: boolean) => void;
  togglePanel: () => void;
  resetCharacter: () => void;
  unlockItem: (id: string, cost: number) => void;
}

export const useCharacterStore = create<CharacterState>()(
  persist(
    (set, get) => ({
      config: { ...DEFAULT_CHARACTER },
      panelOpen: true,
      unlockedItems: [],

      updateConfig: (key, value) => {
        set({
          config: { ...get().config, [key]: value },
        });
      },

      setPanelOpen: (open) => set({ panelOpen: open }),
      togglePanel: () => set({ panelOpen: !get().panelOpen }),

      resetCharacter: () => set({ config: { ...DEFAULT_CHARACTER } }),

      unlockItem: (id, cost) => {
        useGameStore.getState().spendPoints(cost);
        set({
          unlockedItems: [...get().unlockedItems, id],
        });
      },
    }),
    {
      name: "eves-garden-character-storage",
      partialize: (state) => ({
        config: state.config,
        unlockedItems: state.unlockedItems,
      }), // Only persist config and unlocked items
    },
  )
);
