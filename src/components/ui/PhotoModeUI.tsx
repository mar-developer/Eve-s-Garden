"use client";
import { useState, useCallback } from "react";
import { useGameStore } from "../../game/stores/letter-crash-store";

const STICKERS = [
  { id: "star", emoji: "\u2B50" },
  { id: "heart", emoji: "\u2764\uFE0F" },
  { id: "rainbow", emoji: "\uD83C\uDF08" },
  { id: "sparkle", emoji: "\u2728" },
  { id: "crown", emoji: "\uD83D\uDC51" },
  { id: "flower", emoji: "\uD83C\uDF3B" },
];

interface PlacedSticker {
  id: string;
  emoji: string;
  x: number;
  y: number;
}

export function PhotoModeUI() {
  const photoMode = useGameStore((s) => s.photoMode);
  const setPhotoMode = useGameStore((s) => s.setPhotoMode);

  const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>([]);
  const [activeSticker, setActiveSticker] = useState<string | null>(null);

  const takeScreenshot = useCallback(() => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `sky-islands-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, []);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!activeSticker) return;
      const sticker = STICKERS.find((s) => s.id === activeSticker);
      if (!sticker) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      setPlacedStickers((prev) => [
        ...prev,
        { id: `${sticker.id}-${Date.now()}`, emoji: sticker.emoji, x, y },
      ]);
    },
    [activeSticker],
  );

  const handleExit = useCallback(() => {
    setPlacedStickers([]);
    setActiveSticker(null);
    setPhotoMode(false);
  }, [setPhotoMode]);

  if (!photoMode) return null;

  return (
    <div
      className="absolute inset-0 z-50"
      style={{ cursor: activeSticker ? "crosshair" : "default" }}
      onClick={handleOverlayClick}
    >
      {/* Placed stickers */}
      {placedStickers.map((s) => (
        <span
          key={s.id}
          className="absolute pointer-events-none select-none"
          style={{ left: `${s.x}%`, top: `${s.y}%`, fontSize: "3rem", transform: "translate(-50%, -50%)" }}
        >
          {s.emoji}
        </span>
      ))}

      {/* Top label */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md px-6 py-2 rounded-2xl">
          <span className="text-white font-black text-lg tracking-widest">
            {"\uD83D\uDCF7"} PHOTO MODE
          </span>
        </div>
      </div>

      {/* Bottom sticker picker */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 bg-black/60 backdrop-blur-md px-4 py-3 rounded-2xl pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {STICKERS.map((s) => (
          <button
            key={s.id}
            aria-label={`${s.id} sticker`}
            onClick={() => setActiveSticker(activeSticker === s.id ? null : s.id)}
            className={`w-12 h-12 rounded-full text-2xl flex items-center justify-center transition-transform hover:scale-110 ${
              activeSticker === s.id
                ? "bg-purple-500 ring-2 ring-white scale-110"
                : "bg-white/20 hover:bg-white/30"
            }`}
          >
            {s.emoji}
          </button>
        ))}
      </div>

      {/* Bottom-right action buttons */}
      <div
        className="absolute bottom-6 right-6 flex flex-col gap-3 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          aria-label="Take screenshot"
          onClick={takeScreenshot}
          className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-400 text-white text-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-110 font-black"
        >
          {"\uD83D\uDCF8"}
        </button>
        <button
          aria-label="Exit photo mode"
          onClick={handleExit}
          className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-400 text-white text-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-110 font-black"
        >
          {"\u2715"}
        </button>
      </div>
    </div>
  );
}
