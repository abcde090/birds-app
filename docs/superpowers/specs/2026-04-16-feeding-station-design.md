# Feeding Station — Game Design Spec

## Overview

A strategic puzzle game where you build a bird feeding station in an Australian backyard. Place food, water, and vegetation to attract 40 real bird species. Each species has unique behavior — territorial birds bully smaller ones, shy birds need cover, predators scare everyone. The puzzle: you can't attract all birds at once, so you must strategically manage your setup across time of day and sessions.

## Phase 1 (MVP — Frontend Game)

### Screen Flow

```
Title Screen → Station Builder (playing) → Bird Info Card (on new species) → Session Summary → Collection / Play Again
```

Screens managed via Zustand store state — no router.

### Game Screen Layout

**Canvas area (80% of viewport):**
- Top-down view of a backyard
- Grid-based placement system (8x6 grid)
- Drag food/water/vegetation from a toolbar onto the grid
- Birds appear and animate on the canvas based on what you've placed

**Toolbar (bottom or side panel):**
- Food items: Nectar Feeder, Seed Tray, Fruit Dish, Mealworms, Bird Bath, Fish Pond
- Vegetation: Dense Shrub, Eucalyptus Tree, Dead Log, Rocks
- Each item has a cost (budget per session = 10 items)

**HUD:**
- Time of day indicator + skip button (Dawn → Morning → Afternoon → Dusk → Night)
- Species visiting count
- Collection progress (X/40)
- Current visitors list with behavior status

### Time System

Not real-time — the player controls pace. Each "time period" is a phase:

| Phase | Duration | What happens |
|-------|----------|-------------|
| Dawn | Player-controlled | Most active. Songbirds, honeyeaters arrive first |
| Morning | Player-controlled | Parrots, cockatoos arrive. Territorial conflicts begin |
| Afternoon | Player-controlled | Quieter. Raptors may fly over |
| Dusk | Player-controlled | Last visitors. Kookaburras, eagles |
| Night | Player-controlled | Owls, frogmouths. All day birds gone |

Player clicks "Next Phase" to advance. Between phases, they can rearrange their setup.

### Bird Behavior Engine (Deterministic Rules)

Each bird species has a behavior profile in code:

```ts
interface BirdBehavior {
  id: string;                        // matches birds.json
  foodPreferences: FoodType[];       // what food attracts it
  requiredHabitat: HabitatFeature[]; // vegetation/features needed
  activePhases: TimePhase[];         // when it's active
  size: 'tiny' | 'small' | 'medium' | 'large' | 'huge';
  temperament: 'shy' | 'cautious' | 'bold' | 'aggressive';
  flocking: boolean;                 // arrives in groups?
  scaredBy: string[];                // bird IDs that scare this species
  chases: string[];                  // bird IDs this species chases away
  attractedBy: string[];             // bird IDs whose presence attracts this species
}
```

**Visit decision logic (per phase):**
1. Check if any preferred food is placed → if not, skip
2. Check if required habitat features are present → if not, skip
3. Check if this phase is in activePhases → if not, skip
4. Check if any scaredBy birds are currently visiting → if yes, show as "watching" but don't visit
5. Check if any attractedBy birds are present → if yes, boost visit chance
6. If temperament is shy, check if shrub cover is within 2 grid squares of food → if not, skip
7. Roll a weighted random based on remaining factors → visit or skip

**Interaction rules:**
- Aggressive birds chase shy/cautious birds from the same food source
- Large birds prevent tiny birds from feeding at the same station
- Predators (owls, eagles) arriving clears all smaller birds
- Flocking birds: if one visits, 1-3 more arrive next phase
- Chain reactions: Fairy-wrens follow Kookaburras (safety), Ibis eat anything

### Scoring / Collection

