import type {
  StationItemDefinition,
  PhaseDefinition,
  TimePhase,
  FoodType,
  HabitatFeature,
} from "../types/station";

export const GRID_ROWS = 6;
export const GRID_COLS = 8;
export const SESSION_BUDGET = 10;
export const MAX_VISITORS_PER_PHASE = 12;

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

export const PHASE_DEFINITIONS: readonly PhaseDefinition[] = [
  {
    phase: "dawn",
    label: "Dawn",
    emoji: "🌅",
    description: "Early risers — songbirds and honeyeaters are most active",
    gradientFrom: "#fde68a",
    gradientTo: "#f59e0b",
  },
  {
    phase: "morning",
    label: "Morning",
    emoji: "☀️",
    description:
      "Peak activity — parrots and cockatoos arrive, territorial conflicts begin",
    gradientFrom: "#7dd3fc",
    gradientTo: "#bae6fd",
  },
  {
    phase: "afternoon",
    label: "Afternoon",
    emoji: "🌤️",
    description:
      "Quieter period — raptors soar overhead, watchers keep their distance",
    gradientFrom: "#fbbf24",
    gradientTo: "#f97316",
  },
  {
    phase: "dusk",
    label: "Dusk",
    emoji: "🌆",
    description: "Last visitors — kookaburras call, eagles hunt before dark",
    gradientFrom: "#ea580c",
    gradientTo: "#dc2626",
  },
  {
    phase: "night",
    label: "Night",
    emoji: "🌙",
    description:
      "Nocturnal shift — owls, frogmouths emerge. All day birds gone",
    gradientFrom: "#1e293b",
    gradientTo: "#0f172a",
  },
] as const;

export const PHASE_ORDER: readonly TimePhase[] = [
  "dawn",
  "morning",
  "afternoon",
  "dusk",
  "night",
] as const;

export function getNextPhase(current: TimePhase): TimePhase | null {
  const index = PHASE_ORDER.indexOf(current);
  if (index === -1 || index === PHASE_ORDER.length - 1) return null;
  return PHASE_ORDER[index + 1];
}

export function getPhaseDefinition(phase: TimePhase): PhaseDefinition {
  const def = PHASE_DEFINITIONS.find((p) => p.phase === phase);
  if (!def) throw new Error(`Unknown phase: ${phase}`);
  return def;
}

export function getItemDefinition(type: string): StationItemDefinition {
  const def = ALL_STATION_ITEMS.find((i) => i.type === type);
  if (!def) throw new Error(`Unknown item type: ${type}`);
  return def;
}
