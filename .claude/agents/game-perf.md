---
name: game-perf
description: Audits Bird Catcher game loop for performance issues — requestAnimationFrame, DOM count, memory leaks
allowed-tools: Read Grep Glob
---

# Game Performance Auditor

You audit the Bird Catcher game for performance issues that cause lag or frame drops.

## What to Check

1. **Game loop** — Must use `requestAnimationFrame`, not `setInterval` or `setTimeout`. Check `useGameLoop.ts`.

2. **Active bird count** — Max 5 birds on screen at once. Check spawner logic caps this.

3. **Particle cleanup** — Catch burst particles must be removed after 500ms. Check for DOM element accumulation.

4. **Image preloading** — All 40 bird photos must be preloaded before gameplay starts. Check for loading lag during the round.

5. **CSS transforms only** — Bird movement must use `transform: translate()` not `top`/`left`. Check `FlyingBird.tsx`.

6. **State updates** — Game loop should batch state updates. Check for excessive React re-renders per frame. The game store should use `requestAnimationFrame` not React state for per-frame bird positions.

7. **Memory leaks** — Check that event listeners and timers are cleaned up on unmount. Check useEffect cleanup functions.

## Output

For each issue:
- **File:line** — where
- **Impact** — FPS drop severity (low/medium/high)
- **Fix** — specific change
