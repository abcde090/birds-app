# Bird Catcher — Game Design Spec

## Overview

An arcade reflex game where real Australian bird photos fly across the screen and you click/tap to catch them. A 3-minute round simulates a day cycle (dawn → noon → dusk → night) with increasing difficulty. First-time catches reveal an educational flash card with species info and fun facts. Collected birds are saved to a persistent field guide.

**Core appeal:** Fast, satisfying arcade gameplay + real bird photography + learning about Australian wildlife without realizing you're learning.

## Game Flow

```
Title Screen → 3-minute Round → Results Screen → Field Guide / Play Again
```

### Round Structure (3 minutes total)

| Phase | Time | Sky Gradient | Bird Speed | Bird Frequency | Species Pool |
|-------|------|-------------|------------|----------------|-------------|
| Dawn | 0:00–0:45 | Gold → amber | Slow | 1 every 2s | Common only (least_concern) |
| Noon | 0:45–1:30 | Blue → sky | Medium | 1 every 1.5s | Common + near_threatened |
| Dusk | 1:30–2:15 | Orange → red | Fast | 1 every 1s | All including vulnerable/endangered |
| Night | 2:15–3:00 | Navy → black + stars | Very fast | 1 every 0.8s | Bonus: nocturnal species + everything |

## Screens

### 1. Title Screen

- Game title "Bird Catcher" with animated bird photo flying across
- "Play" button (large, obvious)
- "Field Guide" button (shows collection)
- High score display
- Stats: "X/40 species discovered"

### 2. Game Screen

**Viewport:** Full screen, landscape-oriented. Background gradient shifts smoothly through the 4 phases.

**Landscape:** Simple CSS silhouette terrain at the bottom (trees, hills) — provides grounding but doesn't compete with birds.

**HUD (top bar, semi-transparent):**
- Left: Score + combo multiplier
- Center: Phase label + countdown timer
- Right: Species collected count + misses remaining (5 max)

**Time progress bar:** Thin bar below HUD showing round progress, color matches current phase.

**Birds:**
- Fly across the viewport in random trajectories (left→right, right→left, diagonal, arcing)
- Rendered as **circular cropped real photos** (64px on mobile, 80px on desktop) with a subtle drop shadow
- Each bird has a slight bobbing motion while flying (sinusoidal y-offset)
- Speed varies by rarity (common = slow, endangered = fast)
- Multiple birds can be on screen simultaneously (max 4-5 at once)
- Birds that reach the edge without being caught count as a "miss"

