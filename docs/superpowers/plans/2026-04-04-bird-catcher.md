# Bird Catcher Game — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an arcade reflex game where real Australian bird photos fly across the screen, players click/tap to catch them, and first catches reveal educational flash cards. A 3-minute day cycle drives difficulty progression.

**Architecture:** Single-page app with Zustand screen states (title/playing/card-reveal/results/field-guide). A `requestAnimationFrame` game loop drives bird spawning, movement, and timing. Bird positions live in a ref (not React state) to avoid per-frame re-renders. React state only updates for HUD values when they change.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS v4, Zustand (state + localStorage persistence)

**Spec:** `docs/superpowers/specs/2026-04-04-bird-catcher-design.md`

---

## File Map

### New files

| File | Responsibility |
|------|---------------|
| `src/types/game.ts` | Game types: FlyingBird, FlightPath, GamePhase, DayPhase |
| `src/stores/useGameStore.ts` | Game state: phase, score, combo, timer, active birds, misses |
| `src/stores/useCollectionStore.ts` | Persistent collection: discovered bird IDs, stats (localStorage) |
| `src/lib/flight-paths.ts` | Flight trajectory math: straight, arc, dive, zigzag |
| `src/lib/spawner.ts` | Bird spawn logic: pick species by rarity, create FlyingBird |
| `src/lib/game-config.ts` | Constants: phase timings, speeds, scoring, combo thresholds |
| `src/hooks/useGameLoop.ts` | requestAnimationFrame loop: spawn, move, remove, check game-over |
| `src/hooks/useImagePreloader.ts` | Preload all 40 bird photos before gameplay |
| `src/components/game/TitleScreen.tsx` | Start screen: title, play button, field guide button, high score |
| `src/components/game/GameScreen.tsx` | Main game viewport: background, terrain, birds, HUD |
| `src/components/game/FlyingBird.tsx` | Single flying bird: circular photo, positioned via transform |
| `src/components/game/GameHUD.tsx` | Top HUD bar: score, combo, timer, phase, misses |
| `src/components/game/CatchEffect.tsx` | Particle burst on catch + score popup |
| `src/components/game/CardReveal.tsx` | First-catch educational card overlay |
| `src/components/game/ResultsScreen.tsx` | End-of-round stats, new species, play again |
| `src/components/game/FieldGuide.tsx` | Collection grid: discovered vs undiscovered birds |
| `src/components/game/BirdDetail.tsx` | Full bird detail overlay (from field guide) |

### Modified files

| File | Change |
|------|--------|
| `src/App.tsx` | Replace shell with game screen router (Zustand-driven) |
| `src/index.css` | Add game-specific keyframes (catch burst, score float) |
| `src/main.tsx` | No changes needed (already clean) |

### Existing files (reused as-is)

| File | Used by |
|------|---------|
| `src/stores/useBirdStore.ts` | GameScreen, spawner, FieldGuide |
| `src/types/bird.ts` | Everything |
| `src/lib/constants.ts` | CardReveal, FieldGuide, BirdDetail |
| `src/components/birds/ConservationBadge.tsx` | CardReveal, BirdDetail |
| `src/components/birds/HabitatTag.tsx` | BirdDetail |
| `src/components/ui/AnimatedCounter.tsx` | ResultsScreen |

---

## Task 1: Game Types and Config

**Files:**
- Create: `src/types/game.ts`
- Create: `src/lib/game-config.ts`

- [ ] **Step 1: Create `src/types/game.ts`**

```ts
import type { BirdSpecies, ConservationStatus } from './bird';

export type GameScreen = 'title' | 'playing' | 'card-reveal' | 'results' | 'field-guide';
export type DayPhase = 'dawn' | 'noon' | 'dusk' | 'night';
export type FlightPattern = 'straight' | 'arc' | 'dive' | 'zigzag';

export interface FlyingBird {
  id: string;
  species: BirdSpecies;
  x: number;
  y: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  progress: number; // 0-1 along flight path
  speed: number; // pixels per second
  pattern: FlightPattern;
  direction: 1 | -1; // 1 = left-to-right, -1 = right-to-left
  spawnTime: number;
}

export interface CatchEffectData {
  id: string;
  x: number;
  y: number;
  score: number;
  birdName: string;
  spawnTime: number;
}
```

- [ ] **Step 2: Create `src/lib/game-config.ts`**

