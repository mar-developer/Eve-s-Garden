"use client";

import { useGameStore } from "../../game/stores/letter-crash-store";
import { EventType, HitRecord } from "../../types/letter-crash";

const DIMENSION_EMOJIS: Record<string, string> = {
  Home: "\u{1F3E0}",
  Candy: "\u{1F36C}",
  Space: "\u{1F680}",
  Ocean: "\u{1F30A}",
  Volcano: "\u{1F30B}",
  Cloud: "\u2601\uFE0F",
};

const EVENT_ICONS: Record<EventType, string> = {
  Explosion: "\u{1F4A5}",
  Portal: "\u{1F300}",
  Stars: "\u2B50",
  Animal: "\u{1F43E}",
  Enemy: "\u{1F47B}",
  Music: "\u{1F3B5}",
};

const EVENT_COLORS: Record<EventType, string> = {
  Explosion: "bg-orange-500",
  Portal: "bg-violet-500",
  Stars: "bg-amber-400",
  Animal: "bg-emerald-500",
  Enemy: "bg-slate-600",
  Music: "bg-pink-500",
};

function findHitForPosition(
  hitLetters: HitRecord[],
  word: string,
  index: number
): HitRecord | undefined {
  const suffix = `-${index}-${word[index]}`;
  return hitLetters.find((record) => record.letterId.endsWith(suffix));
}

export const LetterHUD = () => {
  const currentDimension = useGameStore((state) => state.dimension);
  const word = useGameStore((state) => state.word);
  const hitLetters = useGameStore((state) => state.hitLetters);
  const stars = useGameStore((state) => state.stars);
  const gems = useGameStore((state) => state.gems);
  const setBuildMode = useGameStore((state) => state.setBuildMode);
  const setPhotoMode = useGameStore((state) => state.setPhotoMode);
  const setParentDashboardOpen = useGameStore((state) => state.setParentDashboardOpen);
  const currentIslandId = useGameStore((state) => state.currentIslandId);

  return (
    <div className="absolute top-0 left-0 w-full p-4 sm:p-6 flex flex-col gap-2 pointer-events-none z-10">
      {/* Top row: dimension, currency, actions */}
      <div className="flex justify-between items-start">
        {/* Left: Dimension & Currency */}
        <div className="flex gap-2 sm:gap-3 flex-wrap">
          <div className="bg-white/90 backdrop-blur-md px-4 py-2 sm:px-6 sm:py-3 rounded-2xl sm:rounded-3xl shadow-lg border-3 sm:border-4 border-white flex items-center gap-2 sm:gap-3">
            <span className="text-2xl sm:text-3xl">
              {DIMENSION_EMOJIS[currentDimension]}
            </span>
            <span className="font-black text-base sm:text-xl text-slate-700 uppercase tracking-widest">
              {currentDimension}
            </span>
          </div>

          <div className="bg-amber-400 text-amber-900 px-3 py-2 sm:px-5 sm:py-3 rounded-2xl sm:rounded-3xl shadow-lg border-3 sm:border-4 border-white flex items-center gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-2xl">{"\u2B50"}</span>
            <span className="font-black text-lg sm:text-xl tracking-widest">{stars}</span>
          </div>

          <div className="bg-violet-400 text-violet-900 px-3 py-2 sm:px-5 sm:py-3 rounded-2xl sm:rounded-3xl shadow-lg border-3 sm:border-4 border-white flex items-center gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-2xl">{"\uD83D\uDC8E"}</span>
            <span className="font-black text-lg sm:text-xl tracking-widest">{gems}</span>
          </div>
        </div>

        {/* Right: action buttons */}
        <div className="flex gap-2 items-start">
          {currentIslandId === 'home' && (
            <button
              onClick={() => setBuildMode(true)}
              className="pointer-events-auto bg-emerald-400 text-white px-3 py-2 sm:px-4 sm:py-3 rounded-2xl sm:rounded-3xl shadow-lg border-3 sm:border-4 border-white font-black text-sm sm:text-base uppercase tracking-wider hover:bg-emerald-500 active:scale-95 transition-all"
            >
              {"\uD83D\uDD28"} Build
            </button>
          )}
          <button
            onClick={() => setPhotoMode(true)}
            className="pointer-events-auto bg-sky-400 text-white px-3 py-2 sm:px-4 sm:py-3 rounded-2xl sm:rounded-3xl shadow-lg border-3 sm:border-4 border-white font-black text-sm sm:text-base uppercase tracking-wider hover:bg-sky-500 active:scale-95 transition-all"
          >
            {"\uD83D\uDCF7"}
          </button>
          <button
            onClick={() => setParentDashboardOpen(true)}
            className="pointer-events-auto bg-slate-500 text-white px-3 py-2 sm:px-4 sm:py-3 rounded-2xl sm:rounded-3xl shadow-lg border-3 sm:border-4 border-white font-black text-sm sm:text-base uppercase tracking-wider hover:bg-slate-600 active:scale-95 transition-all"
          >
            {"\u2699\uFE0F"}
          </button>
        </div>
      </div>

      {/* Per-Letter Tracker (second row, centered) */}
      {word.length > 0 && (
        <div className="flex gap-2 justify-center">
          {word.split("").map((char, index) => {
            const hit = findHitForPosition(hitLetters, word, index);
            const isHit = hit !== undefined;

            return (
              <div
                key={index}
                className={[
                  "min-w-10 h-10 rounded-xl flex items-center justify-center border-4 shadow-lg",
                  "transition-all duration-300",
                  isHit
                    ? `${EVENT_COLORS[hit.eventType]} border-white text-white scale-110`
                    : "bg-white/80 border-slate-200 text-slate-400 scale-100",
                ].join(" ")}
              >
                <span className="text-lg font-black leading-none">
                  {isHit ? EVENT_ICONS[hit.eventType] : char}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
