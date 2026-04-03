---
paths:
  - "src/lib/biomes.ts"
  - "public/data/birds.json"
  - "src/types/bird.ts"
---

# Biome & Bird Data Rules

When modifying biome configurations or bird data:

1. **BiomeConfig completeness** — every `BiomeConfig` must have: `id` (matching a `HabitatType`), `name`, `tagline`, `emoji`, `gradientColors` (3 colors), `terrainLayers` (2-4 layers), `particleEffect`, and `defaultBirdAnimation`.

2. **Terrain layer order** — layers are rendered bottom-up. Background layers (low `speed`) go first, foreground layers (high `speed`) go last. Speed range: 0.2 to 0.8.

3. **Bird-biome mapping** — birds appear in a biome if their `habitats` array includes the biome's `id`. A bird can appear in multiple biomes. Don't duplicate bird data — the `BiomeChapter` component filters at runtime.

4. **Conservation status colors** — always use the project palette: green (`#16a34a`) for least concern, gold (`#f59e0b`) for vulnerable, orange (`#ea580c`) for endangered, red (`#dc2626`) for critical, gray (`#6B7280`) for extinct, purple (`#7c3aed`) for near threatened.

5. **Bird IDs** — always kebab-case, derived from common name. Must match between `birds.json` and any hardcoded references (e.g., `NOCTURNAL_IDS` in `DawnTransition.tsx`).