```ts
import type { ConservationStatus } from '../types/bird';
import type { DayPhase, FlightPattern } from '../types/game';

export const ROUND_DURATION = 180; // 3 minutes in seconds

export const PHASE_CONFIG: Record<DayPhase, {
  startTime: number;
  endTime: number;
  label: string;
  emoji: string;
  spawnInterval: number; // seconds between spawns
  speedMultiplier: number;
  gradientFrom: string;
  gradientTo: string;
  allowedStatuses: ConservationStatus[];
}> = {
  dawn: {
    startTime: 180,
    endTime: 135,
    label: 'Dawn',
    emoji: '🌅',
    spawnInterval: 2,
    speedMultiplier: 0.7,
    gradientFrom: '#fde68a',
    gradientTo: '#f59e0b',
    allowedStatuses: ['least_concern'],
  },
  noon: {
    startTime: 135,
    endTime: 90,
    label: 'Noon',
    emoji: '☀️',
    spawnInterval: 1.5,
    speedMultiplier: 1.0,
    gradientFrom: '#7dd3fc',
    gradientTo: '#bae6fd',
    allowedStatuses: ['least_concern', 'near_threatened'],
  },
  dusk: {
    startTime: 90,
    endTime: 45,
    label: 'Dusk',
    emoji: '🌆',
    spawnInterval: 1.0,
    speedMultiplier: 1.4,
    gradientFrom: '#ea580c',
    gradientTo: '#dc2626',
    allowedStatuses: ['least_concern', 'near_threatened', 'vulnerable', 'endangered', 'critically_endangered'],
  },
  night: {
    startTime: 45,
    endTime: 0,
    label: 'Night',
    emoji: '🌙',
    spawnInterval: 0.8,
    speedMultiplier: 1.8,
    gradientFrom: '#1e293b',
    gradientTo: '#0f172a',
    allowedStatuses: ['least_concern', 'near_threatened', 'vulnerable', 'endangered', 'critically_endangered'],
  },
};

export const RARITY_CONFIG: Record<ConservationStatus, {
  basePoints: number;
  speedMultiplier: number;
  spawnWeight: number;
}> = {
  least_concern: { basePoints: 50, speedMultiplier: 1.0, spawnWeight: 10 },
  near_threatened: { basePoints: 100, speedMultiplier: 1.2, spawnWeight: 5 },
  vulnerable: { basePoints: 150, speedMultiplier: 1.5, spawnWeight: 3 },
  endangered: { basePoints: 200, speedMultiplier: 1.8, spawnWeight: 1 },
  critically_endangered: { basePoints: 200, speedMultiplier: 2.0, spawnWeight: 1 },
  extinct: { basePoints: 0, speedMultiplier: 0, spawnWeight: 0 },
};

export const FIRST_CATCH_BONUS = 50;
export const MAX_MISSES = 5;
export const MAX_ACTIVE_BIRDS = 5;
export const COMBO_WINDOW = 2; // seconds
export const COMBO_THRESHOLDS = [2, 3, 5, 8] as const;
export const BASE_BIRD_SPEED = 120; // pixels per second
export const BIRD_SIZE_DESKTOP = 80;
export const BIRD_SIZE_MOBILE = 64;
export const CATCH_EFFECT_DURATION = 500; // ms
export const CARD_REVEAL_DURATION = 3000; // ms

export const FLIGHT_PATTERNS: FlightPattern[] = ['straight', 'arc', 'dive', 'zigzag'];

export function getPhaseForTime(timeRemaining: number): DayPhase {
  if (timeRemaining > 135) return 'dawn';
  if (timeRemaining > 90) return 'noon';
  if (timeRemaining > 45) return 'dusk';
  return 'night';
}

export function getComboMultiplier(combo: number): number {
  if (combo >= 8) return 8;
  if (combo >= 5) return 5;
  if (combo >= 3) return 3;
  if (combo >= 2) return 2;
  return 1;
}
```

- [ ] **Step 3: Verify build**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/types/game.ts src/lib/game-config.ts
git commit -m "feat: add game types and config constants"
```

---

## Task 2: Game Store and Collection Store

**Files:**
- Create: `src/stores/useGameStore.ts`
- Create: `src/stores/useCollectionStore.ts`

- [ ] **Step 1: Create `src/stores/useGameStore.ts`**

```ts
import { create } from 'zustand';
import type { GameScreen, DayPhase, FlyingBird, CatchEffectData } from '../types/game';
import { getPhaseForTime } from '../lib/game-config';

interface GameStore {
  // Screen
  screen: GameScreen;
  setScreen: (screen: GameScreen) => void;

  // Timer
  timeRemaining: number;
  currentPhase: DayPhase;
  setTimeRemaining: (time: number) => void;

  // Score
  score: number;
  combo: number;
  lastCatchTime: number;
  addScore: (points: number) => void;
  incrementCombo: () => void;
  resetCombo: () => void;

  // Misses
  misses: number;
  addMiss: () => void;

  // Birds
  activeBirds: FlyingBird[];
  setActiveBirds: (birds: FlyingBird[]) => void;

  // Catch effects
  catchEffects: CatchEffectData[];
  addCatchEffect: (effect: CatchEffectData) => void;
  removeCatchEffect: (id: string) => void;

  // Round tracking
  caughtThisRound: string[];
  newSpeciesThisRound: string[];
  addCatch: (birdId: string, isNew: boolean) => void;

  // Card reveal
  revealBirdId: string | null;
  setRevealBirdId: (id: string | null) => void;

  // High score
  highScore: number;
  setHighScore: (score: number) => void;

  // Reset
  startNewRound: () => void;
}

const loadHighScore = (): number => {
  const stored = localStorage.getItem('bird-catcher-high-score');
  return stored ? parseInt(stored, 10) : 0;
};

export const useGameStore = create<GameStore>((set, get) => ({
  screen: 'title',
  setScreen: (screen) => set({ screen }),

  timeRemaining: 180,
  currentPhase: 'dawn',
  setTimeRemaining: (time) => set({
    timeRemaining: time,
    currentPhase: getPhaseForTime(time),
  }),

  score: 0,
  combo: 0,
  lastCatchTime: 0,
  addScore: (points) => set((s) => ({ score: s.score + points })),
  incrementCombo: () => set((s) => ({ combo: s.combo + 1, lastCatchTime: Date.now() })),
  resetCombo: () => set({ combo: 0 }),

  misses: 0,
  addMiss: () => set((s) => ({ misses: s.misses + 1 })),

  activeBirds: [],
  setActiveBirds: (birds) => set({ activeBirds: birds }),

  catchEffects: [],
  addCatchEffect: (effect) => set((s) => ({ catchEffects: [...s.catchEffects, effect] })),
  removeCatchEffect: (id) => set((s) => ({
    catchEffects: s.catchEffects.filter((e) => e.id !== id),
  })),

  caughtThisRound: [],
  newSpeciesThisRound: [],
  addCatch: (birdId, isNew) => set((s) => ({
    caughtThisRound: [...s.caughtThisRound, birdId],
    newSpeciesThisRound: isNew ? [...s.newSpeciesThisRound, birdId] : s.newSpeciesThisRound,
  })),

  revealBirdId: null,
  setRevealBirdId: (id) => set({ revealBirdId: id }),

  highScore: loadHighScore(),
  setHighScore: (score) => {
    localStorage.setItem('bird-catcher-high-score', String(score));
    set({ highScore: score });
  },

  startNewRound: () => set({
    screen: 'playing',
    timeRemaining: 180,
    currentPhase: 'dawn',
    score: 0,
    combo: 0,
    lastCatchTime: 0,
    misses: 0,
    activeBirds: [],
    catchEffects: [],
    caughtThisRound: [],
    newSpeciesThisRound: [],
    revealBirdId: null,
  }),
}));
```

- [ ] **Step 2: Create `src/stores/useCollectionStore.ts`**

```ts
import { create } from 'zustand';

