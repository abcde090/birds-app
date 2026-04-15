# Feeding Station -- Implementation Plan

> **For agentic workers:** Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a strategic puzzle game where players place food, water, and vegetation on a grid to attract 40 real Australian bird species, each with unique behavior profiles governing when and why they visit.

**Architecture:** Single-page app extending the existing Bird Catcher codebase. A new Zustand-driven screen state (`station-title | station-playing | station-info | station-summary`) manages the Feeding Station flow. The visit engine is a pure deterministic function: `(gridState, currentPhase, behaviorData) => BirdVisit[]`. Bird-to-bird interactions are computed as a second pass. No real-time game loop -- visitors recalculate when the player changes items or advances the time phase.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS v4, Zustand

**Spec:** `docs/superpowers/specs/2026-04-16-feeding-station-design.md`

---

## File Map

### New files

| File | Responsibility |
|------|---------------|
| `src/types/station.ts` | Station game types: grid, items, phases, visits, behaviors |
| `src/lib/station-config.ts` | Grid size, item definitions, phase config, budget |
| `public/data/bird-behaviors.json` | Behavior profiles for all 40 species |
| `src/lib/visit-engine.ts` | Core logic: evaluate station state to determine visitors |
| `src/lib/interaction-engine.ts` | Bird-to-bird interactions: chasing, fleeing, flocking |
| `src/stores/useStationStore.ts` | Grid state, placed items, current phase, budget |
| `src/stores/useVisitorStore.ts` | Current visitors, behavior states, discoveries |
| `src/hooks/useStationLoop.ts` | Evaluate visitors on phase change or item placement |
| `src/hooks/useDragDrop.ts` | HTML5 drag and drop for grid placement |
| `src/components/station/StationCanvas.tsx` | Main game grid with placed items and visitors |
| `src/components/station/GridCell.tsx` | Individual droppable grid cell |
| `src/components/station/PlacedItem.tsx` | Rendered food/vegetation on grid |
| `src/components/station/Toolbar.tsx` | Draggable items palette |
| `src/components/station/ToolbarItem.tsx` | Individual draggable item |
| `src/components/station/VisitorBird.tsx` | Bird on canvas with behavior animation |
| `src/components/station/StationTitle.tsx` | Title screen for feeding station |
| `src/components/station/TimeControl.tsx` | Phase indicator + advance button |
| `src/components/station/VisitorList.tsx` | Side panel showing current visitors |
| `src/components/station/BirdInfoCard.tsx` | New species discovery card |
| `src/components/station/SessionSummary.tsx` | End of session stats |

### Modified files

| File | Change |
|------|--------|
| `src/App.tsx` | Add station screens to the switch statement |
| `src/index.css` | Add station-specific keyframes (bird hop, bird flee) |

### Existing files (reused as-is)

| File | Used by |
|------|---------|
| `src/stores/useBirdStore.ts` | VisitorBird, BirdInfoCard, visit-engine |
| `src/stores/useCollectionStore.ts` | Shared collection persistence |
| `src/types/bird.ts` | All station code |
| `src/lib/constants.ts` | BirdInfoCard labels/colors |
| `src/components/birds/ConservationBadge.tsx` | BirdInfoCard |
| `src/components/birds/HabitatTag.tsx` | BirdInfoCard |

---

## Task 1: Game Types

**Files:**
- Create: `src/types/station.ts`

- [ ] **Step 1: Create `src/types/station.ts` with all station game types**

```ts
export type FoodType =
  | 'nectar_feeder'
  | 'seed_tray'
  | 'fruit_dish'
  | 'mealworms'
  | 'bird_bath'
  | 'fish_pond';

export type HabitatFeature =
  | 'dense_shrub'
  | 'eucalyptus_tree'
  | 'dead_log'
  | 'rocks';

export type StationItemType = FoodType | HabitatFeature;

export type TimePhase = 'dawn' | 'morning' | 'afternoon' | 'dusk' | 'night';

export type BirdSize = 'tiny' | 'small' | 'medium' | 'large' | 'huge';

export type Temperament = 'shy' | 'cautious' | 'bold' | 'aggressive';

export type VisitorStatus =
  | 'approaching'
  | 'eating'
  | 'bathing'
  | 'watching'
  | 'fleeing'
  | 'chasing'
  | 'idle';

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
  readonly category: 'food' | 'habitat';
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
  | 'station-title'
  | 'station-playing'
  | 'station-info'
  | 'station-summary';
```

- [ ] **Step 2: Verify types compile**

```bash
cd /Users/dan/projects/birds-app && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
cd /Users/dan/projects/birds-app && git add src/types/station.ts && git commit -m "feat(station): add game types for feeding station"
```

---

## Task 2: Station Config

**Files:**
- Create: `src/lib/station-config.ts`

- [ ] **Step 1: Create `src/lib/station-config.ts` with grid, item, and phase definitions**

```ts
import type {
  StationItemDefinition,
  PhaseDefinition,
  TimePhase,
  FoodType,
  HabitatFeature,
} from '../types/station';

export const GRID_ROWS = 6;
export const GRID_COLS = 8;
export const SESSION_BUDGET = 10;
export const MAX_VISITORS_PER_PHASE = 12;

export const FOOD_ITEMS: readonly StationItemDefinition[] = [
  {
    type: 'nectar_feeder' as FoodType,
    name: 'Nectar Feeder',
    emoji: '🍯',
    description: 'Attracts honeyeaters, lorikeets, and other nectar-loving birds',
    category: 'food',
  },
  {
    type: 'seed_tray' as FoodType,
    name: 'Seed Tray',
    emoji: '🌾',
    description: 'Draws parrots, cockatoos, finches, and pigeons',
    category: 'food',
  },
  {
    type: 'fruit_dish' as FoodType,
    name: 'Fruit Dish',
    emoji: '🍎',
    description: 'Tempts bowerbirds, king parrots, and fruit-eaters',
    category: 'food',
  },
  {
    type: 'mealworms' as FoodType,
    name: 'Mealworms',
    emoji: '🐛',
    description: 'Irresistible to kookaburras, magpies, and insectivores',
    category: 'food',
  },
  {
    type: 'bird_bath' as FoodType,
    name: 'Bird Bath',
    emoji: '💧',
    description: 'Essential water source — attracts almost everyone',
    category: 'food',
  },
  {
    type: 'fish_pond' as FoodType,
    name: 'Fish Pond',
    emoji: '🐟',
    description: 'Draws kingfishers, sea eagles, and pelicans',
    category: 'food',
  },
] as const;

export const HABITAT_ITEMS: readonly StationItemDefinition[] = [
  {
    type: 'dense_shrub' as HabitatFeature,
    name: 'Dense Shrub',
    emoji: '🌿',
    description: 'Cover for shy birds — fairy-wrens and spinebills need this',
    category: 'habitat',
  },
  {
    type: 'eucalyptus_tree' as HabitatFeature,
    name: 'Eucalyptus Tree',
    emoji: '🌲',
    description: 'Perching and nesting — essential for kookaburras and cockatoos',
    category: 'habitat',
  },
  {
    type: 'dead_log' as HabitatFeature,
    name: 'Dead Log',
    emoji: '🪵',
    description: 'Insects hide here — attracts lyrebirds and treecreepers',
    category: 'habitat',
  },
  {
    type: 'rocks' as HabitatFeature,
    name: 'Rocks',
    emoji: '🪨',
    description: 'Basking spots for lizards, which attract raptors and kookaburras',
    category: 'habitat',
  },
] as const;

export const ALL_STATION_ITEMS: readonly StationItemDefinition[] = [
  ...FOOD_ITEMS,
  ...HABITAT_ITEMS,
] as const;

export const PHASE_DEFINITIONS: readonly PhaseDefinition[] = [
  {
    phase: 'dawn',
    label: 'Dawn',
    emoji: '🌅',
    description: 'Early risers — songbirds and honeyeaters are most active',
    gradientFrom: '#fde68a',
    gradientTo: '#f59e0b',
  },
  {
    phase: 'morning',
    label: 'Morning',
    emoji: '☀️',
    description: 'Peak activity — parrots and cockatoos arrive, territorial conflicts begin',
    gradientFrom: '#7dd3fc',
    gradientTo: '#bae6fd',
  },
  {
    phase: 'afternoon',
    label: 'Afternoon',
    emoji: '🌤️',
    description: 'Quieter period — raptors soar overhead, watchers keep their distance',
    gradientFrom: '#fbbf24',
    gradientTo: '#f97316',
  },
  {
    phase: 'dusk',
    label: 'Dusk',
    emoji: '🌆',
    description: 'Last visitors — kookaburras call, eagles hunt before dark',
    gradientFrom: '#ea580c',
    gradientTo: '#dc2626',
  },
  {
    phase: 'night',
    label: 'Night',
    emoji: '🌙',
    description: 'Nocturnal shift — owls, frogmouths emerge. All day birds gone',
    gradientFrom: '#1e293b',
    gradientTo: '#0f172a',
  },
] as const;

export const PHASE_ORDER: readonly TimePhase[] = [
  'dawn',
  'morning',
  'afternoon',
  'dusk',
  'night',
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
```

- [ ] **Step 2: Verify compile**

```bash
cd /Users/dan/projects/birds-app && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
cd /Users/dan/projects/birds-app && git add src/lib/station-config.ts && git commit -m "feat(station): add station config with grid, items, and phase definitions"
```

---

## Task 3: Bird Behaviors Data

**Files:**
- Create: `public/data/bird-behaviors.json`

- [ ] **Step 1: Create `public/data/bird-behaviors.json` with real behavior profiles for all 40 species**

All food preferences, habitat requirements, active phases, temperaments, and interactions below are based on real Australian ornithological data.

