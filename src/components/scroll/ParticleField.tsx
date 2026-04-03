import { useMemo } from "react";
import type { ParticleEffect } from "../../lib/biomes";

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

const EFFECT_STYLES: Record<
  Exclude<ParticleEffect, "none">,
  {
    bg: string;
    minSize: number;
    maxSize: number;
    borderRadius: string;
    animation: string;
  }
> = {
  stars: {
    bg: "white",
    minSize: 1,
    maxSize: 3,
    borderRadius: "50%",
    animation: "particle-twinkle",
  },
  rain: {
    bg: "rgba(200,220,255,0.4)",
    minSize: 1,
    maxSize: 2,
    borderRadius: "0",
    animation: "particle-fall",
  },
  mist: {
    bg: "rgba(255,255,255,0.15)",
    minSize: 20,
    maxSize: 60,
    borderRadius: "50%",
    animation: "particle-drift",
  },
  dust: {
    bg: "rgba(212,160,92,0.4)",
    minSize: 2,
    maxSize: 5,
    borderRadius: "50%",
    animation: "particle-drift",
  },
  snow: {
    bg: "rgba(255,255,255,0.6)",
    minSize: 2,
    maxSize: 6,
    borderRadius: "50%",
    animation: "particle-fall",
  },
  heat: {
    bg: "rgba(255,200,100,0.1)",
    minSize: 40,
    maxSize: 80,
    borderRadius: "50%",
    animation: "particle-drift",
  },
};

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export default function ParticleField({ effect, count = 30 }: Props) {
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const particles = useMemo(() => {
    if (effect === "none") return [];
    const config = EFFECT_STYLES[effect];
    const cappedCount = Math.min(count, 50);
    const result: ParticleStyle[] = [];
    for (let i = 0; i < cappedCount; i++) {
      const size = randomBetween(config.minSize, config.maxSize);
      result.push({
        left: `${randomBetween(0, 100)}%`,
        top: `${randomBetween(0, 100)}%`,
        width: `${size}px`,
        height: effect === "rain" ? `${size * 8}px` : `${size}px`,
        opacity: randomBetween(0.2, 0.8),
        animationDuration: `${randomBetween(3, 8)}s`,
        animationDelay: `${randomBetween(0, 5)}s`,
        background: config.bg,
        borderRadius: config.borderRadius,
      });
    }
    return result;
  }, [effect, count]);

  if (effect === "none" || prefersReducedMotion) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
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
