import { useMemo } from "react";
import type { BirdVisit } from "../../types/station";
import { useBirdStore } from "../../stores/useBirdStore";

interface VisitorBirdProps {
  visit: BirdVisit;
}

const STATUS_STYLES: Record<string, string> = {
  approaching: "animate-pulse opacity-60",
  eating: "animate-bounce",
  bathing: "animate-pulse",
  watching: "opacity-50 grayscale",
  fleeing: "animate-ping opacity-30",
  chasing: "animate-bounce scale-110",
  idle: "",
};

const STATUS_LABELS: Record<string, string> = {
  approaching: "Approaching...",
  eating: "Eating",
  bathing: "Bathing",
  watching: "Watching nervously",
  fleeing: "Fleeing!",
  chasing: "Chasing!",
  idle: "Resting",
};

export default function VisitorBird({ visit }: VisitorBirdProps) {
  const getBirdBySlug = useBirdStore((s) => s.getBirdBySlug);
  const bird = getBirdBySlug(visit.birdId);

  const animationClass = useMemo(
    () => STATUS_STYLES[visit.status] ?? "",
    [visit.status],
  );

  if (!bird) return null;

  return (
    <div
      className={`absolute -top-2 -right-2 z-10 ${animationClass}`}
      title={`${bird.commonName} — ${STATUS_LABELS[visit.status] ?? visit.status}`}
    >
      <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-outback-gold shadow-lg">
        <img
          src={bird.imageUrl}
          alt={bird.commonName}
          className="h-full w-full object-cover object-top"
          loading="lazy"
        />
      </div>
      {visit.status === "watching" && (
        <span className="absolute -bottom-1 -right-1 text-xs">👀</span>
      )}
      {visit.status === "eating" && (
        <span className="absolute -bottom-1 -right-1 text-xs">🍽️</span>
      )}
      {visit.status === "fleeing" && (
        <span className="absolute -bottom-1 -right-1 text-xs">💨</span>
      )}
    </div>
  );
}
