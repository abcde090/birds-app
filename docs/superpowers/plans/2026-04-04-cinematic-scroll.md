# Cinematic Scroll Experience — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a scroll-driven cinematic experience showcasing 40 Australian bird species across 9 biomes with parallax animations, bird entrance reveals, a conservation spotlight, and an interactive collection grid.

**Architecture:** Single-page scroll app. Framer Motion's `useScroll`/`useTransform` drives all scroll-linked animations. Each biome is a reusable `<BiomeChapter>` component configured via a biome config object. Existing Zustand stores and `useBirds` hook power the collection grid. No routing needed.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS v4, Framer Motion, Zustand, Recharts

**Spec:** `docs/superpowers/specs/2026-04-04-cinematic-scroll-design.md`

---

## File Map

### New files

| File | Responsibility |
|------|---------------|
| `src/lib/biomes.ts` | Biome config objects: colors, terrain, particle effects, bird IDs, animation styles |
| `src/lib/animations.ts` | Reusable Framer Motion variants for bird entrances (soar, fade, drop, waddle, burst, emerge) |
| `src/hooks/useScrollProgress.ts` | Thin wrapper around `useScroll()` exposing global scroll progress 0–1 |
| `src/components/scroll/HeroSection.tsx` | Night sky, star particles, title animation, scroll indicator |
| `src/components/scroll/ParticleField.tsx` | Reusable animated particles (stars, rain, mist, dust, snow, heat shimmer) |
| `src/components/scroll/DawnTransition.tsx` | Gradient shift from night→dawn, nocturnal bird reveals |
| `src/components/scroll/BiomeChapter.tsx` | Reusable biome section: gradient BG, parallax layers, bird reveals |
| `src/components/scroll/BiomeBackground.tsx` | Parallax terrain layers (foreground, midground, background) |
| `src/components/scroll/BirdReveal.tsx` | Individual bird entrance animation + info card |
| `src/components/scroll/ConservationSpotlight.tsx` | Desaturated section with endangered species hero treatment |
| `src/components/scroll/CollectionGrid.tsx` | Filterable card grid reusing existing stores |
| `src/components/scroll/BirdCard.tsx` | Card for collection grid: photo placeholder, status, habitats |
| `src/components/scroll/BirdDetail.tsx` | Expanded detail overlay with full bird data |
| `src/components/scroll/ClosingSection.tsx` | Conservation CTA, credits, share button |
| `src/components/scroll/ScrollProgress.tsx` | Thin fixed progress bar at top of viewport |

### Modified files

| File | Change |
|------|--------|
| `src/App.tsx` | Replace shell with scroll sections composed in order |
| `src/index.css` | Add new theme colors for biome palette, remove leaflet import |
| `src/main.tsx` | Remove `BrowserRouter` wrapper (no routing needed) |
| `src/lib/constants.ts` | Add `CONSERVATION_COLORS_NEW` using spec palette |

### Existing files (reused as-is)

| File | Used by |
|------|---------|
| `src/stores/useBirdStore.ts` | CollectionGrid, BiomeChapter, ConservationSpotlight |
| `src/stores/useFilterStore.ts` | CollectionGrid |
| `src/hooks/useBirds.ts` | CollectionGrid |
| `src/types/bird.ts` | Everything |
| `src/components/birds/ConservationBadge.tsx` | BirdReveal, BirdCard |
| `src/components/birds/HabitatTag.tsx` | BirdCard, BirdDetail |
| `src/components/ui/AnimatedCounter.tsx` | ConservationSpotlight |

---

## Task 1: Foundation — Theme, Biome Configs, Animation Variants

**Files:**
- Modify: `src/index.css`
- Modify: `src/main.tsx`
- Modify: `src/lib/constants.ts`
- Create: `src/lib/biomes.ts`
- Create: `src/lib/animations.ts`
- Create: `src/hooks/useScrollProgress.ts`

- [ ] **Step 1: Update index.css — add biome palette colors, remove leaflet**

Replace the leaflet import and add new biome colors to the `@theme` block:

```css
@import "tailwindcss";

@theme {
  /* Existing colors — keep all */
  --color-eucalyptus-400: #4A7A4A;
  --color-eucalyptus-500: #2D5F2D;
  --color-eucalyptus-600: #245024;
  --color-eucalyptus-700: #1B3D1B;
  --color-ochre-400: #D4A05C;
  --color-ochre-500: #C4883A;
  --color-ochre-600: #A8702E;
  --color-sky-400: #7BBCE0;
  --color-sky-500: #5BA4CF;
  --color-sky-600: #4889B0;
  --color-sand-100: #FAF8F4;
  --color-sand-200: #F5F0E8;
  --color-sand-300: #E8DFD0;
  --color-bark-400: #8888A0;
  --color-bark-700: #3D3D5C;
  --color-bark-900: #1A1A2E;
  --color-status-extinct: #6B7280;
  --color-status-critical: #DC4545;
  --color-status-endangered: #E85D45;
  --color-status-vulnerable: #E8A834;
  --color-status-near: #D4A843;
  --color-status-least: #4CAF50;

  /* New — biome palette */
  --color-outback-gold: #f59e0b;
  --color-outback-orange: #ea580c;
  --color-outback-red: #dc2626;
  --color-reef-blue: #0ea5e9;
  --color-rare-purple: #7c3aed;
  --color-deep-bark: #451a03;
  --color-night-sky: #0f172a;

  --font-serif: "DM Serif Display", Georgia, serif;
  --font-sans: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", monospace;
}

body {
  margin: 0;
  font-family: var(--font-sans);
  background-color: var(--color-night-sky);
  color: white;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#root {
  min-height: 100vh;
}

h1, h2, h3, h4 {
  font-family: var(--font-serif);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse-glow {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}

.animate-fade-in { animation: fadeIn 0.3s ease-out both; }
.animate-slide-up { animation: slideUp 0.4s ease-out both; }
.animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
```

