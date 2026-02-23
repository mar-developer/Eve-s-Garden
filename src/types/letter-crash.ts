export type Dimension =
  | 'Home'
  | 'Candy'
  | 'Space'
  | 'Ocean'
  | 'Volcano'
  | 'Cloud';

export type EventType =
  | 'Explosion'
  | 'Portal'
  | 'Stars'
  | 'Animal'
  | 'Enemy'
  | 'Music';

export type GamePhase = 'idle' | 'playing' | 'allClear';

export interface LetterBlock {
  id: string;
  letter: string;
  position: [number, number, number];
  color: string;
  spawnIndex: number;
}

export interface HitRecord {
  letterId: string;
  letter: string;
  eventType: EventType;
  timestamp: number;
}

export interface DimensionConfig {
  id: Dimension;
  skyColor: string;
  groundColor: string;
  fogColor: string;
  fogDensity: number;
  ambientIntensity: number;
  particleColor: string;
}

/** Per-letter learning progress. A letter is "learned" after 3+ animal hits. */
export interface LetterProgress {
  letter: string;
  animalHitCount: number;
}

/** Active speech bubble data for the animal learning system */
export interface SpeechBubbleData {
  letter: string;
  animalName: string;
  position: [number, number, number];
  timestamp: number;
}

/** Island node in the sky archipelago network */
export interface IslandNode {
  id: string;
  dimension: Dimension;
  position: [number, number, number]; // World position of island center
  radius: number;
  unlockWords: string[]; // Words that unlock the bridge to this island
  label: string; // Display name
}

/** Bridge connecting two islands */
export interface BridgeConfig {
  from: string; // Island ID
  to: string; // Island ID
  unlocked: boolean;
}

// ─── Phase 6: Home Customization ──────────────────────────────────────────

export type DecorationCategory =
  | 'Trees'
  | 'Flowers'
  | 'Buildings'
  | 'Animals'
  | 'Fun'
  | 'Vehicles'
  | 'Magic';

export type CurrencyType = 'stars' | 'gems';

export interface DecorationItem {
  id: string;
  name: string;
  category: DecorationCategory;
  cost: number;
  currency: CurrencyType;
  meshType: string; // Key into procedural mesh renderer
  color: string; // Primary color
  scale: number; // Default scale multiplier
}

export interface PlacedDecoration {
  instanceId: string; // Unique per placement
  itemId: string; // References DecorationItem.id
  position: [number, number, number];
  rotationY: number; // Radians (0, PI/2, PI, 3PI/2)
}

// ─── Phase 8: Photo Mode ─────────────────────────────────────────────────

export type PhotoSticker = 'star' | 'heart' | 'rainbow' | 'sparkle' | 'crown' | 'flower';

export type PhotoFrame = 'none' | 'polaroid' | 'postcard' | 'birthday';

// ─── Phase 9: Mini-Games ──────────────────────────────────────────────────

export type MiniGameType =
  | 'TargetPractice'
  | 'SpeedRings'
  | 'ColorMatch'
  | 'MusicMaker'
  | 'QuickBuild';

export type MiniGamePhase = 'inactive' | 'starting' | 'active' | 'complete';

export interface MiniGameState {
  type: MiniGameType;
  phase: MiniGamePhase;
  startedAt: number;
  score: number; // Mini-game specific score
  timeLimit: number; // ms
}

export interface MiniGameTarget {
  id: string;
  position: [number, number, number];
  collected: boolean;
  color: string;
  order?: number; // For ordered mini-games (ColorMatch, MusicMaker)
}

// ─── Phase 10: Accessibility & Parent Dashboard ───────────────────────────

export type ColorBlindMode = 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';

export type TextScale = 1 | 1.2 | 1.5 | 2;

export type DifficultyPreset = 'easy' | 'normal' | 'explorer';

export interface AccessibilitySettings {
  colorBlindMode: ColorBlindMode;
  highContrast: boolean;
  autoDrive: boolean;
  textScale: TextScale;
}

export interface ParentSettings {
  pin: string; // 4-digit PIN
  timeLimitMinutes: number; // 0 = no limit
  difficulty: DifficultyPreset;
  learningMode: boolean;
  enabledDimensions: Dimension[];
  volumeMaster: number;
  volumeSfx: number;
  volumeMusic: number;
}

export interface PlayStats {
  totalPlayTimeMs: number;
  sessionsToday: number;
  totalLettersCrashed: number;
  totalWordsTyped: number;
  dimensionsVisited: Dimension[];
  wordHistory: string[]; // Last 50 words
  sessionStartedAt: number;
}

export type TimeOfDay = 'morning' | 'afternoon' | 'evening';
