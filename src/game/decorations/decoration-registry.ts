import { DecorationItem, DecorationCategory } from '../../types/letter-crash';

/**
 * Decoration catalog — all purchasable items for home island customization.
 * meshType maps to procedural mesh renderers in PlacedDecorations.tsx.
 */

export const DECORATION_ITEMS: DecorationItem[] = [
  // ─── Trees (Stars) ────────────────────────────────────────────────────────
  { id: 'tree-oak',     name: 'Oak Tree',        category: 'Trees',   cost: 5,  currency: 'stars', meshType: 'tree-round',   color: '#4CAF50', scale: 1 },
  { id: 'tree-palm',    name: 'Palm Tree',       category: 'Trees',   cost: 8,  currency: 'stars', meshType: 'tree-palm',    color: '#66BB6A', scale: 1 },
  { id: 'tree-cherry',  name: 'Cherry Blossom',  category: 'Trees',   cost: 12, currency: 'stars', meshType: 'tree-round',   color: '#F48FB1', scale: 1 },
  { id: 'tree-cactus',  name: 'Cactus',          category: 'Trees',   cost: 6,  currency: 'stars', meshType: 'tree-cactus',  color: '#81C784', scale: 0.8 },
  { id: 'tree-pine',    name: 'Pine Tree',       category: 'Trees',   cost: 10, currency: 'stars', meshType: 'tree-cone',    color: '#2E7D32', scale: 1.2 },

  // ─── Flowers (Stars) ──────────────────────────────────────────────────────
  { id: 'flower-daisy',     name: 'Daisy',      category: 'Flowers', cost: 3, currency: 'stars', meshType: 'flower', color: '#FFFFFF', scale: 0.6 },
  { id: 'flower-sunflower', name: 'Sunflower',  category: 'Flowers', cost: 5, currency: 'stars', meshType: 'flower', color: '#FFD93D', scale: 0.8 },
  { id: 'flower-rose',      name: 'Rose',       category: 'Flowers', cost: 6, currency: 'stars', meshType: 'flower', color: '#FF6B6B', scale: 0.6 },
  { id: 'flower-tulip',     name: 'Tulip',      category: 'Flowers', cost: 4, currency: 'stars', meshType: 'flower', color: '#E040FB', scale: 0.6 },

  // ─── Buildings (Stars) ─────────────────────────────────────────────────────
  { id: 'build-treehouse',  name: 'Treehouse',   category: 'Buildings', cost: 30, currency: 'stars', meshType: 'building-house', color: '#8D6E63', scale: 1.2 },
  { id: 'build-windmill',   name: 'Windmill',    category: 'Buildings', cost: 25, currency: 'stars', meshType: 'building-tower', color: '#ECEFF1', scale: 1.5 },
  { id: 'build-lighthouse', name: 'Lighthouse',  category: 'Buildings', cost: 35, currency: 'stars', meshType: 'building-tower', color: '#FF6B6B', scale: 1.8 },
  { id: 'build-castle',     name: 'Castle',      category: 'Buildings', cost: 50, currency: 'stars', meshType: 'building-castle', color: '#B39DDB', scale: 2 },

  // ─── Fun Animals (Stars) ───────────────────────────────────────────────────
  { id: 'pet-cat',     name: 'Cat',      category: 'Animals', cost: 15, currency: 'stars', meshType: 'pet-round',  color: '#FF8A65', scale: 0.5 },
  { id: 'pet-dog',     name: 'Dog',      category: 'Animals', cost: 15, currency: 'stars', meshType: 'pet-round',  color: '#A1887F', scale: 0.6 },
  { id: 'pet-bunny',   name: 'Bunny',    category: 'Animals', cost: 20, currency: 'stars', meshType: 'pet-round',  color: '#F8BBD0', scale: 0.5 },
  { id: 'pet-duck',    name: 'Duckling', category: 'Animals', cost: 18, currency: 'stars', meshType: 'pet-round',  color: '#FFF176', scale: 0.4 },

  // ─── Fun Items (Stars) ────────────────────────────────────────────────────
  { id: 'fun-trampoline', name: 'Trampoline', category: 'Fun', cost: 10, currency: 'stars', meshType: 'fun-disc',    color: '#42A5F5', scale: 1 },
  { id: 'fun-slide',      name: 'Slide',      category: 'Fun', cost: 15, currency: 'stars', meshType: 'fun-ramp',    color: '#FF7043', scale: 1.2 },
  { id: 'fun-swing',      name: 'Swing',      category: 'Fun', cost: 12, currency: 'stars', meshType: 'fun-arch',    color: '#FFD93D', scale: 1 },
  { id: 'fun-fountain',   name: 'Fountain',   category: 'Fun', cost: 20, currency: 'stars', meshType: 'fun-fountain', color: '#4DD0E1', scale: 1 },

  // ─── Vehicles (Gems) ──────────────────────────────────────────────────────
  { id: 'vehicle-boat',  name: 'Boat',       category: 'Vehicles', cost: 25, currency: 'gems', meshType: 'vehicle-boat',  color: '#4FC3F7', scale: 1 },
  { id: 'vehicle-heli',  name: 'Helicopter', category: 'Vehicles', cost: 35, currency: 'gems', meshType: 'vehicle-heli',  color: '#EF5350', scale: 1 },
  { id: 'vehicle-train', name: 'Train',      category: 'Vehicles', cost: 40, currency: 'gems', meshType: 'vehicle-train', color: '#66BB6A', scale: 1.2 },

  // ─── Magic (Gems) ─────────────────────────────────────────────────────────
  { id: 'magic-rainbow',  name: 'Rainbow',       category: 'Magic', cost: 15, currency: 'gems', meshType: 'magic-arch',    color: '#FF6B6B', scale: 2 },
  { id: 'magic-star',     name: 'Shooting Star', category: 'Magic', cost: 20, currency: 'gems', meshType: 'magic-star',    color: '#FFD93D', scale: 1 },
  { id: 'magic-lights',   name: 'Fairy Lights',  category: 'Magic', cost: 18, currency: 'gems', meshType: 'magic-sparkle', color: '#CE93D8', scale: 1.5 },
];

export const DECORATION_CATEGORIES: DecorationCategory[] = [
  'Trees', 'Flowers', 'Buildings', 'Animals', 'Fun', 'Vehicles', 'Magic',
];

export const CATEGORY_ICONS: Record<DecorationCategory, string> = {
  Trees: '\uD83C\uDF33',
  Flowers: '\uD83C\uDF38',
  Buildings: '\uD83C\uDFE0',
  Animals: '\uD83D\uDC3E',
  Fun: '\uD83C\uDFA0',
  Vehicles: '\uD83D\uDE97',
  Magic: '\u2728',
};

export function getDecorationById(id: string): DecorationItem | undefined {
  return DECORATION_ITEMS.find((item) => item.id === id);
}

export function getDecorationsByCategory(category: DecorationCategory): DecorationItem[] {
  return DECORATION_ITEMS.filter((item) => item.category === category);
}
