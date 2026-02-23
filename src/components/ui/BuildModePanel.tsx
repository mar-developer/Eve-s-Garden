"use client";
import { useState } from "react";
import { useGameStore } from "../../game/stores/letter-crash-store";
import {
  DECORATION_CATEGORIES,
  CATEGORY_ICONS,
  getDecorationsByCategory,
  getDecorationById,
} from "../../game/decorations/decoration-registry";
import { DecorationCategory, PlacedDecoration } from "../../types/letter-crash";

export function BuildModePanel() {
  const buildMode = useGameStore((s) => s.buildMode);
  const setBuildMode = useGameStore((s) => s.setBuildMode);
  const stars = useGameStore((s) => s.stars);
  const gems = useGameStore((s) => s.gems);
  const ownedItems = useGameStore((s) => s.ownedItems);
  const purchaseItem = useGameStore((s) => s.purchaseItem);
  const placeDecoration = useGameStore((s) => s.placeDecoration);

  const [activeCategory, setActiveCategory] = useState<DecorationCategory>("Trees");

  if (!buildMode) return null;

  const items = getDecorationsByCategory(activeCategory);

  function handleBuy(itemId: string) {
    purchaseItem(itemId);
  }

  function handlePlace(itemId: string) {
    const decoration: PlacedDecoration = {
      instanceId: `${itemId}-${Date.now()}`,
      itemId,
      position: [0, 0, 0],
      rotationY: 0,
    };
    placeDecoration(decoration);
  }

  function canAfford(itemId: string): boolean {
    const item = getDecorationById(itemId);
    if (!item) return false;
    return item.currency === "stars" ? stars >= item.cost : gems >= item.cost;
  }

  return (
    <div className="absolute top-0 right-0 h-full w-80 sm:w-96 pointer-events-auto z-20 flex flex-col bg-white/90 backdrop-blur-md border-l-4 border-white shadow-2xl animate-[slide-in-right_0.3s_ease-out]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b-3 border-amber-200">
        <h2 className="font-black text-xl text-slate-700 uppercase tracking-widest">
          Build
        </h2>
        <button
          onClick={() => setBuildMode(false)}
          className="w-10 h-10 rounded-xl bg-red-400 border-3 border-white shadow-lg flex items-center justify-center text-white font-black text-lg hover:bg-red-500 active:scale-95 transition-all"
          aria-label="Close build mode"
        >
          X
        </button>
      </div>

      {/* Currency Display */}
      <div className="flex gap-3 px-4 py-3">
        <div className="flex-1 bg-amber-400 text-amber-900 px-4 py-2 rounded-2xl border-3 border-white shadow-lg flex items-center justify-center gap-2">
          <span className="text-xl">{"\u2B50"}</span>
          <span className="font-black text-lg">{stars}</span>
        </div>
        <div className="flex-1 bg-violet-400 text-violet-900 px-4 py-2 rounded-2xl border-3 border-white shadow-lg flex items-center justify-center gap-2">
          <span className="text-xl">{"\uD83D\uDC8E"}</span>
          <span className="font-black text-lg">{gems}</span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 px-4 py-2 overflow-x-auto">
        {DECORATION_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={[
              "flex-shrink-0 px-3 py-2 rounded-xl border-3 font-black text-sm transition-all active:scale-95",
              activeCategory === cat
                ? "bg-violet-500 text-white border-white shadow-lg scale-105"
                : "bg-white/60 text-slate-600 border-slate-200 hover:bg-white",
            ].join(" ")}
          >
            <span className="mr-1">{CATEGORY_ICONS[cat]}</span>
            {cat}
          </button>
        ))}
      </div>

      {/* Item Grid */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {items.map((item) => {
            const owned = ownedItems.includes(item.id);
            const affordable = canAfford(item.id);
            const currencyIcon = item.currency === "stars" ? "\u2B50" : "\uD83D\uDC8E";

            return (
              <div
                key={item.id}
                className={[
                  "flex flex-col items-center gap-1 p-3 rounded-2xl border-3 shadow-md transition-all",
                  owned
                    ? "bg-emerald-50 border-emerald-300"
                    : affordable
                      ? "bg-white border-slate-200"
                      : "bg-slate-100 border-slate-200 opacity-50",
                ].join(" ")}
              >
                {/* Color preview circle */}
                <div
                  className="w-12 h-12 rounded-full border-3 border-white shadow-md"
                  style={{ backgroundColor: item.color }}
                />

                <span className="font-black text-xs text-slate-700 text-center leading-tight">
                  {item.name}
                </span>

                {!owned && (
                  <span className="text-xs font-bold text-slate-500">
                    {currencyIcon} {item.cost}
                  </span>
                )}

                {owned ? (
                  <button
                    onClick={() => handlePlace(item.id)}
                    className="w-full mt-1 px-2 py-1.5 rounded-xl bg-sky-400 text-white font-black text-xs border-2 border-white shadow-md hover:bg-sky-500 active:scale-95 transition-all"
                  >
                    Place
                  </button>
                ) : (
                  <button
                    onClick={() => handleBuy(item.id)}
                    disabled={!affordable}
                    className={[
                      "w-full mt-1 px-2 py-1.5 rounded-xl font-black text-xs border-2 border-white shadow-md transition-all",
                      affordable
                        ? "bg-emerald-400 text-white hover:bg-emerald-500 active:scale-95"
                        : "bg-slate-300 text-slate-400 cursor-not-allowed",
                    ].join(" ")}
                  >
                    Buy
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
