import type {
  StationItemDefinition,
  FoodType,
  HabitatFeature,
} from "../types/station";

export const GRID_ROWS = 6;
export const GRID_COLS = 8;
export const SESSION_BUDGET = 10;

export const FOOD_ITEMS: readonly StationItemDefinition[] = [
  {
    type: "nectar_feeder" as FoodType,
    name: "Nectar Feeder",
    emoji: "🍯",
    description:
      "Attracts honeyeaters, lorikeets, and other nectar-loving birds",
    category: "food",
  },
  {
    type: "seed_tray" as FoodType,
    name: "Seed Tray",
    emoji: "🌾",
    description: "Draws parrots, cockatoos, finches, and pigeons",
    category: "food",
  },
  {
    type: "fruit_dish" as FoodType,
    name: "Fruit Dish",
    emoji: "🍎",
    description: "Tempts bowerbirds, king parrots, and fruit-eaters",
    category: "food",
  },
  {
    type: "mealworms" as FoodType,
    name: "Mealworms",
    emoji: "🐛",
    description: "Irresistible to kookaburras, magpies, and insectivores",
    category: "food",
  },
  {
    type: "bird_bath" as FoodType,
    name: "Bird Bath",
    emoji: "💧",
    description: "Essential water source — attracts almost everyone",
    category: "food",
  },
  {
    type: "fish_pond" as FoodType,
    name: "Fish Pond",
    emoji: "🐟",
    description: "Draws kingfishers, sea eagles, and pelicans",
    category: "food",
  },
] as const;

export const HABITAT_ITEMS: readonly StationItemDefinition[] = [
  {
    type: "dense_shrub" as HabitatFeature,
    name: "Dense Shrub",
    emoji: "🌿",
    description: "Cover for shy birds — fairy-wrens and spinebills need this",
    category: "habitat",
  },
  {
    type: "eucalyptus_tree" as HabitatFeature,
    name: "Eucalyptus Tree",
    emoji: "🌲",
    description:
      "Perching and nesting — essential for kookaburras and cockatoos",
    category: "habitat",
  },
  {
    type: "dead_log" as HabitatFeature,
    name: "Dead Log",
    emoji: "🪵",
    description: "Insects hide here — attracts lyrebirds and treecreepers",
    category: "habitat",
  },
  {
    type: "rocks" as HabitatFeature,
    name: "Rocks",
    emoji: "🪨",
    description:
      "Basking spots for lizards, which attract raptors and kookaburras",
    category: "habitat",
  },
] as const;

export const ALL_STATION_ITEMS: readonly StationItemDefinition[] = [
  ...FOOD_ITEMS,
  ...HABITAT_ITEMS,
] as const;

export function getItemDefinition(type: string): StationItemDefinition {
  const def = ALL_STATION_ITEMS.find((i) => i.type === type);
  if (!def) throw new Error(`Unknown item type: ${type}`);
  return def;
}
