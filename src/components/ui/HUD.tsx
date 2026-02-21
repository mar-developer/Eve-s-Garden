"use client";

import { useGameStore } from "@/game/stores/game-store";
import { useCharacterStore } from "@/game/stores/character-store";
import { COLLECTIBLE_POSITIONS } from "@/game/constants";

export function HUD() {
  const score = useGameStore((s) => s.score);
  const collected = useGameStore((s) => s.collected);
  const phase = useGameStore((s) => s.phase);
  const hint = useGameStore((s) => s.hint);
  const resetGame = useGameStore((s) => s.resetGame);
  const isDay = useGameStore((s) => s.isDay);
  const toggleDayNight = useGameStore((s) => s.toggleDayNight);
  const rotateCamera = useGameStore((s) => s.rotateCamera);
  const combo = useGameStore((s) => s.combo);

  const panelOpen = useCharacterStore((s) => s.panelOpen);
  const togglePanel = useCharacterStore((s) => s.togglePanel);

  const total = COLLECTIBLE_POSITIONS.length;
  const pct = Math.round((collected.size / total) * 100);

  return (
    <>
      {/* Top bar: Score + Combo + Progress */}
      <div className="hud-top-bar">
        {/* Score */}
        <div className="glass rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 flex items-center gap-2">
          <span className="text-base sm:text-lg">⭐</span>
          <span
            className="font-bold text-lg sm:text-xl"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {score}
          </span>
        </div>

        {/* Combo Badge */}
        {combo > 1 && (
          <div
            className="glass rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 flex items-center gap-1.5"
            style={{ animation: "combo-pulse 0.6s ease-in-out infinite" }}
          >
            <span className="text-base sm:text-lg">🔥</span>
            <span
              className="font-bold text-xs sm:text-sm"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--color-accent-glow)",
              }}
            >
              ×{combo}
            </span>
          </div>
        )}

        {/* Collection Progress */}
        <div className="glass rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 flex items-center gap-2 text-[12px] sm:text-[13px]">
          <span style={{ color: "var(--color-accent-glow)" }}>
            {collected.size}
          </span>
          <span style={{ color: "var(--color-text-dim)" }}>/</span>
          <span>{total}</span>
          <div
            className="ml-1 rounded-sm overflow-hidden"
            style={{
              width: 48,
              height: 4,
              background: "var(--color-panel-border)",
            }}
          >
            <div
              className="h-full rounded-sm transition-[width] duration-300"
              style={{
                width: `${pct}%`,
                background: "linear-gradient(90deg, var(--color-accent), var(--color-accent-glow))",
              }}
            />
          </div>
        </div>
      </div>

      {/* Toggle Design Panel */}
      <button
        onClick={togglePanel}
        className="hud-design-btn glass rounded-[10px] px-3 sm:px-3.5 py-2 text-xs flex items-center gap-1.5 transition-[right] duration-300 outline-none"
        style={{
          right: panelOpen ? 316 : 16,
          cursor: "pointer",
          color: "var(--color-text)",
          fontFamily: "inherit",
        }}
      >
        🎨 {panelOpen ? "Hide" : "Design"}
      </button>

      {/* Bottom Hint */}
      {hint && (
        <div
          className="absolute bottom-16 sm:bottom-6 left-1/2 -translate-x-1/2 glass rounded-full px-4 sm:px-5 py-2 text-[12px] sm:text-[13px]"
          style={{
            color: "var(--color-text-dim)",
            animation: "float-hint 2s ease-in-out infinite",
          }}
        >
          👆 {hint}
        </div>
      )}

      {/* Win Screen */}
      {phase === "won" && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 glass rounded-2xl px-8 sm:px-12 py-6 sm:py-8 text-center max-w-[90vw]">
          <div className="text-4xl sm:text-5xl mb-2">🎉</div>
          <div className="text-xl sm:text-2xl font-bold mb-1">All Collected!</div>
          <div
            className="text-2xl sm:text-3xl font-bold mb-4"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-accent-glow)",
            }}
          >
            {score} pts
          </div>
          <button
            onClick={resetGame}
            className="px-6 py-2.5 rounded-lg text-sm font-bold transition-all outline-none active:scale-95"
            style={{
              background: "var(--color-accent)",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              minHeight: 44,
            }}
          >
            Play Again
          </button>
        </div>
      )}

      {/* Camera & Environment Controls */}
      <div className="hud-controls">
        <button
          onClick={() => rotateCamera(-1)}
          className="hud-btn glass"
          title="Rotate Left"
        >
          ↺
        </button>
        <button
          onClick={() => rotateCamera(1)}
          className="hud-btn glass"
          title="Rotate Right"
        >
          ↻
        </button>
        <button
          onClick={toggleDayNight}
          className="hud-btn glass"
          title="Toggle Day/Night"
        >
          {isDay ? "🌙" : "☀️"}
        </button>
      </div>
    </>
  );
}
