export type FoodType =
  | "nectar_feeder"
  | "seed_tray"
  | "fruit_dish"
  | "mealworms"
  | "bird_bath"
  | "fish_pond";

export type HabitatFeature =
  | "dense_shrub"
  | "eucalyptus_tree"
  | "dead_log"
  | "rocks";

export type StationItemType = FoodType | HabitatFeature;

export type TimePhase = "dawn" | "morning" | "afternoon" | "dusk" | "night";

export type BirdSize = "tiny" | "small" | "medium" | "large" | "huge";

export type Temperament = "shy" | "cautious" | "bold" | "aggressive";

export type VisitorStatus =
  | "approaching"
  | "eating"
  | "bathing"
  | "watching"
  | "fleeing"
  | "chasing"
  | "idle";

export interface GridPosition {
  readonly row: number;
  readonly col: number;
}

export interface PlacedItem {
  readonly id: string;
  readonly type: StationItemType;
  readonly position: GridPosition;
}

export interface StationGrid {
  readonly rows: number;
  readonly cols: number;
  readonly items: readonly PlacedItem[];
}

export interface StationItemDefinition {
  readonly type: StationItemType;
  readonly name: string;
  readonly emoji: string;
  readonly description: string;
  readonly category: "food" | "habitat";
}

export interface PhaseDefinition {
  readonly phase: TimePhase;
  readonly label: string;
  readonly emoji: string;
  readonly description: string;
  readonly gradientFrom: string;
  readonly gradientTo: string;
}

export interface BirdBehavior {
  readonly id: string;
  readonly foodPreferences: readonly FoodType[];
  readonly requiredHabitat: readonly HabitatFeature[];
  readonly activePhases: readonly TimePhase[];
  readonly size: BirdSize;
  readonly temperament: Temperament;
  readonly flocking: boolean;
  readonly scaredBy: readonly string[];
  readonly chases: readonly string[];
  readonly attractedBy: readonly string[];
}

export interface BirdVisit {
  readonly birdId: string;
  readonly status: VisitorStatus;
  readonly position: GridPosition;
  readonly targetItemId: string | null;
  readonly arrivedAtPhase: TimePhase;
}

export interface SessionStats {
  readonly speciesSeen: readonly string[];
  readonly newDiscoveries: readonly string[];
  readonly totalVisitors: number;
  readonly phasesPlayed: number;
  readonly itemsPlaced: number;
}

export type StationScreen =
  | "station-title"
  | "station-playing"
  | "station-info"
  | "station-summary";