interface CollectionStore {
  discoveredBirdIds: string[];
  totalCatches: number;
  gamesPlayed: number;
  discoverBird: (id: string) => void;
  addCatch: () => void;
  addGame: () => void;
  isDiscovered: (id: string) => boolean;
}

const loadCollection = (): { discoveredBirdIds: string[]; totalCatches: number; gamesPlayed: number } => {
  const ids = localStorage.getItem('bird-catcher-collection');
  const catches = localStorage.getItem('bird-catcher-total-catches');
  const games = localStorage.getItem('bird-catcher-games-played');
  return {
    discoveredBirdIds: ids ? JSON.parse(ids) : [],
    totalCatches: catches ? parseInt(catches, 10) : 0,
    gamesPlayed: games ? parseInt(games, 10) : 0,
  };
};

const saveCollection = (ids: string[], catches: number, games: number) => {
  localStorage.setItem('bird-catcher-collection', JSON.stringify(ids));
  localStorage.setItem('bird-catcher-total-catches', String(catches));
  localStorage.setItem('bird-catcher-games-played', String(games));
};

export const useCollectionStore = create<CollectionStore>((set, get) => {
  const initial = loadCollection();
  return {
    ...initial,

    discoverBird: (id) => {
      const state = get();
      if (state.discoveredBirdIds.includes(id)) return;
      const updated = [...state.discoveredBirdIds, id];
      saveCollection(updated, state.totalCatches, state.gamesPlayed);
      set({ discoveredBirdIds: updated });
    },

    addCatch: () => {
      const state = get();
      const updated = state.totalCatches + 1;
      saveCollection(state.discoveredBirdIds, updated, state.gamesPlayed);
      set({ totalCatches: updated });
    },

    addGame: () => {
      const state = get();
      const updated = state.gamesPlayed + 1;
      saveCollection(state.discoveredBirdIds, state.totalCatches, updated);
      set({ gamesPlayed: updated });
    },

    isDiscovered: (id) => get().discoveredBirdIds.includes(id),
  };
});
```

- [ ] **Step 3: Verify build**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/stores/useGameStore.ts src/stores/useCollectionStore.ts
git commit -m "feat: add game store and persistent collection store"
```

---

## Task 3: Flight Paths and Spawner

**Files:**
- Create: `src/lib/flight-paths.ts`
- Create: `src/lib/spawner.ts`

- [ ] **Step 1: Create `src/lib/flight-paths.ts`**

```ts
import type { FlightPattern } from '../types/game';

interface Viewport {
  width: number;
  height: number;
}

interface FlightEndpoints {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export function generateFlightEndpoints(
  pattern: FlightPattern,
  direction: 1 | -1,
  viewport: Viewport,
): FlightEndpoints {
  const margin = 100;
  const enterX = direction === 1 ? -margin : viewport.width + margin;
  const exitX = direction === 1 ? viewport.width + margin : -margin;
  const minY = 60; // below HUD
  const maxY = viewport.height - 100; // above terrain

  switch (pattern) {
    case 'straight': {
      const y = minY + Math.random() * (maxY - minY);
      return { startX: enterX, startY: y, endX: exitX, endY: y };
    }
    case 'arc': {
      const startY = maxY - Math.random() * (maxY - minY) * 0.3;
      const endY = startY;
      return { startX: enterX, startY, endX: exitX, endY };
    }
    case 'dive': {
      const startY = minY + Math.random() * (maxY - minY) * 0.3;
      const endY = maxY - Math.random() * (maxY - minY) * 0.2;
      return { startX: enterX, startY, endX: exitX, endY };
    }
    case 'zigzag': {
      const y = minY + Math.random() * (maxY - minY);
      return { startX: enterX, startY: y, endX: exitX, endY: y };
    }
  }
}

export function interpolatePosition(
  pattern: FlightPattern,
  progress: number,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  time: number,
): { x: number; y: number } {
  const t = progress;
  const baseX = startX + (endX - startX) * t;
  const baseY = startY + (endY - startY) * t;

  // Add bobbing to all patterns
  const bob = Math.sin(time * 3) * 4;

  switch (pattern) {
    case 'straight':
      return { x: baseX, y: baseY + bob };
    case 'arc': {
      // Parabolic arc: peaks at midpoint
      const arcHeight = -120 * Math.sin(t * Math.PI);
      return { x: baseX, y: baseY + arcHeight + bob };
    }
    case 'dive':
      return { x: baseX, y: baseY + bob };
    case 'zigzag': {
      // Sinusoidal zigzag
      const zigzag = Math.sin(t * Math.PI * 3) * 60;
      return { x: baseX, y: baseY + zigzag + bob };
    }
  }
}
```

- [ ] **Step 2: Create `src/lib/spawner.ts`**

```ts
import type { BirdSpecies, ConservationStatus } from '../types/bird';
import type { DayPhase, FlyingBird, FlightPattern } from '../types/game';
import { PHASE_CONFIG, RARITY_CONFIG, BASE_BIRD_SPEED, FLIGHT_PATTERNS } from './game-config';
import { generateFlightEndpoints } from './flight-paths';

let nextId = 0;

function pickWeightedRandom<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((sum, w) => sum + w, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return items[i];
  }
  return items[items.length - 1];
}

export function spawnBird(
  birds: BirdSpecies[],
  phase: DayPhase,
  viewport: { width: number; height: number },
): FlyingBird | null {
  const config = PHASE_CONFIG[phase];

  // Filter birds by allowed statuses for this phase
  const eligible = birds.filter((b) =>
    config.allowedStatuses.includes(b.conservationStatus),
  );

  if (eligible.length === 0) return null;

  // Weight by rarity
  const weights = eligible.map(
    (b) => RARITY_CONFIG[b.conservationStatus].spawnWeight,
  );

  const species = pickWeightedRandom(eligible, weights);
  const rarityConfig = RARITY_CONFIG[species.conservationStatus];

  const pattern: FlightPattern = pickWeightedRandom(
    FLIGHT_PATTERNS,
    species.conservationStatus === 'least_concern'
      ? [10, 5, 3, 0] // common birds don't zigzag
      : [5, 5, 5, 5],
  );

  const direction: 1 | -1 = Math.random() > 0.5 ? 1 : -1;
  const endpoints = generateFlightEndpoints(pattern, direction, viewport);
  const speed = BASE_BIRD_SPEED * config.speedMultiplier * rarityConfig.speedMultiplier;

  return {
    id: `bird-${nextId++}`,
    species,
    x: endpoints.startX,
    y: endpoints.startY,
    startX: endpoints.startX,
    startY: endpoints.startY,
    endX: endpoints.endX,
    endY: endpoints.endY,
    progress: 0,
    speed,
    pattern,
    direction,
    spawnTime: performance.now() / 1000,
  };
}
```

