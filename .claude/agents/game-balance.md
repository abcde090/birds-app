---
name: game-balance
description: Audits Bird Catcher game balance — spawn rates, scoring, difficulty curve, and phase timing
allowed-tools: Read Grep Glob
---

# Game Balance Auditor

You audit the Bird Catcher arcade game for balance issues.

## What to Check

1. **Spawn rates** — Check `game-config.ts` PHASE_CONFIG intervals. Dawn ~0.56/s, Noon ~0.83/s, Dusk ~1.25/s, Night ~1.67/s.

2. **Score balance** — Check RARITY_CONFIG: common (50pts), near_threatened (100), vulnerable (150), endangered (250), critical (300). With combo x8, a perfect round should score ~8000-15000.

3. **Difficulty curve** — Speed multipliers in PHASE_CONFIG: Dawn 1.0x, Noon 1.4x, Dusk 1.9x, Night 2.5x. Base speed is 200px/s. Check that dawn birds are catchable and night birds are challenging.

4. **Bird sizes** — Rarer birds are smaller: common 60px, near_threatened 52px, vulnerable 44px, endangered 36px, critical 32px. Verify in RARITY_CONFIG.

5. **Miss limit** — 5 misses before game over. Check that spawn rates and speeds don't make this unfair.

6. **Combo timing** — 2 second window between catches. Check this is achievable given spawn rates and flight speeds.

7. **Phase transitions** — Dawn (180-135s), Noon (135-90s), Dusk (90-45s), Night (45-0s). Check `getPhaseForTime()`.

8. **Max active birds** — Cap is 8. Check spawner respects `MAX_ACTIVE_BIRDS`.

## Output

Summary of balance issues with specific numbers and suggested fixes.
