---
name: scroll-check
description: Run a full quality check on the scroll experience — build, types, lint, component sizes, animation audit
allowed-tools: Read Grep Glob Bash(npx tsc*) Bash(npm run *)
---

# Scroll Quality Check

Run a comprehensive quality check on the cinematic scroll experience.

## Checks to Run (in order)

1. **TypeScript** — `npx tsc --noEmit`. Report any type errors.

2. **Lint** — `npm run lint`. Report any lint errors.

3. **Component sizes** — Check every `.tsx` file in `src/components/scroll/`. Report any file over 200 lines with the exact line count.

4. **Animation safety** — Grep for these anti-patterns:
   - `whileInView` without `viewport={{ once: true }}` (causes re-triggers)
   - Animations on layout properties (`width`, `height`, `top`, `left`)
   - `staggerChildren` with value > 0.5 (too slow for many items)
   - ParticleField `count` prop > 50

5. **Accessibility** — Grep for:
   - `<section` without `aria-label`
   - `<img` without `alt`
   - Interactive elements (`<button`, `onClick`) without accessible name

6. **Biome coverage** — Check that every habitat in `HabitatType` has a matching entry in `BIOME_CONFIGS`. Report any gaps.

7. **Build** — `npm run build`. Report success or failure.

## Output

Summary table:
| Check | Status | Issues |
|-------|--------|--------|
| TypeScript | PASS/FAIL | count |
| Lint | PASS/FAIL | count |
| Component sizes | PASS/WARN | list of large files |
| Animation safety | PASS/WARN | list of issues |
| Accessibility | PASS/WARN | list of issues |
| Biome coverage | PASS/FAIL | missing biomes |
| Build | PASS/FAIL | — |
