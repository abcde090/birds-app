# CLAUDE.md - Development Guidelines

## Project Overview

**Feeding Station** — A strategic puzzle game where you build a bird feeding station in an Australian backyard. Drag food, water, and vegetation onto a grid to attract real Australian bird species. Each species has unique behavior — aggressive birds bully smaller ones, shy birds need cover, scavengers flock to junk food. The goal is to discover all 40 species by building the right combinations.

**Note:** This is a sister project to [bird-catcher](https://github.com/abcde090/bird-catcher) — an arcade reflex game using the same bird dataset.

## Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 (via `@import "tailwindcss"` and `@theme` directive)
- **State**: Zustand (stores in `src/stores/`)
- **Persistence**: localStorage for collection progress
- **Data**: 40 Australian bird species with real Wikimedia/Birds in Backyards photos

## Project Structure

```
src/
  components/
    station/          # Feeding Station game components
      StationTitle.tsx        # Title screen — start new session
      StationCanvas.tsx       # 8x6 grid where you place items
      GridCell.tsx            # Individual droppable grid cell
      PlacedItem.tsx          # A placed food/vegetation item (draggable)
      Toolbar.tsx             # Palette of food + vegetation items
      ToolbarItem.tsx         # Individual draggable toolbar item
      VisitorBird.tsx         # A bird visiting the station (with hover tooltip)
      VisitorList.tsx         # Side panel showing current visitors (with flock counts)
      BirdInfoCard.tsx        # New species discovery modal
      SessionSummary.tsx      # End-of-session stats
    birds/            # Reusable bird UI primitives (shared)
      ConservationBadge.tsx
      HabitatTag.tsx
    ui/               # Generic UI primitives
      AnimatedCounter.tsx
  hooks/
    useStationLoop.ts         # Re-evaluates visitors when grid changes
    useDragDrop.ts            # HTML5 drag/drop handlers
    useImagePreloader.ts      # Preloads all 40 bird photos
    useBirds.ts               # Combined bird data + filter hook
  lib/
    visit-engine.ts           # Core logic: which birds visit which food items
    interaction-engine.ts     # Bird-to-bird interactions (chase, flock, predator)
    station-config.ts         # Grid size, item definitions, budget
    constants.ts              # Labels, colors, icons
  stores/
    useStationStore.ts        # Station state (grid, placed items, budget)
    useVisitorStore.ts        # Current visitors + discovery tracking
    useBirdStore.ts           # Bird data fetching from JSON
    useCollectionStore.ts     # Persistent collection (localStorage)
    useFilterStore.ts         # Filter state (for future field guide)
  types/
    station.ts                # PlacedItem, BirdVisit, BirdBehavior, FoodType, etc.
    bird.ts                   # BirdSpecies, ConservationStatus, HabitatType
public/
  data/
    birds.json                # 40 Australian bird species with real photo URLs
    bird-behaviors.json       # Behavior profiles (food prefs, habitat, temperament)
    regions.geojson           # Australian regions (unused currently)
```

## Game Architecture

### Screen Flow

```
StationTitle → StationPlaying (place items, birds visit) → SessionSummary
```

Screen state lives in `useStationStore.screen` — no router needed.

### Core Game Loop

**There is no time-based loop.** The game re-evaluates visitors whenever the player changes the grid (places, moves, or removes items).

1. Player drags an item from the toolbar onto the grid
2. `useStationStore` updates `placedItems`
3. `useStationLoop` detects the change and calls `evaluateVisitors()`
4. `visit-engine.ts` determines which birds visit which food items (deterministic per-item seed)
5. `interaction-engine.ts` resolves bird-vs-bird conflicts (aggressive chases, predator fear)
6. `useVisitorStore` is updated with new visitors
7. React re-renders the canvas with visiting birds clustered around their food

### Visit Engine (`src/lib/visit-engine.ts`)

The heart of the game. For each placed food item, it loops through all 40 birds and asks:

1. **Food preference** — does this bird like this specific food?
2. **Required habitat** — are the habitat features this bird needs present anywhere on the grid? (e.g. kookaburra needs a eucalyptus tree)
3. **Shy check** — if temperament is `shy`, is there a dense shrub within 2 grid squares of any food?
4. **Visit roll** — weighted by temperament (aggressive 0.75, bold 0.75, cautious 0.55, shy 0.35)
5. **Flock size** — flocking species arrive as 2–3 copies; solitary birds alone

**Determinism:** The seed for each `(bird, food)` pair is derived from `hashString(food.id)`. This means the same food item always attracts the same birds — moving the food doesn't change who visits it, only where they're shown.

### Interaction Engine (`src/lib/interaction-engine.ts`)

Runs after the visit engine. Three passes:

1. **Aggressive chase** — birds with `aggressive` temperament chase birds in their `chases` list, OR any bird ≥2 size categories smaller at the same food item
2. **Predator clearing** — huge aggressive birds (eagles) set any tiny/small/medium bird to `fleeing`
3. **Flock events** — flocking species emit `flock_arrive` events

Note: The UI currently hides `fleeing` and `watching` states for clarity. The interaction engine still runs but its effects are mostly invisible. Future enhancement: show chase animations and "scared away" notifications.

### Data Model

**BirdSpecies** (`src/types/bird.ts`) — the basic bird data (name, photo, conservation status, etc.) from `birds.json`

**BirdBehavior** (`src/types/station.ts`) — game-specific behavior from `bird-behaviors.json`:
```ts
{
  foodPreferences: FoodType[]     // what food this bird eats
  requiredHabitat: HabitatFeature[]  // habitat features needed to visit
  size: 'tiny' | 'small' | 'medium' | 'large' | 'huge'
  temperament: 'shy' | 'cautious' | 'bold' | 'aggressive'
  flocking: boolean               // arrives in groups of 2-3?
  scaredBy: string[]              // bird IDs that scare this species
  chases: string[]                // bird IDs this species chases away
  attractedBy: string[]           // bird IDs that boost this bird's visit chance
}
```

**FoodType** (7 items):
- `nectar_feeder` 🍯 — lorikeets, honeyeaters
- `seed_tray` 🌾 — parrots, cockatoos, galahs
- `fruit_dish` 🍎 — bowerbirds, king parrots
- `mealworms` 🐛 — kookaburras, magpies, insectivores
- `bird_bath` 💧 — universal water source
- `fish_pond` 🐟 — kingfishers, pelicans, sea eagles
- `junk_food` 🍟 — ibis, magpies, noisy miners (scavengers)

**HabitatFeature** (4 items):
- `dense_shrub` 🌿 — cover for shy birds (required for fairy-wrens)
- `eucalyptus_tree` 🌲 — perching (required for kookaburras, cockatoos)
- `dead_log` 🪵 — insect foraging (required for lyrebirds, bowerbirds)
- `rocks` 🪨 — required for raptors (eagles, falcons)

### Grid & Budget

- **Grid size**: 8 columns × 6 rows (48 cells) — see `GRID_COLS`, `GRID_ROWS` in `station-config.ts`
- **Budget**: 10 items per session — see `SESSION_BUDGET`
- Removing an item refunds the budget
- Moving an item doesn't cost anything

### Persistence (localStorage)

- `bird-station-sessions`: total sessions played (number)
- `bird-station-best`: best session species count (number)
- `bird-catcher-collection`: discovered bird IDs (string[]) — shared with Bird Catcher repo

## Frontend Design Context (for UI design work)

**Current visual direction:** Dark mode (`bg-night-sky`) with earthy accents. It works functionally but looks generic.

**Current color palette** (from `src/index.css`):
- `night-sky` (#0f172a) — main background
- `outback-gold` (#f59e0b) — primary accent (buttons, headings)
- `eucalyptus-*` (green shades) — UI panels and secondary surfaces
- `sand-*` (warm neutrals) — body text on dark backgrounds
- `bark-*` (cool grays) — muted text
- `deep-bark` (#451a03) — text on gold surfaces

**Typography:**
- `font-serif` (DM Serif Display) — titles, bird names
- `font-sans` (Inter) — body text
- `font-mono` (JetBrains Mono) — numbers, stats

**Design problems to solve:**
1. The grid looks like a teal spreadsheet — it should evoke an actual Australian backyard
2. Placed items are just emojis — they have no visual depth or context
3. The toolbar is cramped — items are hard to distinguish at a glance
4. No sense of environment/weather/light
5. Visitor birds are small circles floating on cells — they should feel like they're inhabiting the scene
6. No ambient motion — the scene is static between bird arrivals
7. Info density is low but the layout feels busy — needs better visual hierarchy
8. No delightful micro-interactions when birds arrive or flocks gather

**Design constraints to respect:**
- Must work on desktop AND mobile (responsive)
- Drag-and-drop is the core interaction — don't break HTML5 DnD affordances
- Grid must remain an 8×6 grid — bird positions depend on row/col
- Each cell must visibly indicate valid drop targets during drag
- Bird photos are the hero — they must be clearly visible
- The visitor list is the main educational surface — keep it scannable
- Dark mode is the baseline, but a light/daytime mode could work

**What I'd love to see in a redesigned UI:**
- A backyard that feels lived-in (grass textures, sky depth, maybe clouds drifting)
- Placed items with proper illustrations or SVG art (not just emojis)
- Birds that perch naturally on items (not float above cells)
- Smooth arrival animations when birds appear
- A visual language for food "attraction strength" (glow, particles)
- Clear visual hierarchy: canvas is the focus, toolbar/list are support
- A sense of scale — the viewer should feel like they're looking *at* a garden, not *through* a spreadsheet

## Development Rules

> Code style, game-specific, and Tailwind rules live in `.claude/rules/`. See `code-style.md`, `game-components.md`, and `tailwind-styling.md`.

### Git Workflow

- Conventional commit prefixes: `feat()`, `fix()`, `refactor()`, `docs()`
- Commit frequently
- Run `npm run build` before pushing

### Performance

- Images lazy-loaded with `loading="lazy"` on `<img>` tags
- Visitor re-evaluation is deterministic and fast (~ms) — runs synchronously on state change
- Re-evaluation triggers: item count change, initial mount
- React state only updates when the visitor set actually changes

### Accessibility

- All bird images have meaningful `alt` text
- Touch targets minimum 44x44px on mobile
- `prefers-reduced-motion` support in CSS
- Grid cells have `role="gridcell"` and aria labels
- Drag-and-drop has keyboard fallback (not yet implemented — future work)

## Out of Scope (Future Phases)

- Claude API integration for hint agent ("what birds should I try to attract next?")
- MCP server exposing bird data as tools
- RAG-powered bird expert chat
- User-created challenges ("attract 5 endangered species in one session")
- Sound — bird calls, ambient nature audio
- Seasons and weather effects
- Multiplayer garden competitions