- [ ] **Step 3: Verify build**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/lib/flight-paths.ts src/lib/spawner.ts
git commit -m "feat: add flight path math and bird spawner"
```

---

## Task 4: Game Loop Hook and Image Preloader

**Files:**
- Create: `src/hooks/useGameLoop.ts`
- Create: `src/hooks/useImagePreloader.ts`

- [ ] **Step 1: Create `src/hooks/useImagePreloader.ts`**

```ts
import { useState, useEffect } from 'react';
import type { BirdSpecies } from '../types/bird';

export function useImagePreloader(birds: BirdSpecies[]): {
  loaded: boolean;
  progress: number;
} {
  const [loadedCount, setLoadedCount] = useState(0);
  const total = birds.length;

  useEffect(() => {
    if (total === 0) return;

    let count = 0;

    birds.forEach((bird) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        count++;
        setLoadedCount(count);
      };
      img.src = bird.imageUrl;
    });
  }, [birds, total]);

  return {
    loaded: total > 0 && loadedCount >= total,
    progress: total > 0 ? loadedCount / total : 0,
  };
}
```

- [ ] **Step 2: Create `src/hooks/useGameLoop.ts`**

```ts
import { useRef, useCallback, useEffect } from 'react';
import { useGameStore } from '../stores/useGameStore';
import { useCollectionStore } from '../stores/useCollectionStore';
import { useBirdStore } from '../stores/useBirdStore';
import { spawnBird } from '../lib/spawner';
import { interpolatePosition } from '../lib/flight-paths';
import {
  PHASE_CONFIG,
  RARITY_CONFIG,
  FIRST_CATCH_BONUS,
  MAX_MISSES,
  MAX_ACTIVE_BIRDS,
  COMBO_WINDOW,
  getPhaseForTime,
  getComboMultiplier,
} from '../lib/game-config';
import type { FlyingBird } from '../types/game';

