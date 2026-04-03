---
name: add-biome
description: Scaffold a new biome section with config, colors, and terrain layers
allowed-tools: Read Edit Write Bash(npx tsc*)
argument-hint: "<biome-name>"
---

# Add New Biome

Add a new biome chapter to the scroll experience.

## What this skill does

Given a biome name like `$ARGUMENTS`, it:

1. **Reads** `src/lib/biomes.ts` to understand the `BiomeConfig` interface
2. **Reads** `src/types/bird.ts` to check if the habitat type exists in `HabitatType`
3. If the habitat type doesn't exist:
   - Adds it to `HabitatType` in `src/types/bird.ts`
   - Adds a label to `HABITAT_LABELS` in `src/lib/constants.ts`
   - Adds an icon to `HABITAT_ICONS` in `src/lib/constants.ts`
4. **Adds** a new `BiomeConfig` entry to `BIOME_CONFIGS` in `src/lib/biomes.ts` with:
   - Appropriate gradient colors for the biome
   - 3 terrain layers with varying parallax speeds
   - A particle effect that fits the environment
   - A default bird animation style
5. **Runs** `npx tsc --noEmit` to verify the build
6. Reports which birds from `birds.json` have the matching habitat and will appear in this biome