```json
{
  "emu": {
    "foodPreferences": ["seed_tray", "fruit_dish"],
    "requiredHabitat": [],
    "activePhases": ["dawn", "morning", "afternoon"],
    "size": "huge",
    "temperament": "bold",
    "flocking": false,
    "scaredBy": ["wedge-tailed-eagle"],
    "chases": [],
    "attractedBy": []
  },
  "southern-cassowary": {
    "foodPreferences": ["fruit_dish"],
    "requiredHabitat": ["dense_shrub"],
    "activePhases": ["dawn", "morning"],
    "size": "huge",
    "temperament": "aggressive",
    "flocking": false,
    "scaredBy": [],
    "chases": ["australian-brush-turkey", "australian-magpie"],
    "attractedBy": []
  },
  "laughing-kookaburra": {
    "foodPreferences": ["mealworms", "fish_pond"],
    "requiredHabitat": ["eucalyptus_tree"],
    "activePhases": ["dawn", "morning", "dusk"],
    "size": "medium",
    "temperament": "bold",
    "flocking": false,
    "scaredBy": ["wedge-tailed-eagle", "powerful-owl"],
    "chases": ["noisy-miner", "willie-wagtail"],
    "attractedBy": []
  },
  "rainbow-lorikeet": {
    "foodPreferences": ["nectar_feeder", "fruit_dish"],
    "requiredHabitat": ["eucalyptus_tree"],
    "activePhases": ["dawn", "morning", "afternoon"],
    "size": "small",
    "temperament": "bold",
    "flocking": true,
    "scaredBy": ["peregrine-falcon", "nankeen-kestrel"],
    "chases": ["new-holland-honeyeater", "eastern-spinebill"],
    "attractedBy": []
  },
  "sulphur-crested-cockatoo": {
    "foodPreferences": ["seed_tray", "fruit_dish"],
    "requiredHabitat": ["eucalyptus_tree"],
    "activePhases": ["morning", "afternoon"],
    "size": "large",
    "temperament": "aggressive",
    "flocking": true,
    "scaredBy": ["wedge-tailed-eagle"],
    "chases": ["crimson-rosella", "king-parrot", "galah"],
    "attractedBy": []
  },
  "galah": {
    "foodPreferences": ["seed_tray"],
    "requiredHabitat": [],
    "activePhases": ["dawn", "morning", "afternoon"],
    "size": "medium",
    "temperament": "bold",
    "flocking": true,
    "scaredBy": ["wedge-tailed-eagle", "peregrine-falcon", "sulphur-crested-cockatoo"],
    "chases": [],
    "attractedBy": []
  },
  "budgerigar": {
    "foodPreferences": ["seed_tray"],
    "requiredHabitat": [],
    "activePhases": ["dawn", "morning", "afternoon"],
    "size": "tiny",
    "temperament": "cautious",
    "flocking": true,
    "scaredBy": ["nankeen-kestrel", "peregrine-falcon", "noisy-miner", "laughing-kookaburra"],
    "chases": [],
    "attractedBy": ["cockatiel"]
  },
  "cockatiel": {
    "foodPreferences": ["seed_tray"],
    "requiredHabitat": [],
    "activePhases": ["dawn", "morning", "afternoon"],
    "size": "small",
    "temperament": "cautious",
    "flocking": true,
    "scaredBy": ["nankeen-kestrel", "peregrine-falcon", "sulphur-crested-cockatoo"],
    "chases": [],
    "attractedBy": ["budgerigar"]
  },
  "king-parrot": {
    "foodPreferences": ["fruit_dish", "seed_tray"],
    "requiredHabitat": ["eucalyptus_tree"],
    "activePhases": ["dawn", "morning"],
    "size": "medium",
    "temperament": "cautious",
    "flocking": false,
    "scaredBy": ["sulphur-crested-cockatoo", "noisy-miner"],
    "chases": [],
    "attractedBy": ["crimson-rosella"]
  },
  "crimson-rosella": {
    "foodPreferences": ["seed_tray", "fruit_dish", "nectar_feeder"],
    "requiredHabitat": ["eucalyptus_tree"],
    "activePhases": ["dawn", "morning", "afternoon"],
    "size": "medium",
    "temperament": "cautious",
    "flocking": false,
    "scaredBy": ["sulphur-crested-cockatoo", "noisy-miner"],
    "chases": [],
    "attractedBy": ["king-parrot"]
  },
  "major-mitchells-cockatoo": {
    "foodPreferences": ["seed_tray"],
    "requiredHabitat": ["eucalyptus_tree"],
    "activePhases": ["dawn", "morning"],
    "size": "medium",
    "temperament": "shy",
    "flocking": false,
    "scaredBy": ["sulphur-crested-cockatoo", "galah", "noisy-miner"],
    "chases": [],
    "attractedBy": []
  },
  "palm-cockatoo": {
    "foodPreferences": ["seed_tray", "fruit_dish"],
    "requiredHabitat": ["eucalyptus_tree", "dead_log"],
    "activePhases": ["dawn", "morning"],
    "size": "large",
    "temperament": "cautious",
    "flocking": false,
    "scaredBy": ["wedge-tailed-eagle"],
    "chases": [],
    "attractedBy": []
  },
  "wedge-tailed-eagle": {
    "foodPreferences": ["mealworms"],
    "requiredHabitat": ["rocks"],
    "activePhases": ["morning", "afternoon", "dusk"],
    "size": "huge",
    "temperament": "aggressive",
    "flocking": false,
    "scaredBy": [],
    "chases": ["laughing-kookaburra", "galah", "australian-magpie", "rainbow-lorikeet"],
    "attractedBy": []
  },
  "peregrine-falcon": {
    "foodPreferences": ["mealworms"],
    "requiredHabitat": ["rocks"],
    "activePhases": ["morning", "afternoon"],
    "size": "medium",
    "temperament": "aggressive",
    "flocking": false,
    "scaredBy": ["wedge-tailed-eagle"],
    "chases": ["rainbow-lorikeet", "budgerigar", "cockatiel", "willie-wagtail"],
    "attractedBy": []
  },
  "powerful-owl": {
    "foodPreferences": ["mealworms"],
    "requiredHabitat": ["eucalyptus_tree"],
    "activePhases": ["night"],
    "size": "large",
    "temperament": "bold",
    "flocking": false,
    "scaredBy": [],
    "chases": ["tawny-frogmouth"],
    "attractedBy": []
  },
  "nankeen-kestrel": {
    "foodPreferences": ["mealworms"],
    "requiredHabitat": ["rocks"],
    "activePhases": ["morning", "afternoon"],
    "size": "small",
    "temperament": "bold",
    "flocking": false,
    "scaredBy": ["wedge-tailed-eagle", "peregrine-falcon"],
    "chases": ["budgerigar", "superb-fairy-wren", "splendid-fairy-wren"],
    "attractedBy": []
  },
  "white-bellied-sea-eagle": {
    "foodPreferences": ["fish_pond"],
    "requiredHabitat": ["eucalyptus_tree"],
    "activePhases": ["morning", "afternoon", "dusk"],
    "size": "huge",
    "temperament": "bold",
    "flocking": false,
    "scaredBy": [],
    "chases": ["australian-pelican", "black-swan"],
    "attractedBy": []
  },
  "black-swan": {
    "foodPreferences": ["bird_bath", "fish_pond"],
    "requiredHabitat": [],
    "activePhases": ["dawn", "morning", "afternoon"],
    "size": "huge",
    "temperament": "cautious",
    "flocking": false,
    "scaredBy": ["wedge-tailed-eagle", "white-bellied-sea-eagle"],
    "chases": [],
    "attractedBy": []
  },
  "australian-pelican": {
    "foodPreferences": ["fish_pond"],
    "requiredHabitat": [],
    "activePhases": ["morning", "afternoon"],
    "size": "huge",
    "temperament": "bold",
    "flocking": false,
    "scaredBy": ["white-bellied-sea-eagle"],
    "chases": [],
    "attractedBy": []
  },
  "brolga": {
    "foodPreferences": ["mealworms", "seed_tray", "bird_bath"],
    "requiredHabitat": [],
    "activePhases": ["dawn", "morning"],
    "size": "huge",
    "temperament": "cautious",
    "flocking": false,
    "scaredBy": ["wedge-tailed-eagle"],
    "chases": [],
    "attractedBy": []
  },
  "royal-spoonbill": {
    "foodPreferences": ["fish_pond", "bird_bath"],
    "requiredHabitat": [],
    "activePhases": ["dawn", "morning", "afternoon"],
    "size": "large",
    "temperament": "shy",
    "flocking": false,
    "scaredBy": ["wedge-tailed-eagle", "white-bellied-sea-eagle", "noisy-miner"],
    "chases": [],
    "attractedBy": []
  },
  "australian-wood-duck": {
    "foodPreferences": ["seed_tray", "bird_bath"],
    "requiredHabitat": ["eucalyptus_tree"],
    "activePhases": ["dawn", "morning", "afternoon"],
    "size": "medium",
    "temperament": "cautious",
    "flocking": true,
    "scaredBy": ["wedge-tailed-eagle", "peregrine-falcon"],
    "chases": [],
    "attractedBy": []
  },
  "superb-fairy-wren": {
    "foodPreferences": ["mealworms", "bird_bath"],
    "requiredHabitat": ["dense_shrub"],
    "activePhases": ["dawn", "morning"],
    "size": "tiny",
    "temperament": "shy",
    "flocking": true,
    "scaredBy": ["noisy-miner", "nankeen-kestrel", "laughing-kookaburra", "peregrine-falcon"],
    "chases": [],
    "attractedBy": ["splendid-fairy-wren"]
  },
  "australian-magpie": {
    "foodPreferences": ["mealworms", "seed_tray"],
    "requiredHabitat": [],
    "activePhases": ["dawn", "morning", "afternoon", "dusk"],
    "size": "medium",
    "temperament": "aggressive",
    "flocking": false,
    "scaredBy": ["wedge-tailed-eagle"],
    "chases": ["noisy-miner", "magpie-lark", "willie-wagtail"],
    "attractedBy": []
  },
  "magpie-lark": {
    "foodPreferences": ["mealworms", "bird_bath"],
    "requiredHabitat": [],
    "activePhases": ["dawn", "morning", "afternoon"],
    "size": "small",
    "temperament": "bold",
    "flocking": false,
    "scaredBy": ["australian-magpie", "noisy-miner"],
    "chases": ["willie-wagtail"],
    "attractedBy": []
  },
  "willie-wagtail": {
    "foodPreferences": ["mealworms"],
    "requiredHabitat": [],
    "activePhases": ["dawn", "morning", "afternoon"],
    "size": "tiny",
    "temperament": "bold",
    "flocking": false,
    "scaredBy": ["australian-magpie", "laughing-kookaburra"],
    "chases": [],
    "attractedBy": []
  },
  "splendid-fairy-wren": {
    "foodPreferences": ["mealworms", "bird_bath"],
    "requiredHabitat": ["dense_shrub"],
    "activePhases": ["dawn", "morning"],
    "size": "tiny",
    "temperament": "shy",
    "flocking": true,
    "scaredBy": ["noisy-miner", "nankeen-kestrel", "laughing-kookaburra"],
    "chases": [],
    "attractedBy": ["superb-fairy-wren"]
  },
  "satin-bowerbird": {
    "foodPreferences": ["fruit_dish"],
    "requiredHabitat": ["dense_shrub", "dead_log"],
    "activePhases": ["dawn", "morning"],
    "size": "medium",
    "temperament": "shy",
    "flocking": false,
    "scaredBy": ["sulphur-crested-cockatoo", "noisy-miner", "australian-magpie"],
    "chases": [],
    "attractedBy": []
  },
  "blue-winged-kookaburra": {
    "foodPreferences": ["mealworms", "fish_pond"],
    "requiredHabitat": ["eucalyptus_tree"],
    "activePhases": ["dawn", "morning", "dusk"],
    "size": "medium",
    "temperament": "bold",
    "flocking": false,
    "scaredBy": ["wedge-tailed-eagle"],
    "chases": ["noisy-miner"],
    "attractedBy": ["laughing-kookaburra"]
  },
  "sacred-kingfisher": {
    "foodPreferences": ["mealworms", "fish_pond"],
    "requiredHabitat": ["eucalyptus_tree"],
    "activePhases": ["dawn", "morning", "afternoon"],
    "size": "small",
    "temperament": "cautious",
    "flocking": false,
    "scaredBy": ["laughing-kookaburra", "noisy-miner"],
    "chases": [],
    "attractedBy": []
  },
  "azure-kingfisher": {
    "foodPreferences": ["fish_pond"],
    "requiredHabitat": ["dense_shrub"],
    "activePhases": ["dawn", "morning"],
    "size": "tiny",
    "temperament": "shy",
    "flocking": false,
    "scaredBy": ["laughing-kookaburra", "noisy-miner", "sacred-kingfisher"],
    "chases": [],
    "attractedBy": []
  },
  "noisy-miner": {
    "foodPreferences": ["nectar_feeder", "fruit_dish", "mealworms"],
    "requiredHabitat": ["eucalyptus_tree"],
    "activePhases": ["dawn", "morning", "afternoon", "dusk"],
    "size": "small",
    "temperament": "aggressive",
    "flocking": true,
    "scaredBy": ["wedge-tailed-eagle", "australian-magpie", "laughing-kookaburra"],
    "chases": ["superb-fairy-wren", "splendid-fairy-wren", "eastern-spinebill", "new-holland-honeyeater", "azure-kingfisher", "sacred-kingfisher"],
    "attractedBy": []
  },
  "new-holland-honeyeater": {
    "foodPreferences": ["nectar_feeder", "bird_bath"],
    "requiredHabitat": ["dense_shrub"],
    "activePhases": ["dawn", "morning", "afternoon"],
    "size": "tiny",
    "temperament": "cautious",
    "flocking": false,
    "scaredBy": ["noisy-miner", "red-wattlebird", "rainbow-lorikeet"],
    "chases": [],
    "attractedBy": ["eastern-spinebill"]
  },
  "eastern-spinebill": {
    "foodPreferences": ["nectar_feeder"],
    "requiredHabitat": ["dense_shrub"],
    "activePhases": ["dawn", "morning"],
    "size": "tiny",
    "temperament": "shy",
    "flocking": false,
    "scaredBy": ["noisy-miner", "red-wattlebird", "rainbow-lorikeet"],
    "chases": [],
    "attractedBy": ["new-holland-honeyeater"]
  },
  "red-wattlebird": {
    "foodPreferences": ["nectar_feeder", "fruit_dish"],
    "requiredHabitat": ["eucalyptus_tree"],
    "activePhases": ["dawn", "morning", "afternoon", "dusk"],
    "size": "medium",
    "temperament": "aggressive",
    "flocking": false,
    "scaredBy": ["noisy-miner", "sulphur-crested-cockatoo"],
    "chases": ["eastern-spinebill", "new-holland-honeyeater"],
    "attractedBy": []
  },
  "tawny-frogmouth": {
    "foodPreferences": ["mealworms"],
    "requiredHabitat": ["eucalyptus_tree", "dead_log"],
    "activePhases": ["night"],
    "size": "medium",
    "temperament": "shy",
    "flocking": false,
    "scaredBy": ["powerful-owl"],
    "chases": [],
    "attractedBy": []
  },
  "superb-lyrebird": {
    "foodPreferences": ["mealworms"],
    "requiredHabitat": ["dense_shrub", "dead_log"],
    "activePhases": ["dawn", "morning"],
    "size": "large",
    "temperament": "shy",
    "flocking": false,
    "scaredBy": ["wedge-tailed-eagle", "powerful-owl", "sulphur-crested-cockatoo", "noisy-miner"],
    "chases": [],
    "attractedBy": []
  },
  "australian-brush-turkey": {
    "foodPreferences": ["seed_tray", "fruit_dish", "mealworms"],
    "requiredHabitat": ["dead_log", "dense_shrub"],
    "activePhases": ["dawn", "morning", "afternoon"],
    "size": "large",
    "temperament": "bold",
    "flocking": false,
    "scaredBy": ["southern-cassowary", "wedge-tailed-eagle"],
    "chases": [],
    "attractedBy": []
  },
  "eclectus-parrot": {
    "foodPreferences": ["fruit_dish", "nectar_feeder"],
    "requiredHabitat": ["eucalyptus_tree"],
    "activePhases": ["dawn", "morning"],
    "size": "medium",
    "temperament": "shy",
    "flocking": false,
    "scaredBy": ["sulphur-crested-cockatoo", "noisy-miner"],
    "chases": [],
    "attractedBy": []
  },
  "australian-white-ibis": {
    "foodPreferences": ["mealworms", "fish_pond", "fruit_dish", "seed_tray"],
    "requiredHabitat": [],
    "activePhases": ["dawn", "morning", "afternoon", "dusk"],
    "size": "large",
    "temperament": "bold",
    "flocking": true,
    "scaredBy": ["wedge-tailed-eagle"],
    "chases": [],
    "attractedBy": []
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/dan/projects/birds-app && git add public/data/bird-behaviors.json && git commit -m "feat(station): add real bird behavior profiles for all 40 species"
```