**On click/tap:**
- Hit: Bird bursts with a particle effect (feather-like particles in the bird's dominant color), score pops up at click location, combo counter increments
- Miss (click empty sky): Nothing happens, no penalty for misclicking
- Bird escaped (reaches edge): Miss counter increments, screen edge flashes red briefly

**Miss limit:** 5 misses allowed. After 5, round ends early with "Game Over" instead of normal results.

### 3. First-Catch Card Reveal

When you catch a species for the first time, the game **briefly pauses** (2-3 seconds):
- Dark overlay fades in
- Card flips in from center with spring animation
- Card shows: bird photo (large), species name, scientific name, one fun fact, conservation status badge, points earned
- "Got it!" button or auto-dismiss after 3 seconds
- Game resumes

Repeat catches of the same species: no pause, just score popup with species name.

### 4. Results Screen

- Large score display with "NEW HIGH SCORE" animation if applicable
- Stats grid: birds caught, best combo, new species discovered, accuracy %
- New species cards displayed in a row (small thumbnails with gold border)
- Buttons: "Play Again" and "Field Guide"
- High score saved to localStorage

### 5. Field Guide

- Grid of all 40 birds: discovered ones show real photo + name, undiscovered show gray silhouette + "???"
- Click a discovered bird → detail overlay with full info (reuses existing BirdDetail component design: photo, name, scientific name, description, fun fact, conservation status, habitats, regions, population, diet, size)
- Progress bar: "X/40 discovered"
- Persisted in localStorage

## Bird Visuals

**Source:** Real bird photos from Wikimedia Commons (CC licensed thumbnails, ~200px).

**In-game rendering:**
- Circular crop with `border-radius: 50%` and `object-fit: cover`
- Subtle box shadow: `0 4px 12px rgba(0,0,0,0.3)`
- Size: 64px mobile, 80px desktop
- Slight rotation in direction of travel (tilted forward)
- Sinusoidal bobbing: `y += Math.sin(time * 3) * 4`

**On card reveal:** Full uncropped photo shown larger (200px+).

## Scoring

| Action | Points |
|--------|--------|
| Catch common bird (least_concern) | 50 |
| Catch uncommon bird (near_threatened) | 100 |
| Catch rare bird (vulnerable) | 150 |
| Catch very rare bird (endangered/critical) | 200 |
| First catch of any species | +50 bonus |
| Combo x2 (2 catches within 2s) | 2x multiplier |
| Combo x3 | 3x multiplier |
| Combo x5 | 5x multiplier |
| Combo x8 (max) | 8x multiplier |

Combo resets if >2 seconds pass between catches.

## Bird Flight Patterns

Birds enter from screen edges and fly across. Patterns vary to keep gameplay interesting:

- **Straight cross:** Left→right or right→left at constant height
- **Arc:** Enters low, arcs up to mid-screen, exits other side
- **Dive:** Enters from top, swoops down, exits at bottom-side
- **Zigzag:** Crosses screen with 2-3 direction changes (rare/fast birds only)

Flight path is chosen randomly per bird. Speed is base speed × phase multiplier × rarity multiplier.

## Technical Architecture

### State Management

**Game store (Zustand):**
```
gamePhase: 'title' | 'playing' | 'card-reveal' | 'results'
timeRemaining: number (seconds, counts down from 180)
currentPhase: 'dawn' | 'noon' | 'dusk' | 'night'
score: number
combo: number
comboTimer: number
misses: number
maxMisses: 5
activeBirds: FlyingBird[] (currently on screen)
caughtThisRound: string[] (bird IDs caught this round)
newSpeciesThisRound: string[] (first-time catches)
highScore: number (persisted)
```

**Collection store (Zustand, persisted to localStorage):**
```
discoveredBirdIds: string[]
totalCatches: number
gamesPlayed: number
```

### Game Loop

`requestAnimationFrame` loop runs during `playing` phase:
1. Update `timeRemaining` based on delta time
2. Determine `currentPhase` from remaining time
3. Spawn new birds at intervals (based on phase)
4. Update bird positions (move along flight path)
5. Remove birds that exit the viewport (count as miss)
6. Check for game-over conditions (misses >= 5 or time <= 0)

### Component Structure

```
src/
  components/
    game/
      TitleScreen.tsx      # Start screen with play/guide buttons
      GameScreen.tsx        # Main game viewport + HUD + birds
      FlyingBird.tsx        # Individual bird with flight animation
      GameHUD.tsx           # Score, combo, timer, misses
      CatchEffect.tsx       # Particle burst on successful catch
      CardReveal.tsx        # First-catch educational card
      ResultsScreen.tsx     # End-of-round stats + new species
      FieldGuide.tsx        # Collection grid
      FieldGuideCard.tsx    # Individual bird in the guide
    scroll/                 # (existing cinematic scroll components)
    birds/                  # (existing: ConservationBadge, HabitatTag)
    ui/                     # (existing: AnimatedCounter)
  stores/
    useGameStore.ts         # Game state
    useCollectionStore.ts   # Persistent collection (localStorage)
    useBirdStore.ts         # (existing) bird data
  lib/
    flight-paths.ts         # Flight trajectory calculations
    spawner.ts              # Bird spawn logic per phase
    biomes.ts               # (existing)
    animations.ts           # (existing)
    constants.ts            # (existing)
  hooks/
    useGameLoop.ts          # requestAnimationFrame game loop
    useBirds.ts             # (existing)
```

### Routing

Add React Router back. Two routes:
- `/` — Bird Catcher game (title → play → results loop)
- `/scroll` — Cinematic scroll experience (existing)
- Field Guide is a modal/overlay within the game, not a separate route

### Performance

- **requestAnimationFrame** for game loop — no setInterval
- **Max 5 birds on screen** at once — prevents DOM overload
- **Bird photos preloaded** at game start — no loading lag during gameplay
- **CSS transforms only** for bird movement — GPU accelerated
- **Particle effects** capped at 20 particles per catch burst, auto-cleaned after 500ms

### Persistence (localStorage)

```
bird-catcher-collection: string[]     // discovered bird IDs
bird-catcher-high-score: number
bird-catcher-games-played: number
bird-catcher-total-catches: number
```

### Responsive

- **Desktop:** Full viewport game, 80px birds, cursor becomes crosshair
- **Mobile:** Touch-friendly, 64px birds, tap to catch. HUD elements minimum 44px touch targets
- **Landscape encouraged:** Show "rotate device" prompt on mobile portrait

## Data Requirements

No new data structure needed. Existing `birds.json` has everything:
- `imageUrl` → needs updating to real Wikimedia Commons URLs
- `conservationStatus` → drives rarity/points/spawn frequency
- `commonName`, `scientificName`, `funFact` → card reveal
- `habitats`, `regions`, `diet`, `size`, `population` → field guide detail

## Out of Scope

- Sound effects (Phase 2)
- Online leaderboard / multiplayer
- Ecosystem Builder mode (Phase 2 — separate spec)
- Bird animations (flapping wings, etc.) — photos are static
- Difficulty settings — single difficulty curve via day cycle

## Success Criteria

1. Game loads in <2 seconds, no lag during gameplay (60fps)
2. Players can catch 15-25 birds in a 3-minute round
3. First-catch cards teach something memorable (fun fact sticks)
4. Field guide motivates replaying to "catch 'em all"
5. Real photos make each bird instantly recognizable
6. Works on both desktop (mouse) and mobile (touch)