export function useGameLoop() {
  const lastFrameRef = useRef(0);
  const lastSpawnRef = useRef(0);
  const rafRef = useRef(0);
  const birdsRef = useRef<FlyingBird[]>([]);

  const gameStore = useGameStore;
  const collectionStore = useCollectionStore;
  const allBirds = useBirdStore((s) => s.birds);

  const tick = useCallback(
    (timestamp: number) => {
      const state = gameStore.getState();
      if (state.screen !== 'playing') return;

      const delta = lastFrameRef.current === 0 ? 0.016 : (timestamp - lastFrameRef.current) / 1000;
      lastFrameRef.current = timestamp;

      // Clamp delta to prevent huge jumps on tab switch
      const dt = Math.min(delta, 0.1);

      // Update timer
      const newTime = Math.max(0, state.timeRemaining - dt);
      const newPhase = getPhaseForTime(newTime);

      // Check combo timeout
      const now = Date.now();
      if (state.combo > 0 && (now - state.lastCatchTime) / 1000 > COMBO_WINDOW) {
        gameStore.setState({ combo: 0 });
      }

      // Spawn birds
      const phaseConfig = PHASE_CONFIG[newPhase];
      const timeSinceSpawn = timestamp / 1000 - lastSpawnRef.current;
      if (timeSinceSpawn >= phaseConfig.spawnInterval && birdsRef.current.length < MAX_ACTIVE_BIRDS) {
        const viewport = { width: window.innerWidth, height: window.innerHeight };
        const newBird = spawnBird(allBirds, newPhase, viewport);
        if (newBird) {
          birdsRef.current = [...birdsRef.current, newBird];
          lastSpawnRef.current = timestamp / 1000;
        }
      }

      // Update bird positions
      let missesThisFrame = 0;
      const currentTime = timestamp / 1000;

      birdsRef.current = birdsRef.current
        .map((bird) => {
          const elapsed = currentTime - bird.spawnTime;
          const totalDistance = Math.sqrt(
            (bird.endX - bird.startX) ** 2 + (bird.endY - bird.startY) ** 2,
          );
          const duration = totalDistance / bird.speed;
          const progress = Math.min(elapsed / duration, 1);

          const pos = interpolatePosition(
            bird.pattern,
            progress,
            bird.startX,
            bird.startY,
            bird.endX,
            bird.endY,
            currentTime,
          );

          return { ...bird, x: pos.x, y: pos.y, progress };
        })
        .filter((bird) => {
          if (bird.progress >= 1) {
            missesThisFrame++;
            return false;
          }
          return true;
        });

      // Apply state updates
      const totalMisses = state.misses + missesThisFrame;
      const isGameOver = newTime <= 0 || totalMisses >= MAX_MISSES;

      gameStore.setState({
        timeRemaining: newTime,
        currentPhase: newPhase,
        activeBirds: birdsRef.current,
        misses: totalMisses,
      });

      if (isGameOver) {
        const finalScore = gameStore.getState().score;
        if (finalScore > state.highScore) {
          gameStore.getState().setHighScore(finalScore);
        }
        collectionStore.getState().addGame();
        gameStore.setState({ screen: 'results' });
        birdsRef.current = [];
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    },
    [allBirds, gameStore, collectionStore],
  );

  const start = useCallback(() => {
    lastFrameRef.current = 0;
    lastSpawnRef.current = 0;
    birdsRef.current = [];
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  const catchBird = useCallback(
    (birdId: string, clickX: number, clickY: number) => {
      const state = gameStore.getState();
      const bird = birdsRef.current.find((b) => b.id === birdId);
      if (!bird) return;

      // Remove bird from active
      birdsRef.current = birdsRef.current.filter((b) => b.id !== birdId);

      // Calculate score
      const rarityConfig = RARITY_CONFIG[bird.species.conservationStatus];
      const isNew = !collectionStore.getState().isDiscovered(bird.species.id);
      const basePoints = rarityConfig.basePoints + (isNew ? FIRST_CATCH_BONUS : 0);

      // Update combo
      gameStore.getState().incrementCombo();
      const comboMultiplier = getComboMultiplier(state.combo + 1);
      const totalPoints = basePoints * comboMultiplier;

      // Apply
      gameStore.getState().addScore(totalPoints);
      gameStore.getState().addCatch(bird.species.id, isNew);
      collectionStore.getState().addCatch();

      if (isNew) {
        collectionStore.getState().discoverBird(bird.species.id);
      }

      // Add catch effect
      gameStore.getState().addCatchEffect({
        id: `effect-${Date.now()}`,
        x: clickX,
        y: clickY,
        score: totalPoints,
        birdName: bird.species.commonName,
        spawnTime: Date.now(),
      });

      // Show card reveal for new species
      if (isNew) {
        gameStore.setState({
          screen: 'card-reveal',
          revealBirdId: bird.species.id,
          activeBirds: birdsRef.current,
        });
        stop();
      } else {
        gameStore.setState({ activeBirds: birdsRef.current });
      }
    },
    [gameStore, collectionStore, stop],
  );

  const resumeAfterReveal = useCallback(() => {
    gameStore.setState({ screen: 'playing', revealBirdId: null });
    lastFrameRef.current = 0;
    rafRef.current = requestAnimationFrame(tick);
  }, [gameStore, tick]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return { start, stop, catchBird, resumeAfterReveal };
}
```

- [ ] **Step 3: Verify build**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useGameLoop.ts src/hooks/useImagePreloader.ts
git commit -m "feat: add game loop hook and image preloader"
```

---

## Task 5: Game UI Components — FlyingBird, GameHUD, CatchEffect

**Files:**
- Create: `src/components/game/FlyingBird.tsx`
- Create: `src/components/game/GameHUD.tsx`
- Create: `src/components/game/CatchEffect.tsx`

- [ ] **Step 1: Create `src/components/game/FlyingBird.tsx`**

```tsx
import type { FlyingBird as FlyingBirdType } from '../../types/game';
import { BIRD_SIZE_DESKTOP, BIRD_SIZE_MOBILE } from '../../lib/game-config';

interface Props {
  bird: FlyingBirdType;
  onClick: (birdId: string, x: number, y: number) => void;
}

export default function FlyingBird({ bird, onClick }: Props) {
  const size = window.innerWidth >= 768 ? BIRD_SIZE_DESKTOP : BIRD_SIZE_MOBILE;
  const rotation = bird.direction === 1 ? 5 : -5;

  return (
    <button
      className="absolute cursor-pointer border-none bg-transparent p-0"
      style={{
        transform: `translate(${bird.x - size / 2}px, ${bird.y - size / 2}px) rotate(${rotation}deg)`,
        width: size,
        height: size,
        willChange: 'transform',
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(bird.id, e.clientX, e.clientY);
      }}
      aria-label={`Catch ${bird.species.commonName}`}
    >
      <img
        src={bird.species.imageUrl}
        alt={bird.species.commonName}
        className="h-full w-full rounded-full object-cover"
        style={{
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}
        draggable={false}
      />
    </button>
  );
}
```

- [ ] **Step 2: Create `src/components/game/GameHUD.tsx`**

```tsx
import { useGameStore } from '../../stores/useGameStore';
import { useCollectionStore } from '../../stores/useCollectionStore';
import { PHASE_CONFIG, MAX_MISSES, ROUND_DURATION, getComboMultiplier } from '../../lib/game-config';

export default function GameHUD() {
  const score = useGameStore((s) => s.score);
  const combo = useGameStore((s) => s.combo);
  const timeRemaining = useGameStore((s) => s.timeRemaining);
  const currentPhase = useGameStore((s) => s.currentPhase);
  const misses = useGameStore((s) => s.misses);
  const caughtThisRound = useGameStore((s) => s.caughtThisRound);
  const discoveredCount = useCollectionStore((s) => s.discoveredBirdIds.length);

  const phaseConfig = PHASE_CONFIG[currentPhase];
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = Math.floor(timeRemaining % 60);
  const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  const progress = 1 - timeRemaining / ROUND_DURATION;
  const comboMultiplier = getComboMultiplier(combo);

  return (
    <div className="pointer-events-none absolute left-0 right-0 top-0 z-30">
      {/* HUD bar */}
      <div className="flex items-center justify-between bg-black/40 px-4 py-2 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <span className="font-mono text-lg font-bold text-white">
            ⭐ {score.toLocaleString()}
          </span>
          {combo >= 2 && (
            <span className="font-mono text-sm font-bold text-outback-gold">
              🔥 x{comboMultiplier}
            </span>
          )}
        </div>

        <div className="text-center">
          <span className="text-sm font-semibold text-white">
            {phaseConfig.emoji} {phaseConfig.label} — {timeStr}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-white">🃏 {discoveredCount}/40</span>
          <span className="text-sm text-white">
            {'❌'.repeat(misses)}
            {'⬜'.repeat(MAX_MISSES - misses)}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-black/20">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${progress * 100}%`,
            backgroundColor: phaseConfig.gradientFrom,
          }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `src/components/game/CatchEffect.tsx`**

```tsx
import { useEffect } from 'react';
import { useGameStore } from '../../stores/useGameStore';
import { CATCH_EFFECT_DURATION } from '../../lib/game-config';

export default function CatchEffect() {
  const effects = useGameStore((s) => s.catchEffects);
  const removeCatchEffect = useGameStore((s) => s.removeCatchEffect);

  useEffect(() => {
    effects.forEach((effect) => {
      const age = Date.now() - effect.spawnTime;
      if (age > CATCH_EFFECT_DURATION) {
        removeCatchEffect(effect.id);
      }
    });

    if (effects.length === 0) return;

    const timer = setTimeout(() => {
      const now = Date.now();
      effects.forEach((effect) => {
        if (now - effect.spawnTime > CATCH_EFFECT_DURATION) {
          removeCatchEffect(effect.id);
        }
      });
    }, CATCH_EFFECT_DURATION);

    return () => clearTimeout(timer);
  }, [effects, removeCatchEffect]);

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {effects.map((effect) => (
        <div
          key={effect.id}
          className="absolute animate-score-float text-center"
          style={{
            left: effect.x,
            top: effect.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="font-mono text-xl font-bold text-outback-gold drop-shadow-lg">
            +{effect.score}
          </div>
          <div className="text-xs font-medium text-white drop-shadow-lg">
            {effect.birdName}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Add score-float keyframe to `src/index.css`**

Append to the existing keyframes section:

```css
@keyframes score-float {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -120%) scale(1.3);
  }
}

.animate-score-float {
  animation: score-float 0.5s ease-out forwards;
}
```

- [ ] **Step 5: Verify build**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add src/components/game/FlyingBird.tsx src/components/game/GameHUD.tsx src/components/game/CatchEffect.tsx src/index.css
git commit -m "feat: add FlyingBird, GameHUD, and CatchEffect components"
```

---

## Task 6: CardReveal — Educational Flash Card

**Files:**
- Create: `src/components/game/CardReveal.tsx`

- [ ] **Step 1: Create `src/components/game/CardReveal.tsx`**

```tsx
import { useEffect } from 'react';
import { useGameStore } from '../../stores/useGameStore';
import { useBirdStore } from '../../stores/useBirdStore';
import ConservationBadge from '../birds/ConservationBadge';
import { CARD_REVEAL_DURATION } from '../../lib/game-config';

interface Props {
  onDismiss: () => void;
}

export default function CardReveal({ onDismiss }: Props) {
  const revealBirdId = useGameStore((s) => s.revealBirdId);
  const getBirdBySlug = useBirdStore((s) => s.getBirdBySlug);

  const bird = revealBirdId ? getBirdBySlug(revealBirdId) : null;

  useEffect(() => {
    if (!bird) return;
    const timer = setTimeout(onDismiss, CARD_REVEAL_DURATION);
    return () => clearTimeout(timer);
  }, [bird, onDismiss]);

  if (!bird) return null;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-xs animate-card-flip overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="relative h-40 bg-sand-200">
          <img
            src={bird.imageUrl}
            alt={bird.commonName}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="p-5 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-outback-gold">
            ✨ New Species!
          </p>
          <h3 className="mt-1 font-serif text-xl font-bold text-bark-900">
            {bird.commonName}
          </h3>
          <p className="text-xs italic text-bark-400">{bird.scientificName}</p>

          <div className="mt-3 rounded-lg bg-sand-100 p-3">
            <p className="text-sm text-bark-700">🧠 {bird.funFact}</p>
          </div>

          <div className="mt-3">
            <ConservationBadge status={bird.conservationStatus} />
          </div>

          <button
            onClick={onDismiss}
            className="mt-4 rounded-full bg-outback-gold px-6 py-2 text-sm font-bold text-deep-bark transition-colors hover:bg-outback-orange hover:text-white"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add card-flip keyframe to `src/index.css`**

Append:

```css
@keyframes card-flip {
  0% {
    opacity: 0;
    transform: scale(0.5) rotateY(90deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.05) rotateY(0deg);
  }
  100% {
    transform: scale(1) rotateY(0deg);
  }
}

.animate-card-flip {
  animation: card-flip 0.4s ease-out forwards;
}
```

- [ ] **Step 3: Verify build**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/components/game/CardReveal.tsx src/index.css
git commit -m "feat: add CardReveal educational flash card component"
```

---

## Task 7: TitleScreen and ResultsScreen

**Files:**
- Create: `src/components/game/TitleScreen.tsx`
- Create: `src/components/game/ResultsScreen.tsx`

- [ ] **Step 1: Create `src/components/game/TitleScreen.tsx`**

```tsx
import { useGameStore } from '../../stores/useGameStore';
import { useCollectionStore } from '../../stores/useCollectionStore';

interface Props {
  onPlay: () => void;
  onFieldGuide: () => void;
  imagesLoaded: boolean;
}

export default function TitleScreen({ onPlay, onFieldGuide, imagesLoaded }: Props) {
  const highScore = useGameStore((s) => s.highScore);
  const discoveredCount = useCollectionStore((s) => s.discoveredBirdIds.length);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-outback-gold to-outback-orange px-6">
      <h1 className="font-serif text-6xl font-bold text-deep-bark md:text-8xl">
        Bird Catcher
      </h1>
      <p className="mt-2 text-lg text-deep-bark/70">
        Catch Australian birds before they fly away!
      </p>

      <div className="mt-8 flex flex-col items-center gap-4">
        <button
          onClick={onPlay}
          disabled={!imagesLoaded}
          className="rounded-full bg-deep-bark px-12 py-4 text-xl font-bold text-outback-gold transition-transform hover:scale-105 disabled:opacity-50"
        >
          {imagesLoaded ? 'Play' : 'Loading...'}
        </button>

        <button
          onClick={onFieldGuide}
          className="rounded-full border-2 border-deep-bark/30 px-8 py-3 font-semibold text-deep-bark transition-colors hover:bg-deep-bark/10"
        >
          Field Guide 🃏
        </button>
      </div>

      <div className="mt-8 flex gap-8 text-center">
        <div>
          <p className="font-mono text-2xl font-bold text-deep-bark">
            {highScore.toLocaleString()}
          </p>
          <p className="text-sm text-deep-bark/60">High Score</p>
        </div>
        <div>
          <p className="font-mono text-2xl font-bold text-deep-bark">
            {discoveredCount}/40
          </p>
          <p className="text-sm text-deep-bark/60">Discovered</p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/game/ResultsScreen.tsx`**

```tsx
import { useGameStore } from '../../stores/useGameStore';
import { useBirdStore } from '../../stores/useBirdStore';

interface Props {
  onPlayAgain: () => void;
  onFieldGuide: () => void;
}

export default function ResultsScreen({ onPlayAgain, onFieldGuide }: Props) {
  const score = useGameStore((s) => s.score);
  const highScore = useGameStore((s) => s.highScore);
  const caughtThisRound = useGameStore((s) => s.caughtThisRound);
  const newSpeciesThisRound = useGameStore((s) => s.newSpeciesThisRound);
  const misses = useGameStore((s) => s.misses);
  const getBirdBySlug = useBirdStore((s) => s.getBirdBySlug);

  const isNewHighScore = score >= highScore && score > 0;
  const accuracy =
    caughtThisRound.length + misses > 0
      ? Math.round(
          (caughtThisRound.length / (caughtThisRound.length + misses)) * 100,
        )
      : 0;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-night-sky to-bark-900 px-6">
      {isNewHighScore && (
        <p className="mb-2 animate-pulse text-sm font-bold uppercase tracking-widest text-outback-gold">
          🎉 New High Score!
        </p>
      )}

      <p className="font-mono text-6xl font-bold text-white">
        {score.toLocaleString()}
      </p>
      <p className="mt-1 text-sm text-white/40">
        Best: {highScore.toLocaleString()}
      </p>

      <div className="mt-8 grid grid-cols-3 gap-6 text-center">
        <div className="rounded-xl bg-white/5 p-4">
          <p className="text-2xl font-bold text-white">
            {caughtThisRound.length}
          </p>
          <p className="text-xs text-white/50">Caught</p>
        </div>
        <div className="rounded-xl bg-white/5 p-4">
          <p className="text-2xl font-bold text-outback-gold">
            {newSpeciesThisRound.length}
          </p>
          <p className="text-xs text-white/50">New Species</p>
        </div>
        <div className="rounded-xl bg-white/5 p-4">
          <p className="text-2xl font-bold text-white">{accuracy}%</p>
          <p className="text-xs text-white/50">Accuracy</p>
        </div>
      </div>

      {newSpeciesThisRound.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-center text-xs uppercase tracking-widest text-white/40">
            New species discovered
          </p>
          <div className="flex gap-3">
            {newSpeciesThisRound.map((id) => {
              const bird = getBirdBySlug(id);
              if (!bird) return null;
              return (
                <div
                  key={id}
                  className="flex h-16 w-16 flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-outback-gold bg-white"
                >
                  <img
                    src={bird.imageUrl}
                    alt={bird.commonName}
                    className="h-full w-full object-cover"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-8 flex gap-4">
        <button
          onClick={onPlayAgain}
          className="rounded-full bg-outback-gold px-8 py-3 font-bold text-deep-bark transition-transform hover:scale-105"
        >
          Play Again
        </button>
        <button
          onClick={onFieldGuide}
          className="rounded-full border border-white/20 bg-white/10 px-8 py-3 font-bold text-white transition-colors hover:bg-white/20"
        >
          Field Guide 🃏
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/components/game/TitleScreen.tsx src/components/game/ResultsScreen.tsx
git commit -m "feat: add TitleScreen and ResultsScreen components"
```

---

## Task 8: GameScreen — Main Game Viewport

**Files:**
- Create: `src/components/game/GameScreen.tsx`

- [ ] **Step 1: Create `src/components/game/GameScreen.tsx`**

```tsx
import { useEffect } from 'react';
import { useGameStore } from '../../stores/useGameStore';
import { useGameLoop } from '../../hooks/useGameLoop';
import { PHASE_CONFIG } from '../../lib/game-config';
import FlyingBird from './FlyingBird';
import GameHUD from './GameHUD';
import CatchEffect from './CatchEffect';
import CardReveal from './CardReveal';

export default function GameScreen() {
  const screen = useGameStore((s) => s.screen);
  const currentPhase = useGameStore((s) => s.currentPhase);
  const activeBirds = useGameStore((s) => s.activeBirds);
  const { start, stop, catchBird, resumeAfterReveal } = useGameLoop();

  const phaseConfig = PHASE_CONFIG[currentPhase];

  useEffect(() => {
    if (screen === 'playing') {
      start();
    }
    return () => stop();
  }, [screen, start, stop]);

  return (
    <div
      className="relative h-screen w-screen cursor-crosshair overflow-hidden"
      style={{
        background: `linear-gradient(180deg, ${phaseConfig.gradientFrom}, ${phaseConfig.gradientTo})`,
        transition: 'background 2s ease',
      }}
    >
      <GameHUD />

      {/* Terrain silhouette */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div
          className="h-20 w-full"
          style={{
            background: 'linear-gradient(0deg, #1b3d1b, #2d5f2d88)',
            borderRadius: '40% 60% 0 0',
          }}
        />
      </div>

      {/* Flying birds */}
      {activeBirds.map((bird) => (
        <FlyingBird key={bird.id} bird={bird} onClick={catchBird} />
      ))}

      <CatchEffect />

      {/* Card reveal overlay */}
      {screen === 'card-reveal' && (
        <CardReveal onDismiss={resumeAfterReveal} />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/game/GameScreen.tsx
git commit -m "feat: add GameScreen with background, terrain, birds, and HUD"
```

---

## Task 9: FieldGuide and BirdDetail

**Files:**
- Create: `src/components/game/FieldGuide.tsx`
- Create: `src/components/game/BirdDetail.tsx`

- [ ] **Step 1: Create `src/components/game/BirdDetail.tsx`**

```tsx
import type { BirdSpecies } from '../../types/bird';
import ConservationBadge from '../birds/ConservationBadge';
import HabitatTag from '../birds/HabitatTag';
import { REGION_NAMES } from '../../lib/constants';

interface Props {
  bird: BirdSpecies;
  onClose: () => void;
}

export default function BirdDetail({ bird, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-sand-200 text-bark-700 hover:bg-sand-300"
          aria-label="Close detail view"
        >
          ✕
        </button>

        <div className="h-48 overflow-hidden rounded-2xl bg-sand-200">
          <img
            src={bird.imageUrl}
            alt={bird.commonName}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="mt-4">
          <h2 className="font-serif text-2xl font-bold text-bark-900">
            {bird.commonName}
          </h2>
          <p className="text-sm italic text-bark-400">{bird.scientificName}</p>
          <p className="text-xs text-bark-400">
            {bird.family} · {bird.order}
          </p>
        </div>

        <div className="mt-3">
          <ConservationBadge status={bird.conservationStatus} />
        </div>

        <p className="mt-4 text-sm leading-relaxed text-bark-700">
          {bird.description}
        </p>

        <div className="mt-4 rounded-xl bg-sand-100 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-bark-400">
            Fun Fact
          </p>
          <p className="mt-1 text-sm text-bark-700">{bird.funFact}</p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-center">
          <div className="rounded-xl bg-sand-100 p-3">
            <p className="font-mono text-lg font-bold text-eucalyptus-500">
              {bird.population.current.toLocaleString()}
            </p>
            <p className="text-xs text-bark-400">
              Population ({bird.population.lastSurveyYear})
            </p>
          </div>
          <div className="rounded-xl bg-sand-100 p-3">
            <p className="font-mono text-lg font-bold text-eucalyptus-500">
              {bird.size.lengthCm} cm
            </p>
            <p className="text-xs text-bark-400">Length</p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-bark-400">
            Diet
          </p>
          <p className="mt-1 text-sm text-bark-700">{bird.diet}</p>
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-bark-400">
            Habitats
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {bird.habitats.map((h) => (
              <HabitatTag key={h} habitat={h} />
            ))}
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-bark-400">
            Regions
          </p>
          <p className="mt-1 text-sm text-bark-700">
            {bird.regions.map((r) => REGION_NAMES[r]).join(', ')}
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/game/FieldGuide.tsx`**

```tsx
import { useState } from 'react';
import { useBirdStore } from '../../stores/useBirdStore';
import { useCollectionStore } from '../../stores/useCollectionStore';
import type { BirdSpecies } from '../../types/bird';
import BirdDetail from './BirdDetail';

interface Props {
  onBack: () => void;
}

export default function FieldGuide({ onBack }: Props) {
  const birds = useBirdStore((s) => s.birds);
  const discoveredBirdIds = useCollectionStore((s) => s.discoveredBirdIds);
  const [selectedBird, setSelectedBird] = useState<BirdSpecies | null>(null);

  return (
    <div className="min-h-screen bg-sand-100 px-4 py-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={onBack}
            className="rounded-full bg-sand-200 px-4 py-2 text-sm font-semibold text-bark-700 hover:bg-sand-300"
          >
            ← Back
          </button>
          <h2 className="font-serif text-2xl font-bold text-bark-900">
            Field Guide
          </h2>
          <p className="text-sm text-bark-400">
            {discoveredBirdIds.length}/40 discovered
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-6 h-2 overflow-hidden rounded-full bg-sand-300">
          <div
            className="h-full rounded-full bg-outback-gold transition-all"
            style={{ width: `${(discoveredBirdIds.length / 40) * 100}%` }}
          />
        </div>

        {/* Bird grid */}
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
          {birds.map((bird) => {
            const isDiscovered = discoveredBirdIds.includes(bird.id);
            return (
              <button
                key={bird.id}
                onClick={() => isDiscovered && setSelectedBird(bird)}
                className={`flex flex-col items-center overflow-hidden rounded-xl border-2 p-2 transition-transform ${
                  isDiscovered
                    ? 'border-outback-gold bg-white shadow-sm hover:scale-105'
                    : 'cursor-default border-dashed border-sand-300 bg-sand-200'
                }`}
                disabled={!isDiscovered}
              >
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg">
                  {isDiscovered ? (
                    <img
                      src={bird.imageUrl}
                      alt={bird.commonName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl opacity-20">🐦</span>
                  )}
                </div>
                <p
                  className={`mt-1 text-center text-[10px] font-semibold leading-tight ${
                    isDiscovered ? 'text-bark-900' : 'text-bark-400'
                  }`}
                >
                  {isDiscovered ? bird.commonName : '???'}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {selectedBird && (
        <BirdDetail bird={selectedBird} onClose={() => setSelectedBird(null)} />
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/components/game/FieldGuide.tsx src/components/game/BirdDetail.tsx
git commit -m "feat: add FieldGuide collection grid and BirdDetail overlay"
```

---

## Task 10: Wire Everything in App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Update `src/App.tsx`**

```tsx
import { useEffect, useCallback } from 'react';
import { useBirdStore } from './stores/useBirdStore';
import { useGameStore } from './stores/useGameStore';
import { useImagePreloader } from './hooks/useImagePreloader';
import TitleScreen from './components/game/TitleScreen';
import GameScreen from './components/game/GameScreen';
import ResultsScreen from './components/game/ResultsScreen';
import FieldGuide from './components/game/FieldGuide';

function App() {
  const fetchBirds = useBirdStore((s) => s.fetchBirds);
  const birds = useBirdStore((s) => s.birds);
  const isLoading = useBirdStore((s) => s.isLoading);
  const screen = useGameStore((s) => s.screen);
  const setScreen = useGameStore((s) => s.setScreen);
  const startNewRound = useGameStore((s) => s.startNewRound);

  const { loaded: imagesLoaded } = useImagePreloader(birds);

  useEffect(() => {
    fetchBirds();
  }, [fetchBirds]);

  const handlePlay = useCallback(() => {
    startNewRound();
  }, [startNewRound]);

  const handleFieldGuide = useCallback(() => {
    setScreen('field-guide');
  }, [setScreen]);

  const handleBackToTitle = useCallback(() => {
    setScreen('title');
  }, [setScreen]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-night-sky">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-outback-gold border-t-transparent" />
      </div>
    );
  }

  switch (screen) {
    case 'title':
      return (
        <TitleScreen
          onPlay={handlePlay}
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
          onPlayAgain={handlePlay}
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

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Run dev server and test**

Run: `npm run dev`
Expected: Title screen loads, Play starts the game, birds fly across, clicking catches them, card reveals work, results show after 3 minutes.

- [ ] **Step 4: Run production build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire Bird Catcher game screens in App.tsx"
```

---

## Summary

| Task | What it builds | New files |
|------|---------------|-----------|
| 1 | Game types and config constants | 2 |
| 2 | Game store + collection store (localStorage) | 2 |
| 3 | Flight path math + bird spawner | 2 |
| 4 | Game loop (rAF) + image preloader | 2 |
| 5 | FlyingBird + GameHUD + CatchEffect | 3 + CSS |
| 6 | CardReveal (educational flash card) | 1 + CSS |
| 7 | TitleScreen + ResultsScreen | 2 |
| 8 | GameScreen (main viewport) | 1 |
| 9 | FieldGuide + BirdDetail | 2 |
| 10 | Wire everything in App.tsx | 0 (modify 1) |
