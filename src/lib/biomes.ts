import type { HabitatType } from "../types/bird";

export type ParticleEffect =
  | "stars"
  | "rain"
  | "mist"
  | "heat"
  | "snow"
  | "dust"
  | "none";
export type BirdAnimation =
  | "soar"
  | "fade"
  | "drop"
  | "waddle"
  | "burst"
  | "emerge";

export interface TerrainLayer {
  color: string;
  heightPercent: number;
  roundness: string;
  opacity: number;
  speed: number;
}

export interface BiomeConfig {
  id: HabitatType;
  name: string;
  tagline: string;
  emoji: string;
  gradientColors: readonly [string, string, string];
  terrainLayers: readonly TerrainLayer[];
  particleEffect: ParticleEffect;
  defaultBirdAnimation: BirdAnimation;
}

export const BIOME_CONFIGS: readonly BiomeConfig[] = [
  {
    id: "rainforest",
    name: "Rainforest",
    tagline: "Where ancient canopies touch the clouds",
    emoji: "🌿",
    gradientColors: ["#1e3a5f", "#2d6a4f", "#d8f3dc"],
    terrainLayers: [
      {
        color: "#2d6a4f",
        heightPercent: 55,
        roundness: "50% 50% 5px 5px",
        opacity: 0.5,
        speed: 0.3,
      },
      {
        color: "#40916c",
        heightPercent: 45,
        roundness: "50% 50% 5px 5px",
        opacity: 0.7,
        speed: 0.5,
      },
      {
        color: "#1b4332",
        heightPercent: 20,
        roundness: "0",
        opacity: 1,
        speed: 0.8,
      },
    ],
    particleEffect: "rain",
    defaultBirdAnimation: "drop",
  },
  {
    id: "eucalyptus_forest",
    name: "Eucalyptus Forest",
    tagline: "Sunlight filtering through silver-green leaves",
    emoji: "🌲",
    gradientColors: ["#a7c4a0", "#5a8a5a", "#2d5f2d"],
    terrainLayers: [
      {
        color: "#5a8a5a",
        heightPercent: 60,
        roundness: "40% 40% 0 0",
        opacity: 0.4,
        speed: 0.3,
      },
      {
        color: "#3d6b3d",
        heightPercent: 50,
        roundness: "45% 45% 0 0",
        opacity: 0.65,
        speed: 0.5,
      },
      {
        color: "#2d5f2d",
        heightPercent: 25,
        roundness: "0",
        opacity: 0.9,
        speed: 0.8,
      },
    ],
    particleEffect: "mist",
    defaultBirdAnimation: "drop",
  },
  {
    id: "wetland",
    name: "Wetland",
    tagline: "Still waters reflecting endless sky",
    emoji: "💧",
    gradientColors: ["#bae6fd", "#7dd3fc", "#a7f3d0"],
    terrainLayers: [
      {
        color: "#6ee7b7",
        heightPercent: 30,
        roundness: "0",
        opacity: 0.3,
        speed: 0.2,
      },
      {
        color: "#5eead4",
        heightPercent: 15,
        roundness: "50%",
        opacity: 0.5,
        speed: 0.4,
      },
      {
        color: "#2d6a4f",
        heightPercent: 12,
        roundness: "0",
        opacity: 0.7,
        speed: 0.7,
      },
    ],
    particleEffect: "mist",
    defaultBirdAnimation: "fade",
  },
  {
    id: "coastal",
    name: "Coastal",
    tagline: "Where the bush meets the sea",
    emoji: "🏖️",
    gradientColors: ["#7dd3fc", "#bae6fd", "#fef3c7"],
    terrainLayers: [
      {
        color: "#fde68a",
        heightPercent: 20,
        roundness: "60% 60% 0 0",
        opacity: 0.5,
        speed: 0.3,
      },
      {
        color: "#67e8f9",
        heightPercent: 10,
        roundness: "50%",
        opacity: 0.4,
        speed: 0.6,
      },
      {
        color: "#d4a05c",
        heightPercent: 15,
        roundness: "0",
        opacity: 0.8,
        speed: 0.8,
      },
    ],
    particleEffect: "none",
    defaultBirdAnimation: "soar",
  },
  {
    id: "mangrove",
    name: "Mangrove",
    tagline: "Tangled roots guarding the tidal zone",
    emoji: "🌊",
    gradientColors: ["#64748b", "#2d6a4f", "#1b4332"],
    terrainLayers: [
      {
        color: "#2d6a4f",
        heightPercent: 40,
        roundness: "0",
        opacity: 0.4,
        speed: 0.2,
      },
      {
        color: "#14532d",
        heightPercent: 35,
        roundness: "30% 30% 0 0",
        opacity: 0.6,
        speed: 0.5,
      },
      {
        color: "#365314",
        heightPercent: 20,
        roundness: "0",
        opacity: 0.9,
        speed: 0.8,
      },
    ],
    particleEffect: "mist",
    defaultBirdAnimation: "emerge",
  },
  {
    id: "grassland",
    name: "Grassland",
    tagline: "Golden waves stretching to the horizon",
    emoji: "🌾",
    gradientColors: ["#fef3c7", "#fde68a", "#d4a05c"],
    terrainLayers: [
      {
        color: "#d4a05c",
        heightPercent: 25,
        roundness: "80% 80% 0 0",
        opacity: 0.3,
        speed: 0.3,
      },
      {
        color: "#b8860b",
        heightPercent: 20,
        roundness: "70% 70% 0 0",
        opacity: 0.5,
        speed: 0.5,
      },
      {
        color: "#92400e",
        heightPercent: 10,
        roundness: "0",
        opacity: 0.7,
        speed: 0.8,
      },
    ],
    particleEffect: "dust",
    defaultBirdAnimation: "soar",
  },
  {
    id: "desert",
    name: "Desert",
    tagline: "Red earth under a burning sky",
    emoji: "🏜️",
    gradientColors: ["#f59e0b", "#ea580c", "#dc2626"],
    terrainLayers: [
      {
        color: "#dc2626",
        heightPercent: 30,
        roundness: "20% 20% 0 0",
        opacity: 0.3,
        speed: 0.2,
      },
      {
        color: "#b91c1c",
        heightPercent: 20,
        roundness: "30% 30% 0 0",
        opacity: 0.5,
        speed: 0.4,
      },
      {
        color: "#7f1d1d",
        heightPercent: 10,
        roundness: "0",
        opacity: 0.8,
        speed: 0.7,
      },
    ],
    particleEffect: "heat",
    defaultBirdAnimation: "burst",
  },
  {
    id: "alpine",
    name: "Alpine",
    tagline: "Crisp air above the treeline",
    emoji: "🏔️",
    gradientColors: ["#e0f2fe", "#bae6fd", "#94a3b8"],
    terrainLayers: [
      {
        color: "#94a3b8",
        heightPercent: 40,
        roundness: "30% 30% 0 0",
        opacity: 0.4,
        speed: 0.2,
      },
      {
        color: "#64748b",
        heightPercent: 30,
        roundness: "40% 40% 0 0",
        opacity: 0.6,
        speed: 0.5,
      },
      {
        color: "#475569",
        heightPercent: 15,
        roundness: "0",
        opacity: 0.8,
        speed: 0.8,
      },
    ],
    particleEffect: "snow",
    defaultBirdAnimation: "soar",
  },
  {
    id: "urban",
    name: "Urban",
    tagline: "Wild neighbours in the concrete jungle",
    emoji: "🏙️",
    gradientColors: ["#cbd5e1", "#94a3b8", "#64748b"],
    terrainLayers: [
      {
        color: "#64748b",
        heightPercent: 50,
        roundness: "0",
        opacity: 0.3,
        speed: 0.2,
      },
      {
        color: "#475569",
        heightPercent: 40,
        roundness: "0",
        opacity: 0.5,
        speed: 0.4,
      },
      {
        color: "#334155",
        heightPercent: 20,
        roundness: "0",
        opacity: 0.8,
        speed: 0.7,
      },
    ],
    particleEffect: "none",
    defaultBirdAnimation: "waddle",
  },
] as const;

export function primaryBiome(
  habitats: readonly string[],
): BiomeConfig | undefined {
  return BIOME_CONFIGS.find((b) => habitats.includes(b.id));
}