---

## Task 4: Visit Engine

**Files:**
- Create: `src/lib/visit-engine.ts`

- [ ] **Step 1: Create `src/lib/visit-engine.ts` with deterministic 7-step visit logic**

```ts
import type {
  BirdBehavior,
  BirdVisit,
  PlacedItem,
  TimePhase,
  GridPosition,
  FoodType,
  HabitatFeature,
} from '../types/station';

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
    'nectar_feeder', 'seed_tray', 'fruit_dish',
    'mealworms', 'bird_bath', 'fish_pond',
  ];
  return items
    .filter((item) => foodTypes.includes(item.type as FoodType))
    .map((item) => item.type as FoodType);
}

function getPlacedHabitatFeatures(items: readonly PlacedItem[]): readonly HabitatFeature[] {
  const habitatTypes: HabitatFeature[] = [
    'dense_shrub', 'eucalyptus_tree', 'dead_log', 'rocks',
  ];
  return items
    .filter((item) => habitatTypes.includes(item.type as HabitatFeature))
    .map((item) => item.type as HabitatFeature);
}

function hasShrubNearFood(
  items: readonly PlacedItem[],
  maxDistance: number,
): boolean {
  const shrubs = items.filter((i) => i.type === 'dense_shrub');
  const foodTypes: readonly string[] = [
    'nectar_feeder', 'seed_tray', 'fruit_dish',
    'mealworms', 'bird_bath', 'fish_pond',
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
  const { placedItems, currentPhase, behaviors, currentVisitors, seed } = context;

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
        visits.some((v) => v.birdId === scaryId && v.status !== 'fleeing'),
    );
    if (scaredByPresent) {
      const foodTarget = findFoodPosition(placedItems, bird.foodPreferences);
      visits.push({
        birdId: bird.id,
        status: 'watching',
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
    if (bird.temperament === 'shy') {
      if (!hasShrubNearFood(placedItems, 2)) continue;
    }

    // Step 7: Weighted random roll
    let visitChance = 0.5;
    if (bird.temperament === 'bold' || bird.temperament === 'aggressive') {
      visitChance = 0.75;
    } else if (bird.temperament === 'cautious') {
      visitChance = 0.55;
    } else if (bird.temperament === 'shy') {
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
      status: 'eating',
      position: foodTarget.position,
      targetItemId: foodTarget.itemId,
      arrivedAtPhase: currentPhase,
    });
  }

  return visits;
}
```

- [ ] **Step 2: Verify compile**

```bash
cd /Users/dan/projects/birds-app && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
cd /Users/dan/projects/birds-app && git add src/lib/visit-engine.ts && git commit -m "feat(station): add visit engine with 7-step deterministic bird evaluation"
```

---

## Task 5: Interaction Engine

