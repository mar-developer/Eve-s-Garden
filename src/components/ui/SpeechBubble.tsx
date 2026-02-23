"use client";

import { useEffect } from "react";
import { useGameStore } from "../../game/stores/letter-crash-store";

export const SpeechBubble = () => {
  const bubble = useGameStore((s) => s.activeSpeechBubble);

  useEffect(() => {
    if (!bubble) return;

    const timer = setTimeout(() => {
      useGameStore.getState().clearSpeechBubble();
    }, 3000);

    return () => clearTimeout(timer);
  }, [bubble]);

  if (!bubble) return null;

  return (
    <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
      <div
        className="relative bg-white rounded-3xl px-10 py-6 shadow-2xl"
        style={{ animation: "speech-bounce-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both" }}
      >
        <p className="text-4xl font-black text-gray-800 text-center whitespace-nowrap select-none">
          <span className="text-sky-500">{bubble.letter}</span>
          {" is for "}
          <span className="text-amber-500">{bubble.animalName}</span>!
        </p>

        {/* Speech bubble tail */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -bottom-3 w-6 h-6 bg-white rotate-45 rounded-sm"
        />
      </div>
    </div>
  );
};
