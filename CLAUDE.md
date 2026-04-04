# CLAUDE.md - Development Guidelines

## Project Overview

**Bird Catcher** — An arcade reflex game where real Australian bird photos fly across the screen and you click/tap to catch them. A 3-minute round simulates a day cycle (dawn → noon → dusk → night) with increasing difficulty. First-time catches reveal an educational flash card with species info and fun facts. Collected birds are saved to a persistent field guide.

## Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 (via `@import "tailwindcss"` and `@theme` directive)
- **State**: Zustand (stores in `src/stores/`)
- **Persistence**: localStorage for collection and high scores

## Project Structure

```
src/
  components/
    game/           # Game screens and UI
      TitleScreen.tsx        # Start screen: play, field guide, high score
      GameScreen.tsx          # Main game viewport with HUD and birds
      FlyingBird.tsx          # Individual bird positioned via CSS transform
      GameHUD.tsx             # Score, combo, timer, phase, misses
      CatchEffect.tsx         # Score popup on catch
      CardReveal.tsx          # First-catch educational flash card
      ResultsScreen.tsx       # End-of-round stats and new species
      FieldGuide.tsx          # Collection grid (discovered vs undiscovered)
      BirdDetail.tsx          # Full bird detail overlay
      PhaseAnnouncement.tsx   # Big phase transition text
      ComboIndicator.tsx      # Combo multiplier burst
      MissFlash.tsx           # Screen shake on miss
    birds/          # Reusable bird UI primitives
      ConservationBadge.tsx
      HabitatTag.tsx
    ui/             # Generic UI primitives
      AnimatedCounter.tsx
  hooks/
    useGameLoop.ts          # requestAnimationFrame game loop
    useImagePreloader.ts    # Preload all bird photos before gameplay
    useBirds.ts             # Combined bird data + filter hook
  lib/
    game-config.ts          # Phase timings, speeds, scoring, rarity config
    flight-paths.ts         # Flight trajectory math (straight, arc, dive, zigzag)
    spawner.ts              # Bird spawn logic per phase
    constants.ts            # Labels, colors, icons
  stores/
    useGameStore.ts         # Game session state (score, timer, birds, screen)
    useCollectionStore.ts   # Persistent collection (localStorage)
    useBirdStore.ts         # Bird data fetching from JSON
    useFilterStore.ts       # Filter state (used by field guide)
  types/
    bird.ts                 # BirdSpecies, ConservationStatus, HabitatType
    game.ts                 # FlyingBird, GameScreen, DayPhase, FlightPattern
public/
  data/
    birds.json              # 40 Australian bird species with real photo URLs
    regions.geojson         # Australian regions (future use)
```

## Game Architecture

### Screen Flow

```
TitleScreen → GameScreen (playing) → CardReveal (on new species) → ResultsScreen → FieldGuide
```

Screens are managed via `useGameStore.screen` state — no router needed.

### Game Loop

- `requestAnimationFrame` drives the loop in `useGameLoop.ts`
- Bird positions live in a ref (not React state) to avoid per-frame re-renders
- React state only updates for HUD values (score, combo, timer) when they change
- Max 8 birds on screen at once

### Day Cycle (3 minutes)

| Phase | Time | Speed | Spawn Rate |
|-------|------|-------|------------|
| Dawn | 0:00–0:45 | 1.0x | every 1.8s |
| Noon | 0:45–1:30 | 1.4x | every 1.2s |
| Dusk | 1:30–2:15 | 1.9x | every 0.8s |
| Night | 2:15–3:00 | 2.5x | every 0.6s |

### Scoring

- Conservation status drives points: common (50) → endangered (250) → critical (300)
- Rarer birds are smaller and faster
- Combo multiplier: x2, x3, x5, x8 (2 second window)
- First catch of any species: +50 bonus
- 5 misses = game over

### Data

- Bird data lives in `public/data/birds.json` — loaded at runtime via fetch
- Photos are real Wikimedia Commons / Birds in Backyards URLs
- All types defined in `src/types/bird.ts` and `src/types/game.ts`
- Conservation statuses: `extinct`, `critically_endangered`, `endangered`, `vulnerable`, `near_threatened`, `least_concern`

### Persistence (localStorage)

- `bird-catcher-collection`: discovered bird IDs
- `bird-catcher-high-score`: best score
- `bird-catcher-games-played`: total games
- `bird-catcher-total-catches`: total birds caught

## Development Rules

> Code style, game-specific, and Tailwind rules live in `.claude/rules/`. See `code-style.md`, `game-components.md`, and `tailwind-styling.md`.

### Git Workflow

- Conventional commit prefixes: `feat()`, `fix()`, `refactor()`, `docs()`
- Commit frequently
- Run `npm run build` before pushing

### Performance

- Preload all 40 bird images before gameplay starts
- Cap particles/effects and auto-clean after 500ms
- Stagger spawns — never create all birds at once

### Accessibility

- All images must have meaningful `alt` text
- Touch targets minimum 44x44px on mobile
- `prefers-reduced-motion` support in CSS