**Files:**
- Create: `src/lib/interaction-engine.ts`

- [ ] **Step 1: Create `src/lib/interaction-engine.ts` with bird-to-bird interaction logic**

```ts
import type { BirdBehavior, BirdVisit } from '../types/station';

interface InteractionResult {
  readonly updatedVisits: readonly BirdVisit[];
  readonly events: readonly InteractionEvent[];
}

export interface InteractionEvent {
  readonly type: 'chase' | 'flee' | 'flock_arrive' | 'predator_clear';
  readonly actorId: string;
  readonly targetId: string | null;
  readonly description: string;
}

const SIZE_ORDER: Record<string, number> = {
  tiny: 1,
  small: 2,
  medium: 3,
  large: 4,
  huge: 5,
};

function getBehavior(
  behaviors: readonly BirdBehavior[],
  birdId: string,
): BirdBehavior | undefined {
  return behaviors.find((b) => b.id === birdId);
}

export function resolveInteractions(
  visits: readonly BirdVisit[],
  behaviors: readonly BirdBehavior[],
): InteractionResult {
  const updatedVisits: BirdVisit[] = visits.map((v) => ({ ...v }));
  const events: InteractionEvent[] = [];

  // Pass 1: Aggressive birds chase shy/cautious birds from the same food source
  for (const visit of updatedVisits) {
    const behavior = getBehavior(behaviors, visit.birdId);
    if (!behavior) continue;
    if (behavior.temperament !== 'aggressive') continue;
    if (visit.status === 'fleeing') continue;

    for (const target of updatedVisits) {
      if (target.birdId === visit.birdId) continue;
      if (target.status === 'fleeing') continue;

      const targetBehavior = getBehavior(behaviors, target.birdId);
      if (!targetBehavior) continue;

      // Check if aggressor explicitly chases this species
      const explicitChase = behavior.chases.includes(target.birdId);

      // Check if larger bird prevents smaller bird at same food
      const sameFood = target.targetItemId !== null &&
        target.targetItemId === visit.targetItemId;
      const sizeDiff = SIZE_ORDER[behavior.size] - SIZE_ORDER[targetBehavior.size];
      const sizeChase = sameFood && sizeDiff >= 2;

      if (explicitChase || sizeChase) {
        const targetIndex = updatedVisits.findIndex(
          (v) => v.birdId === target.birdId,
        );
        if (targetIndex !== -1) {
          updatedVisits[targetIndex] = {
            ...updatedVisits[targetIndex],
            status: 'fleeing',
          };
          events.push({
            type: 'chase',
            actorId: visit.birdId,
            targetId: target.birdId,
            description: `${visit.birdId} chases ${target.birdId} away`,
          });
        }
      }
    }
  }

  // Pass 2: Predators (huge aggressive) clear all smaller birds
  for (const visit of updatedVisits) {
    const behavior = getBehavior(behaviors, visit.birdId);
    if (!behavior) continue;
    if (behavior.size !== 'huge' || behavior.temperament !== 'aggressive') continue;
    if (visit.status === 'fleeing') continue;

    for (const target of updatedVisits) {
      if (target.birdId === visit.birdId) continue;
      if (target.status === 'fleeing' || target.status === 'watching') continue;

      const targetBehavior = getBehavior(behaviors, target.birdId);
      if (!targetBehavior) continue;

      if (SIZE_ORDER[targetBehavior.size] <= SIZE_ORDER['medium']) {
        const targetIndex = updatedVisits.findIndex(
          (v) => v.birdId === target.birdId,
        );
        if (targetIndex !== -1 && updatedVisits[targetIndex].status !== 'fleeing') {
          updatedVisits[targetIndex] = {
            ...updatedVisits[targetIndex],
            status: 'fleeing',
          };
          events.push({
            type: 'predator_clear',
            actorId: visit.birdId,
            targetId: target.birdId,
            description: `${visit.birdId} presence scares ${target.birdId}`,
          });
        }
      }
    }
  }

  // Pass 3: Flocking — if a flocking bird visits, queue more for next phase
  for (const visit of updatedVisits) {
    if (visit.status === 'fleeing') continue;
    const behavior = getBehavior(behaviors, visit.birdId);
    if (!behavior) continue;
    if (!behavior.flocking) continue;

    events.push({
      type: 'flock_arrive',
      actorId: visit.birdId,
      targetId: null,
      description: `${visit.birdId} calls to its flock — more may arrive next phase`,
    });
  }

  return { updatedVisits, events };
}
```

- [ ] **Step 2: Verify compile**

```bash
cd /Users/dan/projects/birds-app && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
cd /Users/dan/projects/birds-app && git add src/lib/interaction-engine.ts && git commit -m "feat(station): add interaction engine for bird-to-bird behaviors"
```

---

## Task 6: Station Store

**Files:**
- Create: `src/stores/useStationStore.ts`

- [ ] **Step 1: Create `src/stores/useStationStore.ts` with grid state, items, phase, and budget**

```ts
import { create } from 'zustand';
import type {
  PlacedItem,
  TimePhase,
  StationScreen,
  GridPosition,
  StationItemType,
} from '../types/station';
import {
  GRID_ROWS,
  GRID_COLS,
  SESSION_BUDGET,
  getNextPhase,
} from '../lib/station-config';

interface StationStore {
  readonly screen: StationScreen;
  readonly placedItems: readonly PlacedItem[];
  readonly currentPhase: TimePhase;
  readonly budget: number;
  readonly sessionNumber: number;
  readonly phasesPlayed: number;

  setScreen: (screen: StationScreen) => void;
  placeItem: (type: StationItemType, position: GridPosition) => void;
  removeItem: (itemId: string) => void;
  moveItem: (itemId: string, newPosition: GridPosition) => void;
  advancePhase: () => void;
  startNewSession: () => void;
  isValidPlacement: (position: GridPosition) => boolean;
}

function generateItemId(): string {
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const loadSessionNumber = (): number => {
  const stored = localStorage.getItem('bird-station-sessions');
  return stored ? parseInt(stored, 10) : 0;
};

export const useStationStore = create<StationStore>((set, get) => ({
  screen: 'station-title',
  placedItems: [],
  currentPhase: 'dawn',
  budget: SESSION_BUDGET,
  sessionNumber: loadSessionNumber(),
  phasesPlayed: 0,

  setScreen: (screen) => set({ screen }),

  placeItem: (type, position) => {
    const state = get();
    if (state.budget <= 0) return;
    if (!state.isValidPlacement(position)) return;

    const newItem: PlacedItem = {
      id: generateItemId(),
      type,
      position,
    };
    set({
      placedItems: [...state.placedItems, newItem],
      budget: state.budget - 1,
    });
  },

  removeItem: (itemId) => {
    const state = get();
    const item = state.placedItems.find((i) => i.id === itemId);
    if (!item) return;
    set({
      placedItems: state.placedItems.filter((i) => i.id !== itemId),
      budget: state.budget + 1,
    });
  },

  moveItem: (itemId, newPosition) => {
    const state = get();
    if (!state.isValidPlacement(newPosition)) return;

    set({
      placedItems: state.placedItems.map((item) =>
        item.id === itemId
          ? { ...item, position: newPosition }
          : item,
      ),
    });
  },

  advancePhase: () => {
    const state = get();
    const next = getNextPhase(state.currentPhase);
    if (next === null) {
      set({ screen: 'station-summary' });
      return;
    }
    set({
      currentPhase: next,
      phasesPlayed: state.phasesPlayed + 1,
    });
  },

  startNewSession: () => {
    const newCount = get().sessionNumber + 1;
    localStorage.setItem('bird-station-sessions', String(newCount));
    set({
      screen: 'station-playing',
      placedItems: [],
      currentPhase: 'dawn',
      budget: SESSION_BUDGET,
      sessionNumber: newCount,
      phasesPlayed: 0,
    });
  },

  isValidPlacement: (position) => {
    if (
      position.row < 0 ||
      position.row >= GRID_ROWS ||
      position.col < 0 ||
      position.col >= GRID_COLS
    ) {
      return false;
    }
    const state = get();
    return !state.placedItems.some(
      (item) =>
        item.position.row === position.row &&
        item.position.col === position.col,
    );
  },
}));
```

- [ ] **Step 2: Verify compile**

```bash
cd /Users/dan/projects/birds-app && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
cd /Users/dan/projects/birds-app && git add src/stores/useStationStore.ts && git commit -m "feat(station): add station store for grid state, items, and phases"
```

---

## Task 7: Visitor Store

**Files:**
- Create: `src/stores/useVisitorStore.ts`

- [ ] **Step 1: Create `src/stores/useVisitorStore.ts` for visitor state and discoveries**

