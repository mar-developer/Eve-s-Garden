import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  Dimension,
  EventType,
  GamePhase,
  HitRecord,
  LetterBlock,
  LetterProgress,
  PlacedDecoration,
  SpeechBubbleData,
  MiniGameState,
  MiniGameTarget,
  MiniGameType,
  AccessibilitySettings,
  ParentSettings,
} from '../../types/letter-crash';
import { ISLAND_NODES, BRIDGE_CONFIGS } from '../dimensions/island-network';
import { getDecorationById } from '../decorations/decoration-registry';
import { createMiniGameState, generateTargets, MINIGAME_CONFIGS } from '../minigames/minigame-manager';

const ALL_DIMENSIONS: Dimension[] = ['Home', 'Candy', 'Space', 'Ocean', 'Volcano', 'Cloud'];
const LEARNED_THRESHOLD = 3;

interface GameState {
  word: string;
  dimension: Dimension;
  score: number;
  letterBlocks: LetterBlock[];
  hitLetters: HitRecord[];
  gamePhase: GamePhase;
  isInputFocused: boolean;

  // Learning mode (Phase 4)
  learningMode: boolean;
  letterProgress: Record<string, LetterProgress>;
  activeSpeechBubble: SpeechBubbleData | null;

  // Island network (Phase 5)
  currentIslandId: string;
  unlockedBridges: Set<string>; // Set of "from->to" keys

  setWord: (word: string) => void;
  setDimension: (dim: Dimension) => void;
  changeDimension: () => void;
  incrementScore: () => void;
  addLetterBlock: (block: LetterBlock) => void;
  removeLetterBlock: (id: string) => void;
  markLetterHit: (id: string, letter: string, eventType: EventType) => void;
  setGamePhase: (phase: GamePhase) => void;
  setIsInputFocused: (focused: boolean) => void;
  resetGame: () => void;
  resetWord: () => void;

  // Learning mode actions
  setLearningMode: (enabled: boolean) => void;
  recordAnimalHit: (letter: string) => void;
  showSpeechBubble: (data: SpeechBubbleData) => void;
  clearSpeechBubble: () => void;
  isLetterLearned: (letter: string) => boolean;

  // Island network actions
  setCurrentIsland: (islandId: string) => void;
  unlockBridge: (from: string, to: string) => void;
  isBridgeUnlocked: (from: string, to: string) => boolean;
  checkWordUnlock: (word: string) => void;

  // Home customization (Phase 6)
  stars: number;
  gems: number;
  buildMode: boolean;
  placedDecorations: PlacedDecoration[];
  ownedItems: string[]; // DecorationItem IDs

  addStars: (amount: number) => void;
  addGems: (amount: number) => void;
  setBuildMode: (enabled: boolean) => void;
  purchaseItem: (itemId: string) => boolean; // returns false if can't afford
  placeDecoration: (decoration: PlacedDecoration) => void;
  removeDecoration: (instanceId: string) => void;
  moveDecoration: (instanceId: string, position: [number, number, number], rotationY: number) => void;

  // Photo mode (Phase 8)
  photoMode: boolean;
  setPhotoMode: (enabled: boolean) => void;

  // Mini-games (Phase 9)
  activeMiniGame: MiniGameState | null;
  miniGameTargets: MiniGameTarget[];
  startMiniGame: (type: MiniGameType, carPosition: [number, number, number]) => void;
  collectMiniGameTarget: (targetId: string) => void;
  endMiniGame: (completed: boolean) => void;

  // Accessibility (Phase 10)
  accessibility: AccessibilitySettings;
  setAccessibility: (settings: Partial<AccessibilitySettings>) => void;

  // Parent settings (Phase 10)
  parentSettings: ParentSettings;
  setParentSettings: (settings: Partial<ParentSettings>) => void;
  parentDashboardOpen: boolean;
  setParentDashboardOpen: (open: boolean) => void;
}

const DEFAULT_ACCESSIBILITY: AccessibilitySettings = {
  colorBlindMode: 'none',
  highContrast: false,
  autoDrive: false,
  textScale: 1,
};

const DEFAULT_PARENT_SETTINGS: ParentSettings = {
  pin: '0000',
  timeLimitMinutes: 0,
  difficulty: 'normal',
  learningMode: false,
  enabledDimensions: ALL_DIMENSIONS,
  volumeMaster: 1,
  volumeSfx: 0.8,
  volumeMusic: 0.5,
};

