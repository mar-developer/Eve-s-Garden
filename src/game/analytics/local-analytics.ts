import { Dimension, PlayStats, TimeOfDay } from '../../types/letter-crash';

const STORAGE_KEY = 'letter-crash-stats';
const MAX_WORD_HISTORY = 50;

/** Default empty stats */
function createDefaultStats(): PlayStats {
  return {
    totalPlayTimeMs: 0,
    sessionsToday: 0,
    totalLettersCrashed: 0,
    totalWordsTyped: 0,
    dimensionsVisited: [],
    wordHistory: [],
    sessionStartedAt: Date.now(),
  };
}

/** Load stats from localStorage */
export function loadStats(): PlayStats {
  if (typeof window === 'undefined') return createDefaultStats();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultStats();
    return { ...createDefaultStats(), ...JSON.parse(raw) };
  } catch {
    return createDefaultStats();
  }
}

/** Save stats to localStorage */
export function saveStats(stats: PlayStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // Silently fail if localStorage is full
  }
}

/** Record a word being typed */
export function recordWord(word: string, stats: PlayStats): PlayStats {
  const history = [...stats.wordHistory, word];
  if (history.length > MAX_WORD_HISTORY) history.shift();
  return {
    ...stats,
    totalWordsTyped: stats.totalWordsTyped + 1,
    wordHistory: history,
  };
}

/** Record a letter being crashed */
export function recordLetterCrash(stats: PlayStats): PlayStats {
  return {
    ...stats,
    totalLettersCrashed: stats.totalLettersCrashed + 1,
  };
}

/** Record visiting a dimension */
export function recordDimensionVisit(dimension: Dimension, stats: PlayStats): PlayStats {
  if (stats.dimensionsVisited.includes(dimension)) return stats;
  return {
    ...stats,
    dimensionsVisited: [...stats.dimensionsVisited, dimension],
  };
}

/** Update play time since session start */
export function updatePlayTime(stats: PlayStats): PlayStats {
  const elapsed = Date.now() - stats.sessionStartedAt;
  return {
    ...stats,
    totalPlayTimeMs: stats.totalPlayTimeMs + elapsed,
    sessionStartedAt: Date.now(),
  };
}

/** Start a new session */
export function startSession(stats: PlayStats): PlayStats {
  return {
    ...stats,
    sessionsToday: stats.sessionsToday + 1,
    sessionStartedAt: Date.now(),
  };
}

/** Get most typed word from history */
export function getMostTypedWord(stats: PlayStats): string | null {
  if (stats.wordHistory.length === 0) return null;
  const counts: Record<string, number> = {};
  for (const word of stats.wordHistory) {
    counts[word] = (counts[word] ?? 0) + 1;
  }
  let max = 0;
  let maxWord = '';
  for (const [word, count] of Object.entries(counts)) {
    if (count > max) {
      max = count;
      maxWord = word;
    }
  }
  return maxWord;
}

/** Get time-of-day based on current hour */
export function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

/** Format play time as human-readable string */
export function formatPlayTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours > 0) return `${hours}h ${remainingMinutes}m`;
  return `${minutes}m`;
}