```ts
import { create } from 'zustand';
import type { BirdVisit, BirdBehavior, SessionStats, TimePhase } from '../types/station';
import type { InteractionEvent } from '../lib/interaction-engine';

interface VisitorStore {
  readonly visitors: readonly BirdVisit[];
  readonly behaviors: readonly BirdBehavior[];
  readonly events: readonly InteractionEvent[];
  readonly sessionSpecies: readonly string[];
  readonly newDiscoveries: readonly string[];
  readonly isLoading: boolean;

  setVisitors: (visitors: readonly BirdVisit[]) => void;
  setEvents: (events: readonly InteractionEvent[]) => void;
  setBehaviors: (behaviors: readonly BirdBehavior[]) => void;
  fetchBehaviors: () => Promise<void>;
  recordDiscovery: (birdId: string) => void;
  addSessionSpecies: (birdId: string) => void;
  resetSession: () => void;
  getSessionStats: (phasesPlayed: number, itemsPlaced: number) => SessionStats;
}

export const useVisitorStore = create<VisitorStore>((set, get) => ({
  visitors: [],
  behaviors: [],
  events: [],
  sessionSpecies: [],
  newDiscoveries: [],
  isLoading: false,

  setVisitors: (visitors) => set({ visitors }),
  setEvents: (events) => set({ events }),
  setBehaviors: (behaviors) => set({ behaviors }),

  fetchBehaviors: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch('/data/bird-behaviors.json');
      const data: Record<string, Omit<BirdBehavior, 'id'>> = await response.json();
      const behaviors: BirdBehavior[] = Object.entries(data).map(
        ([id, behavior]) => ({
          id,
          ...behavior,
        }),
      );
      set({ behaviors, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  recordDiscovery: (birdId) => {
    const state = get();
    if (state.newDiscoveries.includes(birdId)) return;
    set({
      newDiscoveries: [...state.newDiscoveries, birdId],
    });
  },

  addSessionSpecies: (birdId) => {
    const state = get();
    if (state.sessionSpecies.includes(birdId)) return;
    set({
      sessionSpecies: [...state.sessionSpecies, birdId],
    });
  },

  resetSession: () =>
    set({
      visitors: [],
      events: [],
      sessionSpecies: [],
      newDiscoveries: [],
    }),

  getSessionStats: (phasesPlayed, itemsPlaced) => {
    const state = get();
    return {
      speciesSeen: state.sessionSpecies,
      newDiscoveries: state.newDiscoveries,
      totalVisitors: state.sessionSpecies.length,
      phasesPlayed,
      itemsPlaced,
    };
  },
}));
```

- [ ] **Step 2: Verify compile**

```bash
cd /Users/dan/projects/birds-app && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
cd /Users/dan/projects/birds-app && git add src/stores/useVisitorStore.ts && git commit -m "feat(station): add visitor store for current visitors and discoveries"
```

---

## Task 8: Station Game Loop Hook

**Files:**
- Create: `src/hooks/useStationLoop.ts`

- [ ] **Step 1: Create `src/hooks/useStationLoop.ts` to evaluate visitors on changes**

```ts
import { useEffect, useCallback, useRef } from 'react';
import { useStationStore } from '../stores/useStationStore';
import { useVisitorStore } from '../stores/useVisitorStore';
import { useCollectionStore } from '../stores/useCollectionStore';
import { evaluateVisitors } from '../lib/visit-engine';
import { resolveInteractions } from '../lib/interaction-engine';

export function useStationLoop(): void {
  const placedItems = useStationStore((s) => s.placedItems);
  const currentPhase = useStationStore((s) => s.currentPhase);
  const screen = useStationStore((s) => s.screen);

  const behaviors = useVisitorStore((s) => s.behaviors);
  const visitors = useVisitorStore((s) => s.visitors);
  const setVisitors = useVisitorStore((s) => s.setVisitors);
  const setEvents = useVisitorStore((s) => s.setEvents);
  const addSessionSpecies = useVisitorStore((s) => s.addSessionSpecies);
  const recordDiscovery = useVisitorStore((s) => s.recordDiscovery);

  const discoverBird = useCollectionStore((s) => s.discoverBird);
  const isDiscovered = useCollectionStore((s) => s.isDiscovered);

  const prevPhaseRef = useRef(currentPhase);
  const prevItemCountRef = useRef(placedItems.length);

  const evaluate = useCallback(() => {
    if (screen !== 'station-playing') return;
    if (behaviors.length === 0) return;

    const seed = Date.now();

    const newVisits = evaluateVisitors({
      placedItems,
      currentPhase,
      behaviors,
      currentVisitors: visitors,
      seed,
    });

    const { updatedVisits, events } = resolveInteractions(newVisits, behaviors);

    setVisitors(updatedVisits);
    setEvents(events);

    // Track discoveries
    for (const visit of updatedVisits) {
      if (visit.status !== 'fleeing' && visit.status !== 'watching') {
        addSessionSpecies(visit.birdId);
        if (!isDiscovered(visit.birdId)) {
          discoverBird(visit.birdId);
          recordDiscovery(visit.birdId);
        }
      }
    }
  }, [
    screen,
    placedItems,
    currentPhase,
    behaviors,
    visitors,
    setVisitors,
    setEvents,
    addSessionSpecies,
    recordDiscovery,
    discoverBird,
    isDiscovered,
  ]);

  // Re-evaluate when phase changes
  useEffect(() => {
    if (prevPhaseRef.current !== currentPhase) {
      prevPhaseRef.current = currentPhase;
      evaluate();
    }
  }, [currentPhase, evaluate]);

  // Re-evaluate when items change
  useEffect(() => {
    if (prevItemCountRef.current !== placedItems.length) {
      prevItemCountRef.current = placedItems.length;
      evaluate();
    }
  }, [placedItems.length, evaluate]);

  // Initial evaluation
  useEffect(() => {
    if (screen === 'station-playing' && behaviors.length > 0) {
      evaluate();
    }
  }, [screen, behaviors.length, evaluate]);
}
```

- [ ] **Step 2: Verify compile**

```bash
cd /Users/dan/projects/birds-app && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
cd /Users/dan/projects/birds-app && git add src/hooks/useStationLoop.ts && git commit -m "feat(station): add station game loop hook for visitor evaluation"
```

---

## Task 9: Drag-and-Drop Hook

**Files:**
- Create: `src/hooks/useDragDrop.ts`

- [ ] **Step 1: Create `src/hooks/useDragDrop.ts` with HTML5 drag and drop**

```ts
import { useCallback } from 'react';
import type { StationItemType, GridPosition } from '../types/station';
import { useStationStore } from '../stores/useStationStore';

interface DragData {
  readonly type: StationItemType;
  readonly sourceItemId?: string;
}

const DRAG_DATA_KEY = 'application/station-item';

export function useDragStart() {
  return useCallback(
    (e: React.DragEvent, data: DragData) => {
      e.dataTransfer.setData(DRAG_DATA_KEY, JSON.stringify(data));
      e.dataTransfer.effectAllowed = 'move';
    },
    [],
  );
}

export function useDragOver() {
  const isValidPlacement = useStationStore((s) => s.isValidPlacement);

  return useCallback(
    (e: React.DragEvent, position: GridPosition) => {
      e.preventDefault();
      if (isValidPlacement(position)) {
        e.dataTransfer.dropEffect = 'move';
      } else {
        e.dataTransfer.dropEffect = 'none';
      }
    },
    [isValidPlacement],
  );
}

export function useDrop() {
  const placeItem = useStationStore((s) => s.placeItem);
  const moveItem = useStationStore((s) => s.moveItem);
  const budget = useStationStore((s) => s.budget);

  return useCallback(
    (e: React.DragEvent, position: GridPosition) => {
      e.preventDefault();
      const rawData = e.dataTransfer.getData(DRAG_DATA_KEY);
      if (!rawData) return;

      const data: DragData = JSON.parse(rawData) as DragData;

      if (data.sourceItemId) {
        // Moving an existing item
        moveItem(data.sourceItemId, position);
      } else {
        // Placing a new item from toolbar
        if (budget <= 0) return;
        placeItem(data.type, position);
      }
    },
    [placeItem, moveItem, budget],
  );
}

export function useDragDrop() {
  return {
    onDragStart: useDragStart(),
    onDragOver: useDragOver(),
    onDrop: useDrop(),
  };
}
```

- [ ] **Step 2: Verify compile**

```bash
cd /Users/dan/projects/birds-app && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
cd /Users/dan/projects/birds-app && git add src/hooks/useDragDrop.ts && git commit -m "feat(station): add HTML5 drag and drop hook for grid placement"
```

---

## Task 10: Canvas Components

**Files:**
- Create: `src/components/station/StationCanvas.tsx`
- Create: `src/components/station/GridCell.tsx`
- Create: `src/components/station/PlacedItem.tsx`

- [ ] **Step 1: Create `src/components/station/GridCell.tsx`**

```tsx
import { useState, useCallback } from 'react';
import type { GridPosition } from '../../types/station';

interface GridCellProps {
  position: GridPosition;
  onDragOver: (e: React.DragEvent, position: GridPosition) => void;
  onDrop: (e: React.DragEvent, position: GridPosition) => void;
  children?: React.ReactNode;
}

export default function GridCell({
  position,
  onDragOver,
  onDrop,
  children,
}: GridCellProps) {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      onDragOver(e, position);
      setIsOver(true);
    },
    [onDragOver, position],
  );

  const handleDragLeave = useCallback(() => {
    setIsOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      setIsOver(false);
      onDrop(e, position);
    },
    [onDrop, position],
  );

  return (
    <div
      className={`relative flex aspect-square items-center justify-center rounded border transition-colors ${
        isOver
          ? 'border-outback-gold bg-outback-gold/20'
          : 'border-eucalyptus-600/30 bg-eucalyptus-700/20'
      } ${children ? '' : 'hover:border-eucalyptus-400/50'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      role="gridcell"
      aria-label={`Grid cell row ${position.row + 1}, column ${position.col + 1}`}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/station/PlacedItem.tsx`**

```tsx
import { useCallback } from 'react';
import type { PlacedItem as PlacedItemType } from '../../types/station';
import { getItemDefinition } from '../../lib/station-config';
import { useStationStore } from '../../stores/useStationStore';

interface PlacedItemProps {
  item: PlacedItemType;
  onDragStart: (e: React.DragEvent, data: { type: string; sourceItemId: string }) => void;
}

export default function PlacedItem({ item, onDragStart }: PlacedItemProps) {
  const removeItem = useStationStore((s) => s.removeItem);
  const definition = getItemDefinition(item.type);

  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      onDragStart(e, { type: item.type, sourceItemId: item.id });
    },
    [onDragStart, item.type, item.id],
  );

  const handleDoubleClick = useCallback(() => {
    removeItem(item.id);
  }, [removeItem, item.id]);

  return (
    <div
      className="flex h-full w-full cursor-grab items-center justify-center text-2xl active:cursor-grabbing"
      draggable
      onDragStart={handleDragStart}
      onDoubleClick={handleDoubleClick}
      title={`${definition.name} (double-click to remove)`}
      role="img"
      aria-label={definition.name}
    >
      <span className="drop-shadow-md">{definition.emoji}</span>
    </div>
  );
}
```

- [ ] **Step 3: Create `src/components/station/StationCanvas.tsx`**

```tsx
import { useMemo } from 'react';
import { useStationStore } from '../../stores/useStationStore';
import { useVisitorStore } from '../../stores/useVisitorStore';
import { useDragDrop } from '../../hooks/useDragDrop';
import { getPhaseDefinition } from '../../lib/station-config';
import { GRID_ROWS, GRID_COLS } from '../../lib/station-config';
import GridCell from './GridCell';
import PlacedItem from './PlacedItem';
import VisitorBird from './VisitorBird';

