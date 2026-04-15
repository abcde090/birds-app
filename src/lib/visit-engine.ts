import type {
  BirdBehavior,
  BirdVisit,
  PlacedItem,
  TimePhase,
  GridPosition,
  FoodType,
  HabitatFeature,
} from "../types/station";

interface VisitContext {
  readonly placedItems: readonly PlacedItem[];
  readonly currentPhase: TimePhase;
  readonly behaviors: readonly BirdBehavior[];
  readonly currentVisitors: readonly BirdVisit[];
  readonly seed: number;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getPlacedFoodTypes(items: readonly PlacedItem[]): readonly FoodType[] {
  const foodTypes: FoodType[] = [
    "nectar_feeder",
    "seed_tray",
    "fruit_dish",
    "mealworms",
    "bird_bath",
    "fish_pond",
  ];
  return items
    .filter((item) => foodTypes.includes(item.type as FoodType))
    .map((item) => item.type as FoodType);
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

function findFoodPosition(
  items: readonly PlacedItem[],
  preferences: readonly FoodType[],
): { position: GridPosition; itemId: string } | null {
  for (const pref of preferences) {
    const item = items.find((i) => i.type === pref);
    if (item) {
      return { position: item.position, itemId: item.id };
    }
  }
  return null;
}

export function evaluateVisitors(context: VisitContext): readonly BirdVisit[] {
  const { placedItems, currentPhase, behaviors, currentVisitors, seed } =
    context;

  const placedFood = getPlacedFoodTypes(placedItems);
  const placedHabitat = getPlacedHabitatFeatures(placedItems);
  const currentVisitorIds = currentVisitors.map((v) => v.birdId);
  const visits: BirdVisit[] = [];

  for (let i = 0; i < behaviors.length; i++) {
    const bird = behaviors[i];

    // Step 1: Check if any preferred food is placed
    const hasFood = bird.foodPreferences.some((food) =>
      placedFood.includes(food),
    );
    if (!hasFood) continue;

    // Step 2: Check if required habitat features are present
    const hasHabitat = bird.requiredHabitat.every((habitat) =>
      placedHabitat.includes(habitat),
    );
    if (!hasHabitat) continue;

    // Step 3: Check if this phase is active
    const isActivePhase = bird.activePhases.includes(currentPhase);
    if (!isActivePhase) continue;

    // Step 4: Check if any scaredBy birds are currently visiting
    const scaredByPresent = bird.scaredBy.some(
      (scaryId) =>
        currentVisitorIds.includes(scaryId) ||
        visits.some((v) => v.birdId === scaryId && v.status !== "fleeing"),
    );
    if (scaredByPresent) {
      const foodTarget = findFoodPosition(placedItems, bird.foodPreferences);
      visits.push({
        birdId: bird.id,
        status: "watching",
        position: foodTarget?.position ?? { row: 0, col: 0 },
        targetItemId: null,
        arrivedAtPhase: currentPhase,
      });
      continue;
    }

    // Step 5: Check if attractedBy birds boost chance
    const attractedBoost = bird.attractedBy.some(
      (attractId) =>
        currentVisitorIds.includes(attractId) ||
        visits.some((v) => v.birdId === attractId),
    );

    // Step 6: If shy, check shrub cover near food
    if (bird.temperament === "shy") {
      if (!hasShrubNearFood(placedItems, 2)) continue;
    }

    // Step 7: Weighted random roll
    let visitChance = 0.5;
    if (bird.temperament === "bold" || bird.temperament === "aggressive") {
      visitChance = 0.75;
    } else if (bird.temperament === "cautious") {
      visitChance = 0.55;
    } else if (bird.temperament === "shy") {
      visitChance = 0.35;
    }

    if (attractedBoost) {
      visitChance = Math.min(visitChance + 0.3, 0.95);
    }

    const roll = seededRandom(seed + i * 137);
    if (roll > visitChance) continue;

    const foodTarget = findFoodPosition(placedItems, bird.foodPreferences);
    if (!foodTarget) continue;

    visits.push({
      birdId: bird.id,
      status: "eating",
      position: foodTarget.position,
      targetItemId: foodTarget.itemId,
      arrivedAtPhase: currentPhase,
    });
  }

  return visits;
}