- First visit by a species = "New Species Discovered!" card (similar to Bird Catcher)
- Card shows: real photo, name, scientific name, fun fact, behavior description
- Collection persists in localStorage across sessions
- No points — the goal is 40/40 species discovered
- Stats tracked: total sessions, species per session, most common visitor

### Bird Animations

- Birds appear at the edge of canvas and walk/hop/fly to their preferred food
- Idle animations: pecking, bathing, looking around
- Chase animations: aggressive bird charges, small bird flees
- Flee animation: all birds scatter when predator arrives
- CSS transforms + requestAnimationFrame, same pattern as Bird Catcher

### Data Model

Extend birds.json with behavior data, or create a separate `bird-behaviors.json`:

```json
{
  "laughing-kookaburra": {
    "foodPreferences": ["mealworms", "fish_pond"],
    "requiredHabitat": ["eucalyptus"],
    "activePhases": ["dawn", "morning", "dusk"],
    "size": "medium",
    "temperament": "bold",
    "flocking": false,
    "scaredBy": ["wedge-tailed-eagle"],
    "chases": ["noisy-miner"],
    "attractedBy": []
  }
}
```

### Component Structure

```
src/
  components/
    game/                    # Keep existing Bird Catcher components
    station/                 # New feeding station game
      StationTitle.tsx       # Title screen for feeding station
      StationCanvas.tsx      # Main game canvas (grid + birds)
      GridCell.tsx            # Individual grid cell (droppable)
      PlacedItem.tsx          # Rendered food/vegetation on grid
      Toolbar.tsx             # Draggable items palette
      ToolbarItem.tsx         # Individual draggable item
      VisitorBird.tsx         # Bird on canvas with behavior animation
      BirdInfoCard.tsx        # New species discovery card
      VisitorList.tsx         # Side panel showing current visitors
      TimeControl.tsx         # Phase indicator + skip button
      SessionSummary.tsx      # End of session stats
      StationFieldGuide.tsx   # Collection grid (reuse pattern from Bird Catcher)
  stores/
    useStationStore.ts       # Grid state, placed items, time phase
    useVisitorStore.ts       # Current visiting birds, behavior states
    useCollectionStore.ts    # (existing) persistent collection
  lib/
    bird-behaviors.ts        # Behavior profiles for all 40 species
    visit-engine.ts          # Decision logic: evaluate station → determine visitors
    interaction-engine.ts    # Bird-to-bird interaction rules
    station-config.ts        # Grid size, item costs, phase timings
  hooks/
    useStationLoop.ts        # Game loop: evaluate visitors per phase
    useDragDrop.ts           # Drag and drop logic for placing items
  types/
    station.ts               # StationGrid, PlacedItem, FoodType, TimePhase, BirdVisit
  public/
    data/
      bird-behaviors.json    # Behavior profiles for all 40 species
```

### Persistence (localStorage)

- `bird-station-collection`: discovered bird IDs (shared with Bird Catcher)
- `bird-station-sessions`: total sessions played
- `bird-station-best`: most species in one session

## Phase 2 (AI Agent Layer — Future)

### Claude API Integration
- Bird Decision Agent: for complex multi-factor visit decisions
- Interaction Engine: for emergent multi-bird behavior
- Hint Agent: RAG-powered suggestions when player is stuck
- Session Reporter: generates natural language summary of what happened

### MCP Server
- Expose bird data + behavior as MCP tools
- Claude Code can query the bird database natively
- Tools: search_birds, get_behavior, simulate_station

### RAG
- Bird knowledge base for the hint agent
- Chunks: species descriptions, behavior data, habitat requirements
- Query: "How do I attract a Fairy-wren?" → retrieves relevant species data

## Success Criteria

1. Player understands within 30 seconds: place food → birds come
2. Within 2 minutes: discovers that bird interactions are the real game
3. Each species feels distinct — different food, behavior, timing
4. "I need to come back to get the last 5 species" — replayability
5. Every new species teaches something real about Australian birds
6. Smooth drag-and-drop on desktop and mobile