- [ ] **Step 2: Remove BrowserRouter from main.tsx**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 3: Create `src/lib/biomes.ts` — biome configuration**

```ts
import type { HabitatType } from '../types/bird';

export type ParticleEffect = 'stars' | 'rain' | 'mist' | 'heat' | 'snow' | 'dust' | 'none';
export type BirdAnimation = 'soar' | 'fade' | 'drop' | 'waddle' | 'burst' | 'emerge';

export interface TerrainLayer {
  color: string;
  heightPercent: number;
  roundness: string;
  opacity: number;
  speed: number; // parallax multiplier: 0 = fixed, 1 = moves with scroll
}

export interface BiomeConfig {
  id: HabitatType;
  name: string;
  tagline: string;
  emoji: string;
  gradientColors: readonly [string, string, string]; // top, mid, bottom
  terrainLayers: readonly TerrainLayer[];
  particleEffect: ParticleEffect;
  defaultBirdAnimation: BirdAnimation;
}

export const BIOME_CONFIGS: readonly BiomeConfig[] = [
  {
    id: 'rainforest',
    name: 'Rainforest',
    tagline: 'Where ancient canopies touch the clouds',
    emoji: '🌿',
    gradientColors: ['#1e3a5f', '#2d6a4f', '#d8f3dc'],
    terrainLayers: [
      { color: '#2d6a4f', heightPercent: 55, roundness: '50% 50% 5px 5px', opacity: 0.5, speed: 0.3 },
      { color: '#40916c', heightPercent: 45, roundness: '50% 50% 5px 5px', opacity: 0.7, speed: 0.5 },
      { color: '#1b4332', heightPercent: 20, roundness: '0', opacity: 1, speed: 0.8 },
    ],
    particleEffect: 'rain',
    defaultBirdAnimation: 'drop',
  },
  {
    id: 'eucalyptus_forest',
    name: 'Eucalyptus Forest',
    tagline: 'Sunlight filtering through silver-green leaves',
    emoji: '🌲',
    gradientColors: ['#a7c4a0', '#5a8a5a', '#2d5f2d'],
    terrainLayers: [
      { color: '#5a8a5a', heightPercent: 60, roundness: '40% 40% 0 0', opacity: 0.4, speed: 0.3 },
      { color: '#3d6b3d', heightPercent: 50, roundness: '45% 45% 0 0', opacity: 0.65, speed: 0.5 },
      { color: '#2d5f2d', heightPercent: 25, roundness: '0', opacity: 0.9, speed: 0.8 },
    ],
    particleEffect: 'mist',
    defaultBirdAnimation: 'drop',
  },
  {
    id: 'wetland',
    name: 'Wetland',
    tagline: 'Still waters reflecting endless sky',
    emoji: '💧',
    gradientColors: ['#bae6fd', '#7dd3fc', '#a7f3d0'],
    terrainLayers: [
      { color: '#6ee7b7', heightPercent: 30, roundness: '0', opacity: 0.3, speed: 0.2 },
      { color: '#5eead4', heightPercent: 15, roundness: '50%', opacity: 0.5, speed: 0.4 },
      { color: '#2d6a4f', heightPercent: 12, roundness: '0', opacity: 0.7, speed: 0.7 },
    ],
    particleEffect: 'mist',
    defaultBirdAnimation: 'fade',
  },
  {
    id: 'coastal',
    name: 'Coastal',
    tagline: 'Where the bush meets the sea',
    emoji: '🏖️',
    gradientColors: ['#7dd3fc', '#bae6fd', '#fef3c7'],
    terrainLayers: [
      { color: '#fde68a', heightPercent: 20, roundness: '60% 60% 0 0', opacity: 0.5, speed: 0.3 },
      { color: '#67e8f9', heightPercent: 10, roundness: '50%', opacity: 0.4, speed: 0.6 },
      { color: '#d4a05c', heightPercent: 15, roundness: '0', opacity: 0.8, speed: 0.8 },
    ],
    particleEffect: 'none',
    defaultBirdAnimation: 'soar',
  },
  {
    id: 'mangrove',
    name: 'Mangrove',
    tagline: 'Tangled roots guarding the tidal zone',
    emoji: '🌊',
    gradientColors: ['#64748b', '#2d6a4f', '#1b4332'],
    terrainLayers: [
      { color: '#2d6a4f', heightPercent: 40, roundness: '0', opacity: 0.4, speed: 0.2 },
      { color: '#14532d', heightPercent: 35, roundness: '30% 30% 0 0', opacity: 0.6, speed: 0.5 },
      { color: '#365314', heightPercent: 20, roundness: '0', opacity: 0.9, speed: 0.8 },
    ],
    particleEffect: 'mist',
    defaultBirdAnimation: 'emerge',
  },
  {
    id: 'grassland',
    name: 'Grassland',
    tagline: 'Golden waves stretching to the horizon',
    emoji: '🌾',
    gradientColors: ['#fef3c7', '#fde68a', '#d4a05c'],
    terrainLayers: [
      { color: '#d4a05c', heightPercent: 25, roundness: '80% 80% 0 0', opacity: 0.3, speed: 0.3 },
      { color: '#b8860b', heightPercent: 20, roundness: '70% 70% 0 0', opacity: 0.5, speed: 0.5 },
      { color: '#92400e', heightPercent: 10, roundness: '0', opacity: 0.7, speed: 0.8 },
    ],
    particleEffect: 'dust',
    defaultBirdAnimation: 'soar',
  },
  {
    id: 'desert',
    name: 'Desert',
    tagline: 'Red earth under a burning sky',
    emoji: '🏜️',
    gradientColors: ['#f59e0b', '#ea580c', '#dc2626'],
    terrainLayers: [
      { color: '#dc2626', heightPercent: 30, roundness: '20% 20% 0 0', opacity: 0.3, speed: 0.2 },
      { color: '#b91c1c', heightPercent: 20, roundness: '30% 30% 0 0', opacity: 0.5, speed: 0.4 },
      { color: '#7f1d1d', heightPercent: 10, roundness: '0', opacity: 0.8, speed: 0.7 },
    ],
    particleEffect: 'heat',
    defaultBirdAnimation: 'burst',
  },
  {
    id: 'alpine',
    name: 'Alpine',
    tagline: 'Crisp air above the treeline',
    emoji: '🏔️',
    gradientColors: ['#e0f2fe', '#bae6fd', '#94a3b8'],
    terrainLayers: [
      { color: '#94a3b8', heightPercent: 40, roundness: '30% 30% 0 0', opacity: 0.4, speed: 0.2 },
      { color: '#64748b', heightPercent: 30, roundness: '40% 40% 0 0', opacity: 0.6, speed: 0.5 },
      { color: '#475569', heightPercent: 15, roundness: '0', opacity: 0.8, speed: 0.8 },
    ],
    particleEffect: 'snow',
    defaultBirdAnimation: 'soar',
  },
  {
    id: 'urban',
    name: 'Urban',
    tagline: 'Wild neighbours in the concrete jungle',
    emoji: '🏙️',
    gradientColors: ['#cbd5e1', '#94a3b8', '#64748b'],
    terrainLayers: [
      { color: '#64748b', heightPercent: 50, roundness: '0', opacity: 0.3, speed: 0.2 },
      { color: '#475569', heightPercent: 40, roundness: '0', opacity: 0.5, speed: 0.4 },
      { color: '#334155', heightPercent: 20, roundness: '0', opacity: 0.8, speed: 0.7 },
    ],
    particleEffect: 'none',
    defaultBirdAnimation: 'waddle',
  },
] as const;

/** Given a bird's habitats array, return the "primary" biome — first match in BIOME_CONFIGS order. */
export function primaryBiome(habitats: readonly string[]): BiomeConfig | undefined {
  return BIOME_CONFIGS.find((b) => habitats.includes(b.id));
}
```

- [ ] **Step 4: Create `src/lib/animations.ts` — Framer Motion variants**

```ts
import type { Variants } from 'framer-motion';
import type { BirdAnimation } from './biomes';

const soar: Variants = {
  hidden: { opacity: 0, x: -200, y: 40 },
  visible: { opacity: 1, x: 0, y: 0, transition: { duration: 1, ease: 'easeOut' } },
};

const fade: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: 'easeOut' } },
};

const drop: Variants = {
  hidden: { opacity: 0, y: -80 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, type: 'spring', bounce: 0.3 } },
};

const waddle: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

const burst: Variants = {
  hidden: { opacity: 0, scale: 0.3 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, type: 'spring', bounce: 0.5 } },
};

const emerge: Variants = {
  hidden: { opacity: 0, scale: 1.1, filter: 'blur(8px)' },
  visible: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 1, ease: 'easeOut' } },
};

export const BIRD_VARIANTS: Record<BirdAnimation, Variants> = {
  soar,
  fade,
  drop,
  waddle,
  burst,
  emerge,
};

export const STAGGER_CHILDREN: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.3 } },
};
```

- [ ] **Step 5: Create `src/hooks/useScrollProgress.ts`**

```ts
import { useScroll, useTransform, type MotionValue } from 'framer-motion';

interface ScrollProgress {
  scrollYProgress: MotionValue<number>;
  scrollY: MotionValue<number>;
}

export function useScrollProgress(): ScrollProgress {
  const { scrollYProgress, scrollY } = useScroll();
  return { scrollYProgress, scrollY };
}

/** Map global scroll progress to a range scoped to a section. */
export function useSectionProgress(
  scrollYProgress: MotionValue<number>,
  start: number,
  end: number,
): MotionValue<number> {
  return useTransform(scrollYProgress, [start, end], [0, 1]);
}
```

- [ ] **Step 6: Verify build**

Run: `cd /Users/dan/projects/birds-app && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 7: Commit**

```bash
git add src/lib/biomes.ts src/lib/animations.ts src/hooks/useScrollProgress.ts src/index.css src/main.tsx
git commit -m "feat: add biome configs, animation variants, scroll hooks, and biome palette"
```

---

## Task 2: ParticleField Component

**Files:**
- Create: `src/components/scroll/ParticleField.tsx`

- [ ] **Step 1: Create ParticleField.tsx**

This component renders animated CSS-only particles — stars, rain drops, mist blobs, dust motes, snowflakes, or heat shimmer lines. Capped at 50 particles for performance.

```tsx
import { useMemo } from 'react';
import type { ParticleEffect } from '../../lib/biomes';

interface Props {
  effect: ParticleEffect;
  count?: number;
}

interface ParticleStyle {
  left: string;
  top: string;
  width: string;
  height: string;
  opacity: number;
  animationDuration: string;
  animationDelay: string;
  background: string;
  borderRadius: string;
}

const EFFECT_STYLES: Record<Exclude<ParticleEffect, 'none'>, {
  bg: string;
  minSize: number;
  maxSize: number;
  borderRadius: string;
  animation: string;
}> = {
  stars: { bg: 'white', minSize: 1, maxSize: 3, borderRadius: '50%', animation: 'particle-twinkle' },
  rain: { bg: 'rgba(200,220,255,0.4)', minSize: 1, maxSize: 2, borderRadius: '0', animation: 'particle-fall' },
  mist: { bg: 'rgba(255,255,255,0.15)', minSize: 20, maxSize: 60, borderRadius: '50%', animation: 'particle-drift' },
  dust: { bg: 'rgba(212,160,92,0.4)', minSize: 2, maxSize: 5, borderRadius: '50%', animation: 'particle-drift' },
  snow: { bg: 'rgba(255,255,255,0.6)', minSize: 2, maxSize: 6, borderRadius: '50%', animation: 'particle-fall' },
  heat: { bg: 'rgba(255,200,100,0.1)', minSize: 40, maxSize: 80, borderRadius: '50%', animation: 'particle-drift' },
};

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export default function ParticleField({ effect, count = 30 }: Props) {
  const particles = useMemo(() => {
    if (effect === 'none') return [];
    const config = EFFECT_STYLES[effect];
    const cappedCount = Math.min(count, 50);
    const result: ParticleStyle[] = [];
    for (let i = 0; i < cappedCount; i++) {
      const size = randomBetween(config.minSize, config.maxSize);
      result.push({
        left: `${randomBetween(0, 100)}%`,
        top: `${randomBetween(0, 100)}%`,
        width: `${size}px`,
        height: effect === 'rain' ? `${size * 8}px` : `${size}px`,
        opacity: randomBetween(0.2, 0.8),
        animationDuration: `${randomBetween(3, 8)}s`,
        animationDelay: `${randomBetween(0, 5)}s`,
        background: config.bg,
        borderRadius: config.borderRadius,
      });
    }
    return result;
  }, [effect, count]);

  if (effect === 'none') return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {particles.map((style, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            ...style,
            animation: `${EFFECT_STYLES[effect].animation} ${style.animationDuration} ${style.animationDelay} infinite ease-in-out`,
          }}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Add particle keyframe animations to index.css**

Append after the existing keyframes:

```css
@keyframes particle-twinkle {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 1; }
}

@keyframes particle-fall {
  0% { transform: translateY(-10%); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(110vh); opacity: 0; }
}

@keyframes particle-drift {
  0% { transform: translate(0, 0); }
  33% { transform: translate(10px, -8px); }
  66% { transform: translate(-8px, 6px); }
  100% { transform: translate(0, 0); }
}
```

- [ ] **Step 3: Verify build**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/components/scroll/ParticleField.tsx src/index.css
git commit -m "feat: add ParticleField component with 6 effect types"
```

---

## Task 3: HeroSection — Night Sky + Title Animation

**Files:**
- Create: `src/components/scroll/HeroSection.tsx`

- [ ] **Step 1: Create HeroSection.tsx**

```tsx
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import ParticleField from './ParticleField';

export default function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const titleY = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const indicatorOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative flex h-screen items-center justify-center overflow-hidden bg-night-sky"
      aria-label="Hero — 40 Species, One Continent"
    >
      <ParticleField effect="stars" count={50} />

      <motion.div
        className="relative z-10 text-center"
        style={{ y: titleY, opacity: titleOpacity }}
      >
        <motion.h1
          className="font-serif text-5xl font-bold text-white md:text-7xl lg:text-8xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        >
          40 Species.
        </motion.h1>
        <motion.h1
          className="mt-2 font-serif text-5xl font-bold text-white md:text-7xl lg:text-8xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
        >
          One Continent.
        </motion.h1>
        <motion.p
          className="mt-6 text-lg text-white/60 md:text-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          Their stories, told through light.
        </motion.p>
      </motion.div>

      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        style={{ opacity: indicatorOpacity }}
      >
        <motion.div
          className="flex flex-col items-center gap-2 text-white/40"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/scroll/HeroSection.tsx
git commit -m "feat: add HeroSection with star particles and title animation"
```

---

## Task 4: DawnTransition — Gradient Shift + Nocturnal Birds

**Files:**
- Create: `src/components/scroll/DawnTransition.tsx`

- [ ] **Step 1: Create DawnTransition.tsx**

```tsx
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useBirdStore } from '../../stores/useBirdStore';
import ConservationBadge from '../birds/ConservationBadge';

const NOCTURNAL_IDS = ['powerful-owl', 'tawny-frogmouth'];

export default function DawnTransition() {
  const ref = useRef<HTMLDivElement>(null);
  const birds = useBirdStore((s) => s.birds);
  const nocturnalBirds = birds.filter((b) => NOCTURNAL_IDS.includes(b.id));

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const bgTop = useTransform(
    scrollYProgress,
    [0, 0.3, 0.6, 1],
    ['#0f172a', '#334155', '#ea580c', '#fef3c7'],
  );
  const bgBottom = useTransform(
    scrollYProgress,
    [0, 0.3, 0.6, 1],
    ['#1e293b', '#475569', '#f59e0b', '#fed7aa'],
  );

  return (
    <motion.section
      ref={ref}
      className="relative flex min-h-[50vh] flex-col items-center justify-center gap-16 px-6 py-24"
      style={{
        background: useTransform(
          scrollYProgress,
          (v) => {
            const top = bgTop.get();
            const bottom = bgBottom.get();
            return `linear-gradient(180deg, ${top}, ${bottom})`;
          },
        ),
      }}
      aria-label="Dawn transition — nocturnal birds"
    >
      {nocturnalBirds.map((bird, index) => (
        <motion.div
          key={bird.id}
          className="flex max-w-lg flex-col items-center text-center"
          initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          viewport={{ once: true, margin: '-100px' }}
        >
          <span className="text-6xl" role="img" aria-label={bird.commonName}>
            🦉
          </span>
          <h2 className="mt-4 font-serif text-3xl font-bold text-white md:text-4xl">
            {bird.commonName}
          </h2>
          <p className="mt-1 text-sm italic text-white/60">{bird.scientificName}</p>
          <p className="mt-3 text-base text-white/80">{bird.funFact}</p>
          <div className="mt-3">
            <ConservationBadge status={bird.conservationStatus} />
          </div>
        </motion.div>
      ))}
    </motion.section>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/scroll/DawnTransition.tsx
git commit -m "feat: add DawnTransition with gradient shift and nocturnal bird reveals"
```

---

## Task 5: BiomeBackground + BirdReveal Components

**Files:**
- Create: `src/components/scroll/BiomeBackground.tsx`
- Create: `src/components/scroll/BirdReveal.tsx`

- [ ] **Step 1: Create BiomeBackground.tsx**

```tsx
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import type { TerrainLayer } from '../../lib/biomes';

interface Props {
  gradientColors: readonly [string, string, string];
  terrainLayers: readonly TerrainLayer[];
}

export default function BiomeBackground({ gradientColors, terrainLayers }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  return (
    <div
      ref={ref}
      className="absolute inset-0 overflow-hidden"
      style={{
        background: `linear-gradient(180deg, ${gradientColors[0]}, ${gradientColors[1]}, ${gradientColors[2]})`,
      }}
      aria-hidden="true"
    >
      {terrainLayers.map((layer, i) => {
        const y = useTransform(scrollYProgress, [0, 1], [0, -60 * layer.speed]);
        return (
          <motion.div
            key={i}
            className="absolute bottom-0 left-0 right-0 will-change-transform"
            style={{
              y,
              height: `${layer.heightPercent}%`,
              opacity: layer.opacity,
            }}
          >
            <div
              className="h-full w-full"
              style={{
                backgroundColor: layer.color,
                borderRadius: layer.roundness,
              }}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Create BirdReveal.tsx**

```tsx
import { motion } from 'framer-motion';
import type { BirdSpecies } from '../../types/bird';
import type { BirdAnimation } from '../../lib/biomes';
import { BIRD_VARIANTS } from '../../lib/animations';
import ConservationBadge from '../birds/ConservationBadge';

interface Props {
  bird: BirdSpecies;
  animation: BirdAnimation;
  index: number;
}

export default function BirdReveal({ bird, animation, index }: Props) {
  const variants = BIRD_VARIANTS[animation];

  return (
    <motion.div
      className="flex flex-col items-center gap-3 text-center sm:flex-row sm:gap-6 sm:text-left"
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      transition={{ delay: index * 0.2 }}
    >
      <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-white/10 text-5xl backdrop-blur-sm sm:h-24 sm:w-24">
        <img
          src={bird.imageUrl}
          alt={`${bird.commonName} — ${bird.scientificName}`}
          loading="lazy"
          className="h-full w-full rounded-2xl object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
            (e.target as HTMLImageElement).parentElement!.textContent = '🐦';
          }}
        />
      </div>
      <div>
        <h3 className="font-serif text-2xl font-bold text-white md:text-3xl">
          {bird.commonName}
        </h3>
        <p className="text-sm italic text-white/50">{bird.scientificName}</p>
        <p className="mt-2 max-w-md text-sm text-white/70">{bird.funFact}</p>
        <div className="mt-2">
          <ConservationBadge status={bird.conservationStatus} />
        </div>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/components/scroll/BiomeBackground.tsx src/components/scroll/BirdReveal.tsx
git commit -m "feat: add BiomeBackground (parallax terrain) and BirdReveal (bird entrance animation)"
```

---

## Task 6: BiomeChapter — Reusable Biome Section

**Files:**
- Create: `src/components/scroll/BiomeChapter.tsx`

- [ ] **Step 1: Create BiomeChapter.tsx**

```tsx
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { BiomeConfig } from '../../lib/biomes';
import { STAGGER_CHILDREN } from '../../lib/animations';
import { useBirdStore } from '../../stores/useBirdStore';
import BiomeBackground from './BiomeBackground';
import BirdReveal from './BirdReveal';
import ParticleField from './ParticleField';

interface Props {
  config: BiomeConfig;
}

export default function BiomeChapter({ config }: Props) {
  const allBirds = useBirdStore((s) => s.birds);

  const biomeBirds = useMemo(
    () => allBirds.filter((b) => b.habitats.includes(config.id)),
    [allBirds, config.id],
  );

  return (
    <section
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-24"
      aria-label={`${config.name} biome`}
    >
      <BiomeBackground
        gradientColors={config.gradientColors}
        terrainLayers={config.terrainLayers}
      />
      <ParticleField effect={config.particleEffect} />

      <div className="relative z-10 mx-auto w-full max-w-3xl">
        {/* Biome header */}
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <span className="text-4xl" role="img" aria-hidden="true">
            {config.emoji}
          </span>
          <h2 className="mt-3 font-serif text-4xl font-bold text-white md:text-5xl">
            {config.name}
          </h2>
          <p className="mt-2 text-lg text-white/60">{config.tagline}</p>
        </motion.div>

        {/* Birds */}
        <motion.div
          className="flex flex-col gap-12"
          variants={STAGGER_CHILDREN}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {biomeBirds.map((bird, i) => (
            <BirdReveal
              key={bird.id}
              bird={bird}
              animation={config.defaultBirdAnimation}
              index={i}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/scroll/BiomeChapter.tsx
git commit -m "feat: add BiomeChapter — reusable biome section with birds and parallax"
```

---

## Task 7: ConservationSpotlight — Dramatic Endangered Species Section

**Files:**
- Create: `src/components/scroll/ConservationSpotlight.tsx`

- [ ] **Step 1: Create ConservationSpotlight.tsx**

```tsx
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useBirdStore } from '../../stores/useBirdStore';
import AnimatedCounter from '../ui/AnimatedCounter';
import ConservationBadge from '../birds/ConservationBadge';
import type { ConservationStatus } from '../../types/bird';

const SPOTLIGHT_STATUSES: ConservationStatus[] = [
  'critically_endangered',
  'endangered',
  'vulnerable',
  'near_threatened',
];

export default function ConservationSpotlight() {
  const allBirds = useBirdStore((s) => s.birds);

  const spotlightBirds = useMemo(
    () => allBirds.filter((b) => SPOTLIGHT_STATUSES.includes(b.conservationStatus)),
    [allBirds],
  );

  if (spotlightBirds.length === 0) return null;

  return (
    <section
      className="relative min-h-screen bg-neutral-900 px-6 py-24"
      aria-label="Conservation spotlight"
    >
      {/* Dramatic header */}
      <motion.div
        className="mx-auto max-w-2xl text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="font-serif text-4xl font-bold text-white md:text-5xl">
          But not all stories are thriving.
        </h2>
        <p className="mt-4 text-lg text-neutral-400">
          {spotlightBirds.length} of Australia&apos;s bird species face an uncertain future.
        </p>
      </motion.div>

      {/* Endangered birds */}
      <div className="mx-auto mt-16 flex max-w-3xl flex-col gap-20">
        {spotlightBirds.map((bird) => (
          <motion.div
            key={bird.id}
            className="flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            viewport={{ once: true, margin: '-100px' }}
          >
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-neutral-800 text-6xl ring-2 ring-outback-red/30">
              <img
                src={bird.imageUrl}
                alt={bird.commonName}
                loading="lazy"
                className="h-full w-full rounded-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.textContent = '🐦';
                }}
              />
            </div>

            <h3 className="mt-6 font-serif text-3xl font-bold text-white md:text-4xl">
              {bird.commonName}
            </h3>
            <p className="mt-1 text-sm italic text-neutral-500">{bird.scientificName}</p>

            <div className="mt-4">
              <ConservationBadge status={bird.conservationStatus} />
            </div>

            <div className="mt-6">
              <AnimatedCounter
                value={bird.population.current}
                label={`Estimated population (${bird.population.lastSurveyYear})`}
              />
            </div>

            {bird.population.trend === 'decreasing' && (
              <p className="mt-2 text-sm text-outback-red">↓ Population declining</p>
            )}

            <p className="mt-4 max-w-md text-sm text-neutral-400">{bird.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/scroll/ConservationSpotlight.tsx
git commit -m "feat: add ConservationSpotlight with animated counters and dramatic styling"
```

---

## Task 8: CollectionGrid — Filterable Card Grid + Detail View

**Files:**
- Create: `src/components/scroll/BirdCard.tsx`
- Create: `src/components/scroll/BirdDetail.tsx`
- Create: `src/components/scroll/CollectionGrid.tsx`

- [ ] **Step 1: Create BirdCard.tsx**

```tsx
import { motion } from 'framer-motion';
import type { BirdSpecies } from '../../types/bird';
import ConservationBadge from '../birds/ConservationBadge';
import HabitatTag from '../birds/HabitatTag';

interface Props {
  bird: BirdSpecies;
  onSelect: (bird: BirdSpecies) => void;
}

export default function BirdCard({ bird, onSelect }: Props) {
  return (
    <motion.button
      className="flex w-full flex-col overflow-hidden rounded-2xl bg-white text-left shadow-md transition-shadow hover:shadow-xl"
      whileHover={{ y: -4 }}
      onClick={() => onSelect(bird)}
      aria-label={`View details for ${bird.commonName}`}
    >
      <div className="relative h-40 bg-sand-200">
        <img
          src={bird.imageUrl}
          alt={bird.commonName}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <div className="absolute left-2 top-2">
          <ConservationBadge status={bird.conservationStatus} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-serif text-lg font-bold text-bark-900">{bird.commonName}</h3>
        <p className="text-xs italic text-bark-400">{bird.scientificName}</p>
        <div className="mt-auto flex flex-wrap gap-1 pt-2">
          {bird.habitats.slice(0, 3).map((h) => (
            <HabitatTag key={h} habitat={h} />
          ))}
        </div>
      </div>
    </motion.button>
  );
}
```

- [ ] **Step 2: Create BirdDetail.tsx**

```tsx
import { motion, AnimatePresence } from 'framer-motion';
import type { BirdSpecies } from '../../types/bird';
import ConservationBadge from '../birds/ConservationBadge';
import HabitatTag from '../birds/HabitatTag';
import { REGION_NAMES } from '../../lib/constants';

interface Props {
  bird: BirdSpecies | null;
  onClose: () => void;
}

export default function BirdDetail({ bird, onClose }: Props) {
  return (
    <AnimatePresence>
      {bird && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.2 }}
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
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>

            <div className="mt-4">
              <h2 className="font-serif text-2xl font-bold text-bark-900">{bird.commonName}</h2>
              <p className="text-sm italic text-bark-400">{bird.scientificName}</p>
              <p className="text-xs text-bark-400">{bird.family} · {bird.order}</p>
            </div>

            <div className="mt-3">
              <ConservationBadge status={bird.conservationStatus} />
            </div>

            <p className="mt-4 text-sm leading-relaxed text-bark-700">{bird.description}</p>

            <div className="mt-4 rounded-xl bg-sand-100 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-bark-400">Fun Fact</p>
              <p className="mt-1 text-sm text-bark-700">{bird.funFact}</p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl bg-sand-100 p-3">
                <p className="font-mono text-lg font-bold text-eucalyptus-500">
                  {bird.population.current.toLocaleString()}
                </p>
                <p className="text-xs text-bark-400">Population ({bird.population.lastSurveyYear})</p>
              </div>
              <div className="rounded-xl bg-sand-100 p-3">
                <p className="font-mono text-lg font-bold text-eucalyptus-500">
                  {bird.size.lengthCm} cm
                </p>
                <p className="text-xs text-bark-400">Length</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-bark-400">Diet</p>
              <p className="mt-1 text-sm text-bark-700">{bird.diet}</p>
            </div>

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-bark-400">Habitats</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {bird.habitats.map((h) => (
                  <HabitatTag key={h} habitat={h} />
                ))}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-bark-400">Regions</p>
              <p className="mt-1 text-sm text-bark-700">
                {bird.regions.map((r) => REGION_NAMES[r]).join(', ')}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 3: Create CollectionGrid.tsx**

```tsx
import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useBirds } from '../../hooks/useBirds';
import { useFilterStore } from '../../stores/useFilterStore';
import { HABITAT_LABELS, CONSERVATION_LABELS } from '../../lib/constants';
import type { BirdSpecies, HabitatType, ConservationStatus } from '../../types/bird';
import BirdCard from './BirdCard';
import BirdDetail from './BirdDetail';

export default function CollectionGrid() {
  const birds = useBirds();
  const { filters, setSearchQuery, toggleHabitat, toggleConservationStatus, clearAllFilters } =
    useFilterStore();
  const [selectedBird, setSelectedBird] = useState<BirdSpecies | null>(null);
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = useCallback(
    (value: string) => {
      setSearchInput(value);
      const timeout = setTimeout(() => setSearchQuery(value), 300);
      return () => clearTimeout(timeout);
    },
    [setSearchQuery],
  );

  const habitatOptions = useMemo(
    () => Object.entries(HABITAT_LABELS) as [HabitatType, string][],
    [],
  );
  const statusOptions = useMemo(
    () => Object.entries(CONSERVATION_LABELS) as [ConservationStatus, string][],
    [],
  );

  return (
    <section
      className="min-h-screen bg-sand-100 px-6 py-24"
      aria-label="Bird collection"
    >
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-serif text-4xl font-bold text-bark-900 md:text-5xl">
            The Collection
          </h2>
          <p className="mt-2 text-bark-400">All 40 species at a glance</p>
        </motion.div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchInput}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-xl border border-sand-300 bg-white px-4 py-3 text-bark-900 placeholder-bark-400 outline-none focus:border-eucalyptus-500 focus:ring-2 focus:ring-eucalyptus-500/20"
          />
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-2">
          {habitatOptions.map(([key, label]) => (
            <button
              key={key}
              onClick={() => toggleHabitat(key)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filters.habitats.includes(key)
                  ? 'bg-eucalyptus-500 text-white'
                  : 'bg-sand-200 text-bark-700 hover:bg-sand-300'
              }`}
            >
              {label}
            </button>
          ))}
          <div className="mx-1 w-px bg-sand-300" />
          {statusOptions.map(([key, label]) => (
            <button
              key={key}
              onClick={() => toggleConservationStatus(key)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filters.conservationStatuses.includes(key)
                  ? 'bg-eucalyptus-500 text-white'
                  : 'bg-sand-200 text-bark-700 hover:bg-sand-300'
              }`}
            >
              {label}
            </button>
          ))}
          {(filters.habitats.length > 0 || filters.conservationStatuses.length > 0 || filters.searchQuery) && (
            <button
              onClick={clearAllFilters}
              className="rounded-full bg-outback-red px-3 py-1 text-xs font-medium text-white"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {birds.map((bird) => (
            <BirdCard key={bird.id} bird={bird} onSelect={setSelectedBird} />
          ))}
        </div>

        {birds.length === 0 && (
          <p className="mt-12 text-center text-bark-400">No birds match your filters.</p>
        )}
      </div>

      <BirdDetail bird={selectedBird} onClose={() => setSelectedBird(null)} />
    </section>
  );
}
```

- [ ] **Step 4: Verify build**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/components/scroll/BirdCard.tsx src/components/scroll/BirdDetail.tsx src/components/scroll/CollectionGrid.tsx
git commit -m "feat: add CollectionGrid with filterable cards and detail overlay"
```

---

## Task 9: ClosingSection + ScrollProgress

**Files:**
- Create: `src/components/scroll/ClosingSection.tsx`
- Create: `src/components/scroll/ScrollProgress.tsx`

- [ ] **Step 1: Create ClosingSection.tsx**

```tsx
import { motion } from 'framer-motion';

export default function ClosingSection() {
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <section
      className="relative flex min-h-[50vh] flex-col items-center justify-center bg-night-sky px-6 py-24 text-center"
      aria-label="Closing — conservation call to action"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="font-serif text-3xl font-bold text-white md:text-4xl">
          Every species tells a story.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-white/60">
          Australia&apos;s birds are among the most diverse on Earth. Learning about them is
          the first step toward protecting them.
        </p>
        <button
          onClick={handleShare}
          className="mt-8 rounded-full bg-outback-gold px-8 py-3 font-semibold text-deep-bark transition-colors hover:bg-outback-orange hover:text-white"
        >
          Share this journey
        </button>
        <p className="mt-8 text-xs text-white/30">
          Data sourced from BirdLife Australia · Built with React &amp; Framer Motion
        </p>
      </motion.div>
    </section>
  );
}
```

- [ ] **Step 2: Create ScrollProgress.tsx**

```tsx
import { motion, useScroll } from 'framer-motion';

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      className="fixed left-0 right-0 top-0 z-50 h-1 origin-left bg-outback-gold"
      style={{ scaleX: scrollYProgress }}
    />
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/components/scroll/ClosingSection.tsx src/components/scroll/ScrollProgress.tsx
git commit -m "feat: add ClosingSection and ScrollProgress bar"
```

---

## Task 10: Wire Everything Together in App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Update App.tsx to compose all sections**

```tsx
import { useEffect } from 'react';
import { useBirdStore } from './stores/useBirdStore';
import ScrollProgress from './components/scroll/ScrollProgress';
import HeroSection from './components/scroll/HeroSection';
import DawnTransition from './components/scroll/DawnTransition';
import BiomeChapter from './components/scroll/BiomeChapter';
import ConservationSpotlight from './components/scroll/ConservationSpotlight';
import CollectionGrid from './components/scroll/CollectionGrid';
import ClosingSection from './components/scroll/ClosingSection';
import { BIOME_CONFIGS } from './lib/biomes';

function App() {
  const fetchBirds = useBirdStore((s) => s.fetchBirds);
  const isLoading = useBirdStore((s) => s.isLoading);

  useEffect(() => {
    fetchBirds();
  }, [fetchBirds]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-night-sky">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-outback-gold border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <ScrollProgress />
      <main>
        <HeroSection />
        <DawnTransition />
        {BIOME_CONFIGS.map((config) => (
          <BiomeChapter key={config.id} config={config} />
        ))}
        <ConservationSpotlight />
        <CollectionGrid />
        <ClosingSection />
      </main>
    </>
  );
}

export default App;
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Run dev server and visually verify**

Run: `npm run dev`
Expected: App loads, hero section visible with stars, scrolling through biomes works, collection grid filters work.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire all scroll sections together in App.tsx"
```

---

## Task 11: Reduced Motion + Accessibility Pass

**Files:**
- Modify: `src/index.css`
- Modify: `src/components/scroll/ParticleField.tsx`

- [ ] **Step 1: Add prefers-reduced-motion to index.css**

Append to index.css:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 2: Disable particles when reduced motion is preferred**

In `ParticleField.tsx`, add this check at the top of the component before the `useMemo`:

```tsx
const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

And update the early return:

```tsx
if (effect === 'none' || prefersReducedMotion) return null;
```

- [ ] **Step 3: Verify build**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/index.css src/components/scroll/ParticleField.tsx
git commit -m "fix: add prefers-reduced-motion support for accessibility"
```

---

## Task 12: Production Build + Final Polish

**Files:**
- No new files

- [ ] **Step 1: Run production build**

Run: `npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 2: Preview production build**

Run: `npm run preview`
Expected: App loads correctly in preview mode, all sections render, scroll animations work

- [ ] **Step 3: Run lint**

Run: `npm run lint`
Expected: No lint errors (fix any that appear)

- [ ] **Step 4: Final commit and push**

```bash
git add -A
git commit -m "chore: production build verification"
git push origin main
```

---

## Summary

| Task | What it builds | Files |
|------|---------------|-------|
| 1 | Foundation: theme, biomes, animations, hooks | 6 files |
| 2 | ParticleField (stars, rain, mist, etc.) | 1 file + CSS |
| 3 | HeroSection (night sky + title) | 1 file |
| 4 | DawnTransition (gradient + nocturnal birds) | 1 file |
| 5 | BiomeBackground + BirdReveal | 2 files |
| 6 | BiomeChapter (reusable biome section) | 1 file |
| 7 | ConservationSpotlight (endangered species) | 1 file |
| 8 | CollectionGrid + BirdCard + BirdDetail | 3 files |
| 9 | ClosingSection + ScrollProgress | 2 files |
| 10 | Wire everything in App.tsx | 1 file |
| 11 | Reduced motion + accessibility | 2 files |
| 12 | Production build verification | 0 files |
