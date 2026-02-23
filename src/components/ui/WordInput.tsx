"use client";

import { useState, FormEvent, useRef, useEffect } from "react";
import { useGameStore } from "../../game/stores/letter-crash-store";
import { LetterBlock } from "../../types/letter-crash";
import { soundManager } from "../../game/audio/sound-manager";
import { vibrateCelebrate } from "../../game/audio/haptics";
import { WORD_SUGGESTIONS } from "../../game/animals/animal-registry";

const LETTER_COLORS = [
  "#FF6B6B", "#4ECDC4", "#FFE66D", "#A06CD5", "#FF9F1C",
  "#2EC4B6", "#FF8FCF", "#118AB2", "#06D6A0"
];

function getRandomPosition(): [number, number, number] {
  // Island radius is 40, spawn within radius 30
  const angle = Math.random() * Math.PI * 2;
  const radius = Math.random() * 30;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  const y = 0.75 + Math.random() * 0.5; // On ground level, hittable by car
  return [x, y, z];
}

const CATEGORY_EMOJIS: Record<string, string> = {
  Animals: "\uD83D\uDC31",
  Colors: "\uD83C\uDFA8",
  Family: "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67",
  Food: "\uD83C\uDF4E",
  Fun: "\u2B50",
};

export const WordInput = () => {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const setIsInputFocused = useGameStore((state) => state.setIsInputFocused);
  const gamePhase = useGameStore((state) => state.gamePhase);

  // Focus effect for styles
  useEffect(() => {
    const handleFocus = () => setIsInputFocused(true);
    const handleBlur = () => setIsInputFocused(false);

    const input = inputRef.current;
    if (input) {
      input.addEventListener('focus', handleFocus);
      input.addEventListener('blur', handleBlur);
    }

    return () => {
      if (input) {
        input.removeEventListener('focus', handleFocus);
        input.removeEventListener('blur', handleBlur);
      }
    };
  }, [setIsInputFocused]);

  const submitWord = (raw: string) => {
    const filteredWord = raw.trim().toUpperCase().replace(/[^A-Z]/g, '');
    if (!filteredWord) return;

    const newBlocks: LetterBlock[] = filteredWord.split('').map((char, index) => ({
      id: `${Date.now()}-${index}-${char}`,
      letter: char,
      position: getRandomPosition(),
      color: LETTER_COLORS[Math.floor(Math.random() * LETTER_COLORS.length)],
      spawnIndex: index,
    }));

    useGameStore.setState({
      word: filteredWord,
      letterBlocks: newBlocks,
      hitLetters: [],
      gamePhase: 'playing',
    });
    soundManager.playSfx('whoosh');

    // Check if this word unlocks a bridge
    useGameStore.getState().checkWordUnlock(filteredWord);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    submitWord(inputValue);
    setInputValue("");
    inputRef.current?.blur();
  };

  const handleSuggestion = (category: string) => {
    const words = WORD_SUGGESTIONS[category];
    if (!words || words.length === 0) return;
    const pick = words[Math.floor(Math.random() * words.length)];
    submitWord(pick);
    setInputValue("");
    inputRef.current?.blur();
  };

  const isAllClear = useGameStore(state => state.word && state.letterBlocks.length === 0);
  const showSuggestions = gamePhase === 'idle' || gamePhase === 'allClear';

  // Fanfare + haptic when ALL CLEAR triggers
  const prevAllClear = useRef(false);
  useEffect(() => {
    if (isAllClear && !prevAllClear.current) {
      soundManager.playSfx('fanfare');
      vibrateCelebrate();
    }
    prevAllClear.current = !!isAllClear;
  }, [isAllClear]);

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-10">

      {isAllClear && (
        <div className="animate-bounce bg-yellow-400 text-yellow-900 px-6 py-2 rounded-full font-black text-2xl uppercase tracking-widest border-4 border-white shadow-[0_4px_0_rgba(0,0,0,0.2)]">
          ALL CLEAR!
        </div>
      )}

      {showSuggestions && (
        <div className="flex gap-2 flex-wrap justify-center">
          {Object.keys(WORD_SUGGESTIONS).map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => handleSuggestion(category)}
              className="bg-white/70 hover:bg-white backdrop-blur-sm px-4 py-2 rounded-full font-bold text-lg text-gray-700 shadow-md border-2 border-white/80 active:scale-95 transition-all"
            >
              {CATEGORY_EMOJIS[category] ?? ""} {category}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex gap-2 bg-white/50 backdrop-blur-md p-3 rounded-3xl shadow-xl border-4 border-white/50 ring-4 ring-black/5"
      >
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type a word..."
          className="bg-white px-6 py-4 rounded-2xl text-2xl font-black text-gray-800 outline-none w-64 uppercase tracking-widest placeholder:text-gray-300 placeholder:font-bold"
          maxLength={12}
        />
        <button
          type="submit"
          className="bg-sky-400 hover:bg-sky-500 active:scale-95 transition-all text-white px-8 py-4 rounded-2xl font-black text-2xl shadow-[0_4px_0_#0284c7] hover:shadow-[0_2px_0_#0284c7] hover:translate-y-[2px]"
        >
          GO!
        </button>
      </form>
    </div>
  );
};
