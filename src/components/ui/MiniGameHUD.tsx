"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "../../game/stores/letter-crash-store";
import {
  getMiniGameTimeRemaining,
  MINIGAME_CONFIGS,
} from "../../game/minigames/minigame-manager";
import type { MiniGameType } from "../../types/letter-crash";

const MINIGAME_INFO: Record<MiniGameType, { icon: string; label: string }> = {
  TargetPractice: { icon: "\uD83C\uDFAF", label: "Target Practice" },
  SpeedRings: { icon: "\uD83D\uDCAB", label: "Speed Rings" },
  ColorMatch: { icon: "\uD83C\uDFA8", label: "Color Match" },
  MusicMaker: { icon: "\uD83C\uDFB5", label: "Music Maker" },
  QuickBuild: { icon: "\uD83D\uDD28", label: "Quick Build" },
};

export function MiniGameHUD() {
  const activeMiniGame = useGameStore((s) => s.activeMiniGame);
  const miniGameTargets = useGameStore((s) => s.miniGameTargets);
  const endMiniGame = useGameStore((s) => s.endMiniGame);

  const [timeRemaining, setTimeRemaining] = useState(1);
  const [showTimesUp, setShowTimesUp] = useState(false);
  const [showComplete, setShowComplete] = useState(false);

  // Poll timer (display only — MiniGameRenderer owns end-game logic)
  useEffect(() => {
    if (!activeMiniGame) return;

    const interval = setInterval(() => {
      const remaining = getMiniGameTimeRemaining(activeMiniGame);
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        setShowTimesUp(true);
        setTimeout(() => setShowTimesUp(false), 1500);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [activeMiniGame]);

  // Detect all targets collected (display only)
  const collected = miniGameTargets.filter((t) => t.collected).length;
  const total = miniGameTargets.length;

  useEffect(() => {
    if (total > 0 && collected === total && activeMiniGame) {
      setShowComplete(true);
      setTimeout(() => setShowComplete(false), 1500);
    }
  }, [collected, total, activeMiniGame]);

  // Reset local state when mini-game starts
  useEffect(() => {
    if (activeMiniGame) {
      setTimeRemaining(1);
      setShowTimesUp(false);
      setShowComplete(false);
    }
  }, [activeMiniGame]);

  if (!activeMiniGame) return null;

  const info = MINIGAME_INFO[activeMiniGame.type];
  const config = MINIGAME_CONFIGS[activeMiniGame.type];

  const barColor =
    timeRemaining > 0.6
      ? "bg-emerald-400"
      : timeRemaining > 0.3
        ? "bg-amber-400"
        : "bg-red-500";

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center gap-2">
      {/* Main HUD bar */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border-4 border-white shadow-lg px-6 py-4 flex flex-col items-center gap-3 min-w-[320px] pointer-events-auto">
        {/* Title row */}
        <div className="flex items-center gap-3">
          <span className="text-3xl">{info.icon}</span>
          <span className="font-black text-lg text-slate-700 uppercase tracking-widest">
            {info.label}
          </span>
        </div>

        {/* Timer bar */}
        <div className="w-full bg-slate-200 h-4 rounded-full overflow-hidden border-2 border-slate-300">
          <div
            className={`h-full rounded-full transition-all duration-100 ${barColor}`}
            style={{ width: `${timeRemaining * 100}%` }}
          />
        </div>

        {/* Score + Rewards row */}
        <div className="flex items-center justify-between w-full">
          {/* Target counter */}
          <div className="flex items-center gap-2">
            <span className="font-black text-xl text-slate-700">
              {collected} / {total}
            </span>
            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              Targets
            </span>
          </div>

          {/* Reward preview */}
          <div className="flex items-center gap-3">
            {config.rewardStars > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-lg">{"\u2B50"}</span>
                <span className="font-black text-sm text-amber-600">
                  +{config.rewardStars}
                </span>
              </div>
            )}
            {config.rewardGems > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-lg">{"\uD83D\uDC8E"}</span>
                <span className="font-black text-sm text-violet-600">
                  +{config.rewardGems}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Skip button */}
        <button
          onClick={() => endMiniGame(false)}
          className="text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-red-500 transition-colors"
        >
          Skip
        </button>
      </div>

      {/* TIME'S UP flash */}
      {showTimesUp && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-black text-4xl text-red-500 uppercase tracking-widest drop-shadow-lg"
            style={{ animation: "minigame-flash 0.3s ease-in-out infinite alternate" }}
          >
            {"Time\u2019s Up!"}
          </span>
        </div>
      )}

      {/* COMPLETE celebration */}
      {showComplete && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-black text-4xl text-emerald-500 uppercase tracking-widest drop-shadow-lg"
            style={{ animation: "minigame-pulse 0.4s ease-in-out infinite alternate" }}
          >
            {"Complete!"}
          </span>
        </div>
      )}

      {/* Inline keyframes */}
      <style>{`
        @keyframes minigame-flash {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0.6; transform: scale(1.1); }
        }
        @keyframes minigame-pulse {
          from { transform: scale(1); filter: drop-shadow(0 0 8px #34d399); }
          to { transform: scale(1.15); filter: drop-shadow(0 0 20px #34d399); }
        }
      `}</style>
    </div>
  );
}
