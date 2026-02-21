"use client";

import { useState } from "react";
import { useCharacterStore } from "@/game/stores/character-store";
import { useGameStore } from "@/game/stores/game-store";
import {
  SKIN_TONES,
  HAIR_COLORS,
  BODY_COLORS,
  PANTS_COLORS,
  SHOE_COLORS,
  ACCESSORIES,
  COLLECTIBLE_META,
  PREMIUM_ITEMS,
} from "@/game/constants";
import { ColorSwatch } from "./ColorSwatch";
import type { AccessoryType, CharacterConfig } from "@/types";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-bold uppercase tracking-[1.8px] text-[var(--color-text-dim)] mb-2 mt-5 first:mt-0">
      {children}
    </div>
  );
}

function SwatchRow({
  colors,
  current,
  onSelect,
}: {
  colors: readonly string[];
  current: string;
  onSelect: (color: string, cost: number) => void;
}) {
  const unlockedItems = useCharacterStore((s) => s.unlockedItems);

  return (
    <div className="flex gap-1.5 flex-wrap">
      {colors.map((c) => {
        const cost = PREMIUM_ITEMS[c] || 0;
        const isLocked = cost > 0 && !unlockedItems.includes(c);
        return (
          <ColorSwatch
            key={c}
            color={c}
            selected={current === c}
            locked={isLocked}
            onClick={() => {
              onSelect(c, cost);
            }}
          />
        );
      })}
    </div>
  );
}

function AccessoryButton({
  id,
  label,
  icon,
  selected,
  onSelect,
}: {
  id: string;
  label: string;
  icon: string;
  selected: boolean;
  onSelect: (id: string, cost: number) => void;
}) {
  const unlockedItems = useCharacterStore((s) => s.unlockedItems);
  const cost = PREMIUM_ITEMS[id] || 0;
  const isLocked = cost > 0 && !unlockedItems.includes(id) && id !== "none";

  return (
    <button
      onClick={() => {
        onSelect(id, cost);
      }}
      className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all outline-none relative"
      style={{
        border: selected
          ? "1px solid var(--color-accent)"
          : "1px solid var(--color-panel-border)",
        background: selected ? "rgba(5, 150, 105, 0.15)" : "transparent",
        color: selected ? "var(--color-accent-glow)" : "var(--color-text-dim)",
        cursor: "pointer",
        fontFamily: "inherit",
        opacity: isLocked ? 0.6 : 1,
      }}
    >
      <span className="text-sm">{icon}</span>
      {label}
      {isLocked && <span className="absolute top-1 right-1 text-[8px]">🔒</span>}
    </button>
  );
}