// Persisted fields for save data (serializable subset)
interface PersistedState {
  stars: number;
  gems: number;
  ownedItems: string[];
  placedDecorations: PlacedDecoration[];
  unlockedBridges: string[]; // Serialized as array for JSON
  letterProgress: Record<string, LetterProgress>;
  learningMode: boolean;
  accessibility: AccessibilitySettings;
  parentSettings: ParentSettings;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
  word: '',
  dimension: 'Home',
  score: 0,
  letterBlocks: [],
  hitLetters: [],
  gamePhase: 'idle',
  isInputFocused: false,

  // Learning mode defaults
  learningMode: false,
  letterProgress: {},
  activeSpeechBubble: null,

  // Island network defaults
  currentIslandId: 'home',
  unlockedBridges: new Set<string>(),

  // Home customization defaults
  stars: 0,
  gems: 0,
  buildMode: false,
  placedDecorations: [],
  ownedItems: [],

  // Photo mode defaults
  photoMode: false,

  // Mini-game defaults
  activeMiniGame: null,
  miniGameTargets: [],

  // Accessibility defaults
  accessibility: DEFAULT_ACCESSIBILITY,

  // Parent settings defaults
  parentSettings: DEFAULT_PARENT_SETTINGS,
  parentDashboardOpen: false,

  setWord: (word) => set({ word }),
  setDimension: (dimension) => set({ dimension }),

