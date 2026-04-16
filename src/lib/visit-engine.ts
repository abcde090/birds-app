import type {
  BirdBehavior,
  BirdVisit,
  PlacedItem,
  FoodType,
  HabitatFeature,
} from "../types/station";

interface VisitContext {
  readonly placedItems: readonly PlacedItem[];
  readonly behaviors: readonly BirdBehavior[];
  readonly currentVisitors: readonly BirdVisit[];
  readonly seed: number;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function hashString(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function getPlacedHabitatFeatures(
  items: readonly PlacedItem[],
): readonly HabitatFeature[] {
  const habitatTypes: HabitatFeature[] = [
    "dense_shrub",
    "eucalyptus_tree",
    "dead_log",
    "rocks",
  ];
  return items
    .filter((item) => habitatTypes.includes(item.type as HabitatFeature))
    .map((item) => item.type as HabitatFeature);
}

function hasShrubNearFood(
  items: readonly PlacedItem[],
  maxDistance: number,
): boolean {
  const shrubs = items.filter((i) => i.type === "dense_shrub");
  const foodTypes: readonly string[] = [
    "nectar_feeder",
    "seed_tray",
    "fruit_dish",
    "mealworms",
    "bird_bath",
    "fish_pond",
    "junk_food",
  ];
  const foods = items.filter((i) => foodTypes.includes(i.type));

  return shrubs.some((shrub) =>
    foods.some(
      (food) =>
        Math.abs(shrub.position.row - food.position.row) <= maxDistance &&
        Math.abs(shrub.position.col - food.position.col) <= maxDistance,
    ),
  );
}

const FOOD_TYPES: readonly FoodType[] = [
  "nectar_feeder",
  "seed_tray",
  "fruit_dish",
  "mealworms",
  "bird_bath",
  "fish_pond",
  "junk_food",
];

/**
 * Evaluate which birds visit which food sources.
 * Each food item independently attracts birds that prefer it.
 * Flocking birds appear as multiple visitors at the same source.
 */
export function evaluateVisitors(context: VisitContext): readonly BirdVisit[] {
  const { placedItems, behaviors } = context;

  const foodItems = placedItems.filter((item) =>
    FOOD_TYPES.includes(item.type as FoodType),
  );
  if (foodItems.length === 0) return [];

  const placedHabitat = getPlacedHabitatFeatures(placedItems);
  const visits: BirdVisit[] = [];

  // For each food item, determine which birds visit IT specifically
  for (const food of foodItems) {
    const foodType = food.type as FoodType;

    for (let b = 0; b < behaviors.length; b++) {
      const bird = behaviors[b];

      // Does this bird like this food?
      if (!bird.foodPreferences.includes(foodType)) continue;

      // Does this bird have its required habitat?
      const hasHabitat = bird.requiredHabitat.every((habitat) =>
        placedHabitat.includes(habitat),
      );
      if (!hasHabitat) continue;

      // Shy birds need shrub cover near any food
      if (bird.temperament === "shy") {
        if (!hasShrubNearFood(placedItems, 2)) continue;
      }

      // Base visit chance by temperament
      let visitChance = 0.5;
      if (bird.temperament === "bold" || bird.temperament === "aggressive") {
        visitChance = 0.75;
      } else if (bird.temperament === "cautious") {
        visitChance = 0.55;
      } else if (bird.temperament === "shy") {
        visitChance = 0.35;
      }

      // Deterministic per food item — same food always attracts same birds
      const itemSeed = hashString(food.id);
      const roll = seededRandom(itemSeed + b * 137);
      if (roll > visitChance) continue;

      // How many of this bird appear? Flocking species bring friends.
      const flockSize = bird.flocking
        ? 2 + Math.floor(seededRandom(itemSeed + b * 53) * 2) // 2-3
        : 1;

      for (let n = 0; n < flockSize; n++) {
        visits.push({
          visitId: `${food.id}-${bird.id}-${n}`,
          birdId: bird.id,
          status: "eating",
          position: food.position,
          targetItemId: food.id,
        });
      }
    }
  }

  return visits;
}