export function DesignPanel() {
  const config = useCharacterStore((s) => s.config);
  const panelOpen = useCharacterStore((s) => s.panelOpen);
  const unlockedItems = useCharacterStore((s) => s.unlockedItems);
  const updateConfig = useCharacterStore((s) => s.updateConfig);
  const unlockItem = useCharacterStore((s) => s.unlockItem);
  const score = useGameStore((s) => s.score);

  const [unlockTarget, setUnlockTarget] = useState<{ id: string; type: keyof CharacterConfig; cost: number } | null>(null);

  const handleSelect = (key: keyof CharacterConfig) => (id: string, cost: number) => {
    if (cost > 0 && !unlockedItems.includes(id) && id !== "none") {
      setUnlockTarget({ id, type: key, cost });
    } else {
      updateConfig(key, id as any);
    }
  };

  const confirmUnlock = () => {
    if (unlockTarget && score >= unlockTarget.cost) {
      unlockItem(unlockTarget.id, unlockTarget.cost);
      updateConfig(unlockTarget.type, unlockTarget.id as any);
      setUnlockTarget(null);
    }
  };

  return (
    <div
      className="shrink-0 overflow-hidden transition-[width,opacity] duration-300 ease-out relative"
      style={{
        width: panelOpen ? 300 : 0,
        opacity: panelOpen ? 1 : 0,
        borderLeft: panelOpen ? "1px solid var(--color-panel-border)" : "1px solid transparent",
        background: "var(--color-panel)",
        pointerEvents: panelOpen ? "auto" : "none",
      }}
    >
      <div className="w-[300px] h-full overflow-y-auto p-5 box-border relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <div>
            <div className="text-[15px] font-bold">Character Design</div>
            <div className="text-[11px] text-[var(--color-text-dim)]">Customize your player</div>
          </div>
          <div
            className="w-9 h-9 rounded-[10px] flex items-center justify-center text-lg"
            style={{ background: "rgba(5, 150, 105, 0.15)" }}
          >
            🧑
          </div>
        </div>

        <div className="my-3" style={{ height: 1, background: "var(--color-panel-border)" }} />

        {/* Skin Tone */}
        <SectionTitle>Skin Tone</SectionTitle>
        <SwatchRow colors={SKIN_TONES} current={config.skinTone} onSelect={handleSelect("skinTone")} />

        {/* Hair */}
        <SectionTitle>Hair</SectionTitle>
        <SwatchRow colors={HAIR_COLORS} current={config.hairColor} onSelect={handleSelect("hairColor")} />

        {/* Outfit */}
        <SectionTitle>Outfit</SectionTitle>
        <SwatchRow colors={BODY_COLORS} current={config.bodyColor} onSelect={handleSelect("bodyColor")} />

        {/* Pants */}
        <SectionTitle>Pants</SectionTitle>
        <SwatchRow colors={PANTS_COLORS} current={config.pantsColor} onSelect={handleSelect("pantsColor")} />

        {/* Shoes */}
        <SectionTitle>Shoes</SectionTitle>
        <SwatchRow colors={SHOE_COLORS} current={config.shoeColor} onSelect={handleSelect("shoeColor")} />

        {/* Accessories */}
        <SectionTitle>Accessories</SectionTitle>
        <div className="flex gap-1.5 flex-wrap">
          {(Object.entries(ACCESSORIES) as [AccessoryType, { label: string; icon: string }][]).map(([id, acc]) => (
            <AccessoryButton
              key={id}
              id={id}
              label={acc.label}
              icon={acc.icon}
              selected={config.accessory === id}
              onSelect={handleSelect("accessory")}
            />
          ))}
        </div>

        <div className="my-5" style={{ height: 1, background: "var(--color-panel-border)" }} />

        {/* Collectibles Legend */}
        <SectionTitle>Collectibles</SectionTitle>
        <div className="grid gap-2">
          {(Object.entries(COLLECTIBLE_META) as [string, { icon: string; label: string; points: number; color: string }][]).map(([key, item]) => (
            <div key={key} className="flex justify-between items-center text-xs text-[var(--color-text-dim)]">
              <span>
                <span className="mr-1.5">{item.icon}</span>
                {item.label}
              </span>
              <span className="font-bold text-[11px]" style={{ fontFamily: "var(--font-mono)", color: item.color }}>
                {item.points} pts
              </span>
            </div>
          ))}
        </div>

        <div className="my-4" style={{ height: 1, background: "var(--color-panel-border)" }} />

        <div className="text-[10px] text-center leading-relaxed" style={{ color: "#333348" }}>
          Eve&apos;s Garden — Built with R3F + Drei + Zustand
        </div>
      </div>

      {/* Unlock Modal Overlay */}
      {unlockTarget && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="glass rounded-xl p-5 w-full text-center">
            <div className="text-3xl mb-2">🔒</div>
            <h3 className="font-bold mb-1">Unlock Item?</h3>
            <p className="text-sm text-[var(--color-text-dim)] mb-4">
              This costs <span className="font-bold" style={{ color: "var(--color-accent-glow)" }}>{unlockTarget.cost} pts</span>
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setUnlockTarget(null)}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-transparent border border-[var(--color-panel-border)] text-[var(--color-text-dim)] cursor-pointer transition-colors"
                style={{ fontFamily: "inherit" }}
              >
                Cancel
              </button>
              <button
                onClick={confirmUnlock}
                disabled={score < unlockTarget.cost}
                className="px-4 py-2 rounded-lg text-xs font-bold border-none transition-colors"
                style={{
                  background: score >= unlockTarget.cost ? "var(--color-accent)" : "var(--color-panel-border)",
                  color: score >= unlockTarget.cost ? "white" : "var(--color-text-dim)",
                  opacity: score >= unlockTarget.cost ? 1 : 0.5,
                  cursor: score >= unlockTarget.cost ? "pointer" : "not-allowed",
                  fontFamily: "inherit"
                }}
              >
                {score >= unlockTarget.cost ? "Unlock" : "Not enough pts"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