  changeDimension: () => {
    const current = get().dimension;
    const others = ALL_DIMENSIONS.filter((d) => d !== current);
    const next = others[Math.floor(Math.random() * others.length)];
    set({ dimension: next });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('dimension-warp', { detail: { dimension: next } }),
      );
    }
  },

  incrementScore: () => set((state) => ({ score: state.score + 1, stars: state.stars + 1 })),

  addLetterBlock: (block) =>
    set((state) => ({ letterBlocks: [...state.letterBlocks, block] })),

  removeLetterBlock: (id) =>
    set((state) => ({
      letterBlocks: state.letterBlocks.filter((b) => b.id !== id),
    })),

  markLetterHit: (id, letter, eventType) =>
    set((state) => {
      // Portals award 3 gems
      const gemBonus = eventType === 'Portal' ? 3 : 0;
      return {
        hitLetters: [
          ...state.hitLetters,
          { letterId: id, letter, eventType, timestamp: Date.now() },
        ],
        gems: state.gems + gemBonus,
      };
    }),

  setGamePhase: (gamePhase) =>
    set((state) => ({
      gamePhase,
      // Award 5 gems on all-clear
      gems: gamePhase === 'allClear' ? state.gems + 5 : state.gems,
    })),
  setIsInputFocused: (isInputFocused) => set({ isInputFocused }),

  resetGame: () =>
    set({ word: '', score: 0, letterBlocks: [], hitLetters: [], gamePhase: 'idle' }),

  resetWord: () => set({ word: '', letterBlocks: [], hitLetters: [], gamePhase: 'idle' }),

  // Learning mode actions
  setLearningMode: (learningMode) => set({ learningMode }),

  recordAnimalHit: (letter) =>
    set((state) => {
      const upper = letter.toUpperCase();
      const existing = state.letterProgress[upper];
      const count = existing ? existing.animalHitCount + 1 : 1;
      return {
        letterProgress: {
          ...state.letterProgress,
          [upper]: { letter: upper, animalHitCount: count },
        },
      };
    }),

  showSpeechBubble: (data) => set({ activeSpeechBubble: data }),
  clearSpeechBubble: () => set({ activeSpeechBubble: null }),

  isLetterLearned: (letter) => {
    const progress = get().letterProgress[letter.toUpperCase()];
    return !!progress && progress.animalHitCount >= LEARNED_THRESHOLD;
  },

  // Island network actions
  setCurrentIsland: (islandId) => {
    const node = ISLAND_NODES.find((n) => n.id === islandId);
    if (node) {
      set({ currentIslandId: islandId, dimension: node.dimension });
    }
  },

  unlockBridge: (from, to) =>
    set((state) => {
      const key = `${from}->${to}`;
      const newSet = new Set(state.unlockedBridges);
      newSet.add(key);
      // Also add reverse direction
      newSet.add(`${to}->${from}`);
      return { unlockedBridges: newSet };
    }),

  isBridgeUnlocked: (from, to) => {
    return get().unlockedBridges.has(`${from}->${to}`);
  },

  checkWordUnlock: (word) => {
    const upper = word.toUpperCase();
    const state = get();
    for (const bridge of BRIDGE_CONFIGS) {
      const target = ISLAND_NODES.find((n) => n.id === bridge.to);
      if (!target) continue;
      if (target.unlockWords.includes(upper) && !state.unlockedBridges.has(`${bridge.from}->${bridge.to}`)) {
        state.unlockBridge(bridge.from, bridge.to);
      }
    }
  },

  // Home customization actions
  addStars: (amount) => set((state) => ({ stars: state.stars + amount })),
  addGems: (amount) => set((state) => ({ gems: state.gems + amount })),
  setBuildMode: (buildMode) => set({ buildMode }),

  purchaseItem: (itemId) => {
    const item = getDecorationById(itemId);
    if (!item) return false;

    const state = get();
    const balance = item.currency === 'stars' ? state.stars : state.gems;
    if (balance < item.cost) return false;

    set({
      [item.currency === 'stars' ? 'stars' : 'gems']: balance - item.cost,
      ownedItems: [...state.ownedItems, itemId],
    });
    return true;
  },

  placeDecoration: (decoration) =>
    set((state) => ({
      placedDecorations: [...state.placedDecorations, decoration],
    })),

  removeDecoration: (instanceId) =>
    set((state) => ({
      placedDecorations: state.placedDecorations.filter((d) => d.instanceId !== instanceId),
    })),

  moveDecoration: (instanceId, position, rotationY) =>
    set((state) => ({
      placedDecorations: state.placedDecorations.map((d) =>
        d.instanceId === instanceId ? { ...d, position, rotationY } : d,
      ),
    })),

  // Mini-game actions
  startMiniGame: (type, carPosition) =>
    set({
      activeMiniGame: createMiniGameState(type),
      miniGameTargets: generateTargets(type, carPosition),
    }),

  collectMiniGameTarget: (targetId) =>
    set((state) => ({
      miniGameTargets: state.miniGameTargets.map((t) =>
        t.id === targetId ? { ...t, collected: true } : t,
      ),
      activeMiniGame: state.activeMiniGame
        ? { ...state.activeMiniGame, score: state.activeMiniGame.score + 1 }
        : null,
    })),

  endMiniGame: (completed) => {
    const state = get();
    if (!state.activeMiniGame) return;

    if (completed) {
      const config = MINIGAME_CONFIGS[state.activeMiniGame.type];
      set((s) => ({
        activeMiniGame: null,
        miniGameTargets: [],
        stars: s.stars + config.rewardStars,
        gems: s.gems + config.rewardGems,
      }));
    } else {
      set({ activeMiniGame: null, miniGameTargets: [] });
    }
  },

  // Accessibility actions
  setAccessibility: (settings) =>
    set((state) => ({
      accessibility: { ...state.accessibility, ...settings },
    })),

  // Parent settings actions
  setParentSettings: (settings) =>
    set((state) => ({
      parentSettings: { ...state.parentSettings, ...settings },
    })),
  setParentDashboardOpen: (parentDashboardOpen) => set({ parentDashboardOpen }),

  // Photo mode actions
  setPhotoMode: (photoMode) => set({ photoMode }),
    }),
    {
      name: 'letter-crash-save',
      storage: createJSONStorage(() => localStorage),
      partialize: (state): PersistedState => ({
        stars: state.stars,
        gems: state.gems,
        ownedItems: state.ownedItems,
        placedDecorations: state.placedDecorations,
        unlockedBridges: Array.from(state.unlockedBridges),
        letterProgress: state.letterProgress,
        learningMode: state.learningMode,
        accessibility: state.accessibility,
        parentSettings: state.parentSettings,
      }),
      merge: (persisted, current) => {
        const saved = persisted as Partial<PersistedState> | undefined;
        return {
          ...current,
          stars: saved?.stars ?? (current as GameState).stars,
          gems: saved?.gems ?? (current as GameState).gems,
          ownedItems: saved?.ownedItems ?? (current as GameState).ownedItems,
          placedDecorations: saved?.placedDecorations ?? (current as GameState).placedDecorations,
          unlockedBridges: new Set(saved?.unlockedBridges ?? []),
          letterProgress: saved?.letterProgress ?? (current as GameState).letterProgress,
          learningMode: saved?.learningMode ?? (current as GameState).learningMode,
          accessibility: saved?.accessibility ?? DEFAULT_ACCESSIBILITY,
          parentSettings: saved?.parentSettings ?? DEFAULT_PARENT_SETTINGS,
        };
      },
    },
  ),
);
