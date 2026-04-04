---
paths:
  - "src/components/game/**/*.tsx"
  - "src/stores/useGameStore.ts"
  - "src/stores/useCollectionStore.ts"
  - "src/hooks/useGameLoop.ts"
  - "src/lib/flight-paths.ts"
  - "src/lib/spawner.ts"
  - "src/lib/game-config.ts"
---

# Game Component Rules

When working on Bird Catcher game code:

1. **requestAnimationFrame only** — use `requestAnimationFrame` for the game loop. Never `setInterval` or `setTimeout` for per-frame updates.

2. **CSS transforms for movement** — bird positions use `transform: translate(x, y)`. Never `top`/`left` properties. Add `will-change: transform` on flying birds.

3. **Max 8 active birds** — never spawn more than 8 birds on screen simultaneously. Check active count before spawning.

4. **Cleanup effects** — catch effects auto-remove after 500ms. All `useEffect` hooks must return cleanup functions for timers and listeners.

5. **Preload images** — all bird photos must be preloaded before the game starts. Use `new Image()` in `useImagePreloader.ts`.

6. **Game state vs React state** — per-frame bird positions live in a ref (`birdsRef`), NOT in React state. Only update React state for HUD values (score, combo, timer) and only when they change.

7. **Phase timing** — Dawn 0:00-0:45, Noon 0:45-1:30, Dusk 1:30-2:15, Night 2:15-3:00. Total round = 180 seconds exactly.

8. **Conservation → rarity mapping** — least_concern = common (60px, slow), near_threatened = uncommon (52px), vulnerable = rare (44px, fast), endangered = very rare (36px, very fast), critical = legendary (32px, fastest).

9. **Bird photos** — use `object-top` class on all bird `<img>` tags to avoid cropping heads. Photos are external URLs from Wikimedia/BirdsInBackyards.