export default function StationCanvas() {
  const placedItems = useStationStore((s) => s.placedItems);
  const currentPhase = useStationStore((s) => s.currentPhase);
  const visitors = useVisitorStore((s) => s.visitors);
  const { onDragStart, onDragOver, onDrop } = useDragDrop();

  const phaseDef = getPhaseDefinition(currentPhase);

  const grid = useMemo(() => {
    const cells: { row: number; col: number }[] = [];
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        cells.push({ row, col });
      }
    }
    return cells;
  }, []);

  return (
    <div
      className="relative flex-1 rounded-lg p-2"
      style={{
        background: `linear-gradient(135deg, ${phaseDef.gradientFrom}, ${phaseDef.gradientTo})`,
      }}
    >
      <div
        className="grid h-full w-full gap-1"
        style={{
          gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
        }}
        role="grid"
        aria-label="Feeding station grid"
      >
        {grid.map(({ row, col }) => {
          const item = placedItems.find(
            (i) => i.position.row === row && i.position.col === col,
          );

          const cellVisitors = visitors.filter(
            (v) => v.position.row === row && v.position.col === col,
          );

          return (
            <GridCell
              key={`${row}-${col}`}
              position={{ row, col }}
              onDragOver={onDragOver}
              onDrop={onDrop}
            >
              {item && (
                <PlacedItem item={item} onDragStart={onDragStart} />
              )}
              {cellVisitors.map((visitor) => (
                <VisitorBird key={visitor.birdId} visit={visitor} />
              ))}
            </GridCell>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify compile**

```bash
cd /Users/dan/projects/birds-app && npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
cd /Users/dan/projects/birds-app && git add src/components/station/StationCanvas.tsx src/components/station/GridCell.tsx src/components/station/PlacedItem.tsx && git commit -m "feat(station): add canvas, grid cell, and placed item components"
```

---

## Task 11: Toolbar

**Files:**
- Create: `src/components/station/Toolbar.tsx`
- Create: `src/components/station/ToolbarItem.tsx`

- [ ] **Step 1: Create `src/components/station/ToolbarItem.tsx`**

```tsx
import { useCallback } from 'react';
import type { StationItemDefinition } from '../../types/station';

interface ToolbarItemProps {
  definition: StationItemDefinition;
  disabled: boolean;
  onDragStart: (e: React.DragEvent, data: { type: string }) => void;
}

export default function ToolbarItem({
  definition,
  disabled,
  onDragStart,
}: ToolbarItemProps) {
  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      if (disabled) {
        e.preventDefault();
        return;
      }
      onDragStart(e, { type: definition.type });
    },
    [onDragStart, definition.type, disabled],
  );

  return (
    <div
      className={`flex cursor-grab flex-col items-center gap-1 rounded-lg border p-2 transition-all ${
        disabled
          ? 'cursor-not-allowed border-bark-700/30 opacity-40'
          : 'border-eucalyptus-500/50 bg-eucalyptus-700/40 hover:border-outback-gold/50 hover:bg-eucalyptus-600/40 active:cursor-grabbing'
      }`}
      draggable={!disabled}
      onDragStart={handleDragStart}
      title={disabled ? 'No budget remaining' : definition.description}
      role="button"
      aria-label={`${definition.name}: ${definition.description}`}
      aria-disabled={disabled}
    >
      <span className="text-xl">{definition.emoji}</span>
      <span className="text-center text-xs text-sand-200">
        {definition.name}
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/station/Toolbar.tsx`**

```tsx
import { useStationStore } from '../../stores/useStationStore';
import { useDragStart } from '../../hooks/useDragDrop';
import { FOOD_ITEMS, HABITAT_ITEMS } from '../../lib/station-config';
import ToolbarItem from './ToolbarItem';

export default function Toolbar() {
  const budget = useStationStore((s) => s.budget);
  const onDragStart = useDragStart();
  const noBudget = budget <= 0;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-eucalyptus-600/30 bg-night-sky/80 p-3">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-sm text-outback-gold">Items</h3>
        <span className="rounded-full bg-eucalyptus-600/40 px-2 py-0.5 font-mono text-xs text-sand-200">
          {budget} left
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wider text-bark-400">
          Food & Water
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          {FOOD_ITEMS.map((item) => (
            <ToolbarItem
              key={item.type}
              definition={item}
              disabled={noBudget}
              onDragStart={onDragStart}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wider text-bark-400">
          Vegetation
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {HABITAT_ITEMS.map((item) => (
            <ToolbarItem
              key={item.type}
              definition={item}
              disabled={noBudget}
              onDragStart={onDragStart}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify compile**

```bash
cd /Users/dan/projects/birds-app && npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
cd /Users/dan/projects/birds-app && git add src/components/station/Toolbar.tsx src/components/station/ToolbarItem.tsx && git commit -m "feat(station): add toolbar and draggable item components"
```

---

## Task 12: Visitor Bird Component

**Files:**
- Create: `src/components/station/VisitorBird.tsx`

- [ ] **Step 1: Create `src/components/station/VisitorBird.tsx` with behavior animations**

```tsx
import { useMemo } from 'react';
import type { BirdVisit } from '../../types/station';
import { useBirdStore } from '../../stores/useBirdStore';

interface VisitorBirdProps {
  visit: BirdVisit;
}

const STATUS_STYLES: Record<string, string> = {
  approaching: 'animate-pulse opacity-60',
  eating: 'animate-bounce',
  bathing: 'animate-pulse',
  watching: 'opacity-50 grayscale',
  fleeing: 'animate-ping opacity-30',
  chasing: 'animate-bounce scale-110',
  idle: '',
};

const STATUS_LABELS: Record<string, string> = {
  approaching: 'Approaching...',
  eating: 'Eating',
  bathing: 'Bathing',
  watching: 'Watching nervously',
  fleeing: 'Fleeing!',
  chasing: 'Chasing!',
  idle: 'Resting',
};

export default function VisitorBird({ visit }: VisitorBirdProps) {
  const getBirdBySlug = useBirdStore((s) => s.getBirdBySlug);
  const bird = getBirdBySlug(visit.birdId);

  const animationClass = useMemo(
    () => STATUS_STYLES[visit.status] ?? '',
    [visit.status],
  );

  if (!bird) return null;

  return (
    <div
      className={`absolute -top-2 -right-2 z-10 ${animationClass}`}
      title={`${bird.commonName} — ${STATUS_LABELS[visit.status] ?? visit.status}`}
    >
      <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-outback-gold shadow-lg">
        <img
          src={bird.imageUrl}
          alt={bird.commonName}
          className="h-full w-full object-cover object-top"
          loading="lazy"
        />
      </div>
      {visit.status === 'watching' && (
        <span className="absolute -bottom-1 -right-1 text-xs">👀</span>
      )}
      {visit.status === 'eating' && (
        <span className="absolute -bottom-1 -right-1 text-xs">🍽️</span>
      )}
      {visit.status === 'fleeing' && (
        <span className="absolute -bottom-1 -right-1 text-xs">💨</span>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify compile**

```bash
cd /Users/dan/projects/birds-app && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
cd /Users/dan/projects/birds-app && git add src/components/station/VisitorBird.tsx && git commit -m "feat(station): add visitor bird component with behavior animations"
```

---

## Task 13: UI Screens

**Files:**
- Create: `src/components/station/StationTitle.tsx`
- Create: `src/components/station/TimeControl.tsx`
- Create: `src/components/station/VisitorList.tsx`
- Create: `src/components/station/BirdInfoCard.tsx`
- Create: `src/components/station/SessionSummary.tsx`

- [ ] **Step 1: Create `src/components/station/StationTitle.tsx`**

```tsx
import { useCallback } from 'react';
import { useStationStore } from '../../stores/useStationStore';
import { useCollectionStore } from '../../stores/useCollectionStore';

interface StationTitleProps {
  onPlayCatcher: () => void;
}

export default function StationTitle({ onPlayCatcher }: StationTitleProps) {
  const startNewSession = useStationStore((s) => s.startNewSession);
  const sessionNumber = useStationStore((s) => s.sessionNumber);
  const discoveredBirdIds = useCollectionStore((s) => s.discoveredBirdIds);

  const handleStart = useCallback(() => {
    startNewSession();
  }, [startNewSession]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-night-sky p-6">
      <div className="animate-fade-in text-center">
        <h1 className="font-serif text-5xl text-outback-gold md:text-6xl">
          Feeding Station
        </h1>
        <p className="mt-3 max-w-md text-lg text-sand-300">
          Build a feeding station to attract Australia's birds. Place food,
          water, and vegetation strategically to discover all 40 species.
        </p>
      </div>

      <div className="animate-slide-up flex flex-col items-center gap-4">
        <button
          onClick={handleStart}
          className="rounded-full bg-outback-gold px-8 py-3 font-serif text-xl text-deep-bark shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          Start Session
        </button>

        <button
          onClick={onPlayCatcher}
          className="rounded-lg border border-eucalyptus-500/50 px-6 py-2 text-sm text-sand-200 transition-colors hover:border-outback-gold/50"
        >
          Play Bird Catcher instead
        </button>
      </div>

      <div className="animate-slide-up flex gap-6 text-center">
        <div>
          <p className="font-mono text-2xl text-outback-gold">
            {discoveredBirdIds.length}
          </p>
          <p className="text-xs text-bark-400">Species Found</p>
        </div>
        <div>
          <p className="font-mono text-2xl text-outback-gold">40</p>
          <p className="text-xs text-bark-400">Total Species</p>
        </div>
        <div>
          <p className="font-mono text-2xl text-outback-gold">
            {sessionNumber}
          </p>
          <p className="text-xs text-bark-400">Sessions</p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/station/TimeControl.tsx`**

```tsx
import { useCallback } from 'react';
import { useStationStore } from '../../stores/useStationStore';
import { getPhaseDefinition, PHASE_ORDER } from '../../lib/station-config';

export default function TimeControl() {
  const currentPhase = useStationStore((s) => s.currentPhase);
  const advancePhase = useStationStore((s) => s.advancePhase);
  const phaseDef = getPhaseDefinition(currentPhase);
  const currentIndex = PHASE_ORDER.indexOf(currentPhase);
  const isLastPhase = currentIndex === PHASE_ORDER.length - 1;

  const handleAdvance = useCallback(() => {
    advancePhase();
  }, [advancePhase]);

  return (
    <div className="flex items-center gap-3 rounded-lg border border-eucalyptus-600/30 bg-night-sky/80 px-4 py-2">
      <div className="flex items-center gap-2">
        <span className="text-xl">{phaseDef.emoji}</span>
        <div>
          <p className="font-serif text-sm text-outback-gold">
            {phaseDef.label}
          </p>
          <p className="text-xs text-bark-400">{phaseDef.description}</p>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="flex gap-1">
          {PHASE_ORDER.map((phase, idx) => (
            <div
              key={phase}
              className={`h-2 w-6 rounded-full ${
                idx <= currentIndex
                  ? 'bg-outback-gold'
                  : 'bg-eucalyptus-600/30'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleAdvance}
          className="rounded-lg bg-eucalyptus-500/80 px-3 py-1.5 text-sm text-sand-100 transition-colors hover:bg-eucalyptus-400"
        >
          {isLastPhase ? 'End Session' : 'Next Phase'}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `src/components/station/VisitorList.tsx`**

```tsx
import { useVisitorStore } from '../../stores/useVisitorStore';
import { useBirdStore } from '../../stores/useBirdStore';

const STATUS_EMOJI: Record<string, string> = {
  eating: '🍽️',
  bathing: '💧',
  watching: '👀',
  fleeing: '💨',
  chasing: '⚔️',
  approaching: '🚶',
  idle: '😴',
};

export default function VisitorList() {
  const visitors = useVisitorStore((s) => s.visitors);
  const events = useVisitorStore((s) => s.events);
  const getBirdBySlug = useBirdStore((s) => s.getBirdBySlug);

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-eucalyptus-600/30 bg-night-sky/80 p-3">
      <h3 className="font-serif text-sm text-outback-gold">
        Visitors ({visitors.length})
      </h3>

      {visitors.length === 0 && (
        <p className="text-xs text-bark-400">
          No birds visiting yet. Place food and habitat items to attract them.
        </p>
      )}

      <div className="flex max-h-48 flex-col gap-1 overflow-y-auto">
        {visitors.map((visit) => {
          const bird = getBirdBySlug(visit.birdId);
          if (!bird) return null;

          return (
            <div
              key={visit.birdId}
              className="flex items-center gap-2 rounded px-2 py-1 text-xs hover:bg-eucalyptus-700/30"
            >
              <span>{STATUS_EMOJI[visit.status] ?? '🐦'}</span>
              <span className="flex-1 text-sand-200">{bird.commonName}</span>
              <span className="capitalize text-bark-400">{visit.status}</span>
            </div>
          );
        })}
      </div>

      {events.length > 0 && (
        <div className="mt-2 border-t border-eucalyptus-600/20 pt-2">
          <p className="mb-1 text-xs uppercase tracking-wider text-bark-400">
            Events
          </p>
          <div className="flex max-h-24 flex-col gap-0.5 overflow-y-auto">
            {events.map((event, idx) => (
              <p key={idx} className="text-xs text-sand-300/70">
                {event.description}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create `src/components/station/BirdInfoCard.tsx`**

```tsx
import { useCallback, useEffect } from 'react';
import { useStationStore } from '../../stores/useStationStore';
import { useBirdStore } from '../../stores/useBirdStore';
import { CONSERVATION_LABELS, CONSERVATION_COLORS } from '../../lib/constants';
import ConservationBadge from '../birds/ConservationBadge';

interface BirdInfoCardProps {
  birdId: string;
  onDismiss: () => void;
}

export default function BirdInfoCard({ birdId, onDismiss }: BirdInfoCardProps) {
  const bird = useBirdStore((s) => s.getBirdBySlug(birdId));

  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!bird) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onDismiss}
      role="dialog"
      aria-label={`New species discovered: ${bird.commonName}`}
    >
      <div
        className="animate-card-flip w-full max-w-sm overflow-hidden rounded-2xl bg-night-sky shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-48 overflow-hidden">
          <img
            src={bird.imageUrl}
            alt={bird.commonName}
            className="h-full w-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-night-sky/90 to-transparent" />
          <p className="absolute bottom-2 left-4 font-mono text-xs text-outback-gold">
            NEW SPECIES DISCOVERED!
          </p>
        </div>

        <div className="flex flex-col gap-2 p-4">
          <h2 className="font-serif text-2xl text-outback-gold">
            {bird.commonName}
          </h2>
          <p className="text-xs italic text-bark-400">{bird.scientificName}</p>

          <ConservationBadge status={bird.conservationStatus} />

          <p className="text-sm text-sand-200">{bird.description}</p>

          <div className="mt-2 rounded-lg bg-eucalyptus-700/30 p-3">
            <p className="text-xs text-bark-400">Fun Fact</p>
            <p className="text-sm text-outback-gold">{bird.funFact}</p>
          </div>

          <button
            onClick={onDismiss}
            className="mt-2 rounded-lg bg-eucalyptus-500/80 px-4 py-2 text-sm text-sand-100 transition-colors hover:bg-eucalyptus-400"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create `src/components/station/SessionSummary.tsx`**

```tsx
import { useCallback, useMemo } from 'react';
import { useStationStore } from '../../stores/useStationStore';
import { useVisitorStore } from '../../stores/useVisitorStore';
import { useCollectionStore } from '../../stores/useCollectionStore';
import { useBirdStore } from '../../stores/useBirdStore';

export default function SessionSummary() {
  const startNewSession = useStationStore((s) => s.startNewSession);
  const setScreen = useStationStore((s) => s.setScreen);
  const phasesPlayed = useStationStore((s) => s.phasesPlayed);
  const placedItems = useStationStore((s) => s.placedItems);

  const sessionSpecies = useVisitorStore((s) => s.sessionSpecies);
  const newDiscoveries = useVisitorStore((s) => s.newDiscoveries);
  const resetSession = useVisitorStore((s) => s.resetSession);

  const discoveredBirdIds = useCollectionStore((s) => s.discoveredBirdIds);
  const getBirdBySlug = useBirdStore((s) => s.getBirdBySlug);

  const bestSession = useMemo(() => {
    const stored = localStorage.getItem('bird-station-best');
    const prev = stored ? parseInt(stored, 10) : 0;
    const current = sessionSpecies.length;
    if (current > prev) {
      localStorage.setItem('bird-station-best', String(current));
      return current;
    }
    return prev;
  }, [sessionSpecies.length]);

  const handlePlayAgain = useCallback(() => {
    resetSession();
    startNewSession();
  }, [resetSession, startNewSession]);

  const handleBackToTitle = useCallback(() => {
    resetSession();
    setScreen('station-title');
  }, [resetSession, setScreen]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-night-sky p-6">
      <h1 className="animate-fade-in font-serif text-4xl text-outback-gold">
        Session Complete
      </h1>

      <div className="animate-slide-up flex gap-8 text-center">
        <div>
          <p className="font-mono text-3xl text-outback-gold">
            {sessionSpecies.length}
          </p>
          <p className="text-xs text-bark-400">Species This Session</p>
        </div>
        <div>
          <p className="font-mono text-3xl text-outback-gold">
            {newDiscoveries.length}
          </p>
          <p className="text-xs text-bark-400">New Discoveries</p>
        </div>
        <div>
          <p className="font-mono text-3xl text-outback-gold">
            {discoveredBirdIds.length}/40
          </p>
          <p className="text-xs text-bark-400">Collection</p>
        </div>
      </div>

      {newDiscoveries.length > 0 && (
        <div className="animate-slide-up w-full max-w-md rounded-lg border border-eucalyptus-600/30 bg-eucalyptus-700/20 p-4">
          <h3 className="mb-2 font-serif text-sm text-outback-gold">
            New Discoveries
          </h3>
          <div className="flex flex-wrap gap-2">
            {newDiscoveries.map((id) => {
              const bird = getBirdBySlug(id);
              return bird ? (
                <div
                  key={id}
                  className="flex items-center gap-2 rounded-full bg-eucalyptus-600/30 px-3 py-1"
                >
                  <div className="h-6 w-6 overflow-hidden rounded-full">
                    <img
                      src={bird.imageUrl}
                      alt={bird.commonName}
                      className="h-full w-full object-cover object-top"
                    />
                  </div>
                  <span className="text-xs text-sand-200">
                    {bird.commonName}
                  </span>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}

      <div className="animate-slide-up flex flex-col items-center gap-3">
        <p className="text-xs text-bark-400">
          Best session: {bestSession} species | {phasesPlayed + 1} phases
          played | {placedItems.length} items placed
        </p>

        <div className="flex gap-3">
          <button
            onClick={handlePlayAgain}
            className="rounded-full bg-outback-gold px-6 py-2.5 font-serif text-lg text-deep-bark shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            Play Again
          </button>
          <button
            onClick={handleBackToTitle}
            className="rounded-lg border border-eucalyptus-500/50 px-4 py-2 text-sm text-sand-200 transition-colors hover:border-outback-gold/50"
          >
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Verify compile**

```bash
cd /Users/dan/projects/birds-app && npx tsc --noEmit
```

- [ ] **Step 7: Commit**

```bash
cd /Users/dan/projects/birds-app && git add src/components/station/StationTitle.tsx src/components/station/TimeControl.tsx src/components/station/VisitorList.tsx src/components/station/BirdInfoCard.tsx src/components/station/SessionSummary.tsx && git commit -m "feat(station): add title, time control, visitor list, info card, and session summary screens"
```

---

## Task 14: Wire into App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Update `src/App.tsx` to add station game screens alongside Bird Catcher**

Replace the entire contents of `src/App.tsx` with:

```tsx
import { useEffect, useCallback, useState } from 'react';
import { useBirdStore } from './stores/useBirdStore';
import { useGameStore } from './stores/useGameStore';
import { useStationStore } from './stores/useStationStore';
import { useVisitorStore } from './stores/useVisitorStore';
import { useImagePreloader } from './hooks/useImagePreloader';
import { useStationLoop } from './hooks/useStationLoop';
import TitleScreen from './components/game/TitleScreen';
import GameScreen from './components/game/GameScreen';
import ResultsScreen from './components/game/ResultsScreen';
import FieldGuide from './components/game/FieldGuide';
import StationTitle from './components/station/StationTitle';
import StationCanvas from './components/station/StationCanvas';
import Toolbar from './components/station/Toolbar';
import TimeControl from './components/station/TimeControl';
import VisitorList from './components/station/VisitorList';
import BirdInfoCard from './components/station/BirdInfoCard';
import SessionSummary from './components/station/SessionSummary';

type AppMode = 'catcher' | 'station';

function StationPlayingScreen() {
  useStationLoop();
  const newDiscoveries = useVisitorStore((s) => s.newDiscoveries);
  const [showInfoCard, setShowInfoCard] = useState<string | null>(null);
  const [shownCards, setShownCards] = useState<readonly string[]>([]);

  useEffect(() => {
    const unshown = newDiscoveries.find((id) => !shownCards.includes(id));
    if (unshown) {
      setShowInfoCard(unshown);
    }
  }, [newDiscoveries, shownCards]);

  const handleDismissCard = useCallback(() => {
    if (showInfoCard) {
      setShownCards((prev) => [...prev, showInfoCard]);
    }
    setShowInfoCard(null);
  }, [showInfoCard]);

  return (
    <div className="flex min-h-screen flex-col gap-2 bg-night-sky p-2 md:flex-row">
      <div className="flex flex-1 flex-col gap-2">
        <TimeControl />
        <StationCanvas />
      </div>
      <div className="flex w-full flex-col gap-2 md:w-64">
        <Toolbar />
        <VisitorList />
      </div>
      {showInfoCard && (
        <BirdInfoCard birdId={showInfoCard} onDismiss={handleDismissCard} />
      )}
    </div>
  );
}

function App() {
  const fetchBirds = useBirdStore((s) => s.fetchBirds);
  const birds = useBirdStore((s) => s.birds);
  const isLoading = useBirdStore((s) => s.isLoading);
  const screen = useGameStore((s) => s.screen);
  const setScreen = useGameStore((s) => s.setScreen);
  const startNewRound = useGameStore((s) => s.startNewRound);

  const stationScreen = useStationStore((s) => s.screen);
  const fetchBehaviors = useVisitorStore((s) => s.fetchBehaviors);

  const { loaded: imagesLoaded } = useImagePreloader(birds);

  const [mode, setMode] = useState<AppMode>('station');

  useEffect(() => {
    fetchBirds();
    fetchBehaviors();
  }, [fetchBirds, fetchBehaviors]);

  const handlePlayCatcher = useCallback(() => {
    setMode('catcher');
    startNewRound();
  }, [startNewRound]);

  const handlePlayStation = useCallback(() => {
    setMode('station');
  }, []);

  const handleFieldGuide = useCallback(() => {
    setMode('catcher');
    setScreen('field-guide');
  }, [setScreen]);

  const handleBackToTitle = useCallback(() => {
    setMode('catcher');
    setScreen('title');
  }, [setScreen]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-night-sky">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-outback-gold border-t-transparent" />
      </div>
    );
  }

  // Station mode
  if (mode === 'station') {
    switch (stationScreen) {
      case 'station-title':
        return <StationTitle onPlayCatcher={handlePlayCatcher} />;
      case 'station-playing':
        return <StationPlayingScreen />;
      case 'station-summary':
        return <SessionSummary />;
      default:
        return <StationTitle onPlayCatcher={handlePlayCatcher} />;
    }
  }

  // Catcher mode
  switch (screen) {
    case 'title':
      return (
        <TitleScreen
          onPlay={handlePlayCatcher}
          onFieldGuide={handleFieldGuide}
          imagesLoaded={imagesLoaded}
        />
      );
    case 'playing':
    case 'card-reveal':
      return <GameScreen />;
    case 'results':
      return (
        <ResultsScreen
          onPlayAgain={handlePlayCatcher}
          onFieldGuide={handleFieldGuide}
        />
      );
    case 'field-guide':
      return <FieldGuide onBack={handleBackToTitle} />;
    default:
      return null;
  }
}

export default App;
```

- [ ] **Step 2: Verify compile and build**

```bash
cd /Users/dan/projects/birds-app && npx tsc --noEmit && npm run build
```

- [ ] **Step 3: Commit**

```bash
cd /Users/dan/projects/birds-app && git add src/App.tsx && git commit -m "feat(station): wire feeding station into App.tsx as default game mode"
```

---

## Task 15: Polish

**Files:**
- Modify: `src/index.css`
- All station components (review)

- [ ] **Step 1: Add station-specific keyframes to `src/index.css`**

Append the following to the end of `src/index.css` (before the `@media (prefers-reduced-motion)` block):

```css
@keyframes bird-hop {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

@keyframes bird-flee {
  0% {
    opacity: 1;
    transform: scale(1) translateX(0);
  }
  100% {
    opacity: 0;
    transform: scale(0.5) translateX(40px);
  }
}

@keyframes bird-arrive {
  0% {
    opacity: 0;
    transform: scale(0.3) translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-bird-hop {
  animation: bird-hop 0.6s ease-in-out infinite;
}

.animate-bird-flee {
  animation: bird-flee 0.4s ease-in forwards;
}

.animate-bird-arrive {
  animation: bird-arrive 0.3s ease-out forwards;
}
```

- [ ] **Step 2: Verify full build passes**

```bash
cd /Users/dan/projects/birds-app && npm run build
```

- [ ] **Step 3: Manual test checklist**

Run `npm run dev` and verify:
- Station title screen renders with stats
- Dragging items from toolbar to grid works
- Items can be moved between cells
- Double-click removes items
- Advancing phases changes background gradient
- Birds appear/disappear based on placed items
- New species shows info card
- Session summary shows correct stats
- "Play Bird Catcher instead" switches to catcher game
- Responsive layout works on mobile widths

- [ ] **Step 4: Commit**

```bash
cd /Users/dan/projects/birds-app && git add src/index.css && git commit -m "feat(station): add bird animation keyframes and polish"
```

- [ ] **Step 5: Final production build**

```bash
cd /Users/dan/projects/birds-app && npm run build
```

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Bird photos CORS on external URLs | Images may not load | Same issue already solved in Bird Catcher -- photos load as `<img>` tags |
| Drag-and-drop broken on mobile | No touch support | HTML5 drag-and-drop has limited mobile support -- add touch event fallback in a follow-up |
| Seeded random produces same visitors | Repetitive gameplay | Seed uses `Date.now()` so each evaluation differs; could add manual seed override |
| Too many visitors overwhelm grid | Visual clutter | `MAX_VISITORS_PER_PHASE` cap exists in config; interaction engine culls via fleeing |
| Zustand store conflicts between games | State leaks | Station and Catcher use separate stores with separate localStorage keys |

---

## Success Criteria

- [ ] Player can place items on grid via drag-and-drop
- [ ] Birds visit based on food preferences and habitat requirements
- [ ] Phase advancement changes which birds are active
- [ ] Bird interactions (chasing, fleeing) work correctly
- [ ] New species trigger discovery card with real photo and facts
- [ ] Collection persists across sessions via localStorage
- [ ] Session summary shows species count and discoveries
- [ ] Both Feeding Station and Bird Catcher are accessible from UI
- [ ] Production build succeeds with zero TypeScript errors
- [ ] Layout is responsive (mobile + desktop)

---

The plan file should be saved to `/Users/dan/projects/birds-app/docs/superpowers/plans/2026-04-16-feeding-station.md` and committed with:

```bash
cd /Users/dan/projects/birds-app && mkdir -p docs/superpowers/plans && git add docs/superpowers/plans/2026-04-16-feeding-station.md && git commit -m "docs: add feeding station implementation plan"
```

Key files referenced in this plan:

- **Spec**: `/Users/dan/projects/birds-app/docs/superpowers/specs/2026-04-16-feeding-station-design.md`
- **Plan output**: `/Users/dan/projects/birds-app/docs/superpowers/plans/2026-04-16-feeding-station.md`
- **Existing types**: `/Users/dan/projects/birds-app/src/types/bird.ts`
- **Existing bird data**: `/Users/dan/projects/birds-app/public/data/birds.json` (40 species)
- **Existing stores**: `/Users/dan/projects/birds-app/src/stores/useBirdStore.ts`, `/Users/dan/projects/birds-app/src/stores/useCollectionStore.ts`
- **Existing game config**: `/Users/dan/projects/birds-app/src/lib/game-config.ts`
- **App entry**: `/Users/dan/projects/birds-app/src/App.tsx`
- **Styles**: `/Users/dan/projects/birds-app/src/index.css`