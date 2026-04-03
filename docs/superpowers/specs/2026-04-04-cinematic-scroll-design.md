# Bird Spotter — Cinematic Scroll Experience

## Overview

A single-page, scroll-driven cinematic experience showcasing 40 Australian native bird species. The user scrolls through a visual journey across Australia — from night sky to dawn, through 9 distinct biomes — with birds animating into view as they scroll. The goal is a visually stunning portfolio piece that people share because it's beautiful.

**Tagline:** "40 Species. One Continent. Their stories, told through light."

## Visual Direction

**Style:** Vibrant Outback Adventure — bright Australian palette, warm and energetic, with cinematic scroll-driven storytelling.

**Palette:**
- Outback Gold `#f59e0b`
- Burnt Orange `#ea580c`
- Uluru Red `#dc2626`
- Eucalyptus Green `#16a34a`
- Reef Blue `#0ea5e9`
- Rare Purple `#7c3aed`
- Sand Background `#fef3c7`
- Deep Bark `#451a03`

Conservation status drives accent color: green (least concern), gold (vulnerable), orange (endangered), red (critical), purple (extinct).

## Scroll Journey Structure

The page is one continuous scroll divided into these sections:

### 1. Hero (100vh)

Full-screen dark sky with animated star particles. Title text reveals on scroll with staggered letter animation:

```
40 Species.
One Continent.
```

Subtle scroll-down indicator pulses at the bottom. Background: deep navy `#0f172a` with tiny white dot particles drifting slowly.

### 2. Dawn Transition (~50vh)

As user scrolls, the background gradient smoothly shifts:
- `#0f172a` (night) → `#334155` (pre-dawn) → `#ea580c` (horizon glow) → `#f59e0b` (golden hour) → `#fef3c7` (daylight)

Nocturnal birds appear during this transition:
- Powerful Owl — fades in from darkness, large, centered
- Tawny Frogmouth — slides in from the side, camouflaged against a branch silhouette

Each bird appears with: name, scientific name, one-line fun fact, and conservation badge. Text fades in after the bird animation completes.

### 3. Biome Chapters (9 sections, each ~100vh)

Each biome is a distinct visual world. Structure per biome:

**Visual layers (parallax):**
- Background: sky/atmosphere gradient unique to biome
- Mid-ground: terrain features (trees, rocks, water) — moves at 0.5x scroll speed
- Foreground: close vegetation/elements — moves at 0.8x scroll speed
- Birds: animate in via `whileInView` with unique entrance animations

**Biome order (following a geographic journey):**

1. **Rainforest** — Deep greens, layered canopy, mist particles, rain streaks. Birds: Southern Cassowary, Riflebird, etc.
2. **Eucalyptus Forest** — Mid-greens, tall tree trunks, dappled light effect. Birds: Kookaburra, Superb Lyrebird, etc.
3. **Wetland** — Blues and greens, reflective water surface, reeds. Birds: Black Swan, Brolga, etc.
4. **Coastal** — Sand tones, ocean gradient, wave animation. Birds: Little Penguin, Pelican, etc.
5. **Mangrove** — Dark greens and muddy browns, tangled roots. Birds: Mangrove Kingfisher, etc.
6. **Grassland** — Golden yellows, waving grass animation, wide sky. Birds: Emu, Wedge-tailed Eagle soaring, etc.
7. **Desert** — Reds and oranges, heat shimmer effect, vast emptiness. Birds: Budgerigar flock, etc.
8. **Alpine** — Cool blues and whites, snow-dusted rocks. Birds: Gang-gang Cockatoo, etc.
9. **Urban** — Gray/warm tones, building silhouettes, park trees. Birds: Magpie, Noisy Miner, etc.

**Bird entrance animations (variety across species):**
- Soar in from side (eagles, raptors)
- Fade up from water reflection (waterbirds)
- Drop from canopy (forest birds)
- Waddle in from below viewport (penguins, ground birds)
- Burst in with color particles (lorikeets, bright birds)
- Emerge from camouflage (frogmouths, owls)

**Per-bird display:**
- Common name (large, serif font)
- Scientific name (small, italic)
- Fun fact (one line)
- Conservation status badge (color-coded pill)
- Size comparison silhouette (vs human hand/body)

### 4. Conservation Spotlight (~100vh)

Dramatic tonal shift. As user scrolls into this section:
- Background desaturates to near-grayscale
- A single red/orange accent color remains
- Large text: "But not all stories are thriving."

Endangered and critically endangered species are presented one at a time with:
- Large hero treatment
- Population number animating (counting down to current)
- Trend arrow (declining)
- Habitat loss visualization (simple bar showing historical vs current range)
- A brief conservation message

This section is deliberately slower and more somber — contrast with the vibrant biomes above.

### 5. Collection Grid

Transition back to the warm palette. All 40 birds displayed as a responsive card grid.

**Card design:**
- Photo/emoji placeholder
- Common name
- Conservation status badge
- Habitat tags
- Region indicator

**Interactions:**
- Filter by: conservation status, habitat, region
- Sort by: name, status, population
- Click card → expands to detail view with full data (size, diet, population, fun fact, coordinates on mini-map)
- Search bar with 300ms debounce

This section reuses existing Zustand stores (`useFilterStore`, `useBirdStore`) and the `useBirds` hook.

### 6. Closing (~50vh)

- Conservation call-to-action message
- "Share this journey" button (copies URL or generates a screenshot card)
- Credits for data sources
- Subtle callback to the night sky from the hero — the scroll has taken us from night through a full day

## Technical Architecture

### Stack (no changes from existing)

- React 18 + TypeScript + Vite
- Tailwind CSS v4
- Framer Motion (scroll animations)
- Zustand (collection grid state)
- Recharts (conservation data viz)

### Scroll Engine

**Framer Motion** drives all scroll-linked animations:

```tsx
// Per-section scroll tracking
const { scrollYProgress } = useScroll({ target: sectionRef })
const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0])
const y = useTransform(scrollYProgress, [0, 1], [100, -100])

// Background gradient tied to global scroll
const { scrollYProgress: globalProgress } = useScroll()
const bgColor = useTransform(globalProgress, [0, 0.05, 0.1], ['#0f172a', '#ea580c', '#fef3c7'])
```

**Bird entrances** use `whileInView`:

```tsx
<motion.div
  initial={{ opacity: 0, x: -200 }}
  whileInView={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.8, ease: "easeOut" }}
  viewport={{ once: true, margin: "-100px" }}
>
  <BirdReveal bird={bird} />
</motion.div>
```

### Component Structure

```
src/
  components/
    scroll/
      HeroSection.tsx          # Night sky, title animation, particles
      DawnTransition.tsx        # Gradient shift, nocturnal birds
      BiomeChapter.tsx          # Reusable biome section (takes biome config)
      BiomeBackground.tsx       # Parallax terrain layers
      BirdReveal.tsx            # Individual bird entrance + info card
      ConservationSpotlight.tsx # Desaturated dramatic section
      CollectionGrid.tsx        # Interactive card grid (reuses existing)
      ClosingSection.tsx        # CTA, credits, share
      ScrollProgress.tsx        # Thin progress bar at top of viewport
    birds/
      BirdCard.tsx              # (existing, enhanced for collection grid)
      BirdDetail.tsx            # Expanded detail view
      ConservationBadge.tsx     # (existing)
      SizeComparison.tsx        # Human-vs-bird silhouette
    ui/
      ParticleField.tsx         # Animated dot particles (stars, dust, rain)
      AnimatedCounter.tsx       # (existing) number count-up animation
      GradientBackground.tsx    # Scroll-linked gradient container
      ShareButton.tsx           # Copy URL / generate share card
  lib/
    biomes.ts                  # Biome config: colors, terrain, bird IDs, order
    animations.ts              # Reusable motion variants per bird type
    constants.ts               # (existing, extended)
  hooks/
    useScrollProgress.ts       # Global scroll position (0-1)
    useBiomeInView.ts          # Which biome is currently in viewport
```

### Biome Configuration

Each biome is defined as a config object:

```ts
interface BiomeConfig {
  id: HabitatType
  name: string
  tagline: string
  gradientColors: [string, string, string]  // top, mid, bottom
  terrainElements: TerrainLayer[]
  particleEffect?: 'rain' | 'mist' | 'heat' | 'snow' | 'dust'
  birdIds: string[]                          // IDs from birds.json
  birdAnimationStyle: 'soar' | 'fade' | 'drop' | 'waddle' | 'burst' | 'emerge'
}
```

Biome configs live in `src/lib/biomes.ts`. Each biome section renders `<BiomeChapter config={biome} />` which composes the background, parallax layers, particle effects, and bird reveals.

### Routing

Single page — no router needed for the scroll experience. The collection grid section can deep-link to bird detail via hash (`#bird/emu`) for shareability.

### Performance

- **Staggered animations**: Only animate birds when their biome section enters viewport. Never animate all 40 at once.
- **Parallax via CSS transforms**: Use `will-change: transform` on parallax layers. GPU-accelerated, no layout thrashing.
- **Lazy sections**: Biome sections below the fold render minimal DOM until near viewport (intersection observer).
- **Image strategy**: Bird images lazy-loaded with `loading="lazy"`. Fallback gradient backgrounds on containers.
- **Particle systems**: Cap at ~50 particles per section. Use `requestAnimationFrame` or CSS animations, not JS timers.

### Data Flow

No new data needed — existing `birds.json` has everything:
- `habitats` field maps birds to biome sections
- `conservationStatus` drives badge colors and spotlight section
- `coordinates` for mini-map in detail view
- `funFact`, `diet`, `size`, `population` for detail cards

The `useBirds` hook + `useFilterStore` power the collection grid section (already built).

### Responsive

- **Desktop (lg+)**: Full parallax, wide biome scenes, side-by-side bird cards
- **Tablet (md)**: Reduced parallax depth, stacked layout
- **Mobile (sm)**: Simplified backgrounds (fewer layers), vertical bird cards, touch-friendly. Parallax disabled (uses simple fade-in instead — parallax on mobile is janky).

### Accessibility

- `prefers-reduced-motion`: Disables all parallax, particles, and entrance animations. Birds and content simply appear in view.
- All bird images/emojis have descriptive alt text
- Scroll sections have landmark roles and aria-labels
- Conservation data uses text labels alongside color
- Focus-visible styles on all interactive elements in collection grid

## Out of Scope (Future — Expedition Mode)

These are explicitly NOT part of this build:

- Hidden-object biome scenes (Expedition Explorer — option B)
- Quiz/challenge mechanics
- XP/achievement/streak system
- User accounts or backend
- Sound/audio
- Day/night toggle

The hybrid (adding Expedition scenes as a second mode) is a natural Phase 2 once the scroll experience is solid.

## Success Criteria

1. First-time visitor scrolls through the entire page without leaving
2. At least one "wow" moment per biome (bird entrance animation)
3. Conservation section creates an emotional shift
4. Collection grid is functional and filterable
5. Loads fast (<3s first paint), smooth 60fps scroll on desktop
6. Responsive and usable on mobile
7. Shareable — someone can send the URL and the recipient has the same reaction
