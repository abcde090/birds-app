---
name: add-bird
description: Add a new bird species to birds.json with all required fields and a real photo URL
allowed-tools: Read Edit Write Bash(npx tsc*) WebFetch
argument-hint: "<bird-common-name>"
---

# Add Bird Species

Add a new bird to the dataset.

## Process

Given a bird name like `$ARGUMENTS`:

1. **Read** `src/types/bird.ts` to get the exact `BirdSpecies` interface
2. **Read** `public/data/birds.json` to see the existing format and avoid duplicate IDs
3. **Research** the bird (using existing knowledge) to populate:
   - `id` — kebab-case from common name
   - `commonName`, `scientificName`, `family`, `order`, `category`
   - `description` — 2-3 sentences about the bird
   - `conservationStatus` — must be a valid `ConservationStatus` value
   - `habitats` — array of valid `HabitatType` values
   - `regions` — array of valid `AustralianRegionId` values where it's found
   - `imageUrl` — a real photo URL from birdsinbackyards.net or Wikimedia Commons (NOT a local path)
   - `imageCredit` — source attribution
   - `diet` — brief diet description
   - `size` — `{ lengthCm, wingspanCm?, weightG? }`
   - `funFact` — one interesting fact
   - `population` — `{ current, trend, lastSurveyYear }`
   - `coordinates` — approximate `{ lat, lng }` for a typical sighting location
4. **Find a real photo** — search birdsinbackyards.net/species/{Genus-species} first, then Wikimedia Commons. Verify the URL returns a real bird photo, not eggs or specimens.
5. **Append** the new bird to `public/data/birds.json`
6. **Verify** build: `npx tsc --noEmit`
