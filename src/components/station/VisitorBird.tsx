import type { BirdVisit } from "../../types/station";
import { useBirdStore } from "../../stores/useBirdStore";

interface VisitorBirdProps {
  visit: BirdVisit;
  index: number;
}

// Spread birds around the cell so they don't stack
const OFFSETS = [
  { top: "-6px", right: "-6px" },
  { top: "-6px", left: "-6px" },
  { bottom: "-6px", right: "-6px" },
  { bottom: "-6px", left: "-6px" },
  { top: "50%", right: "-10px" },
  { top: "50%", left: "-10px" },
] as const;

export default function VisitorBird({ visit, index }: VisitorBirdProps) {
  const getBirdBySlug = useBirdStore((s) => s.getBirdBySlug);
  const bird = getBirdBySlug(visit.birdId);

  // Don't show fleeing or watching birds
  if (!bird) return null;
  if (visit.status === "fleeing" || visit.status === "watching") return null;

  const offset = OFFSETS[index % OFFSETS.length];

  return (
    <div
      className="absolute z-10 animate-fade-in"
      style={offset}
      title={bird.commonName}
    >
      <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-outback-gold shadow-lg transition-transform hover:scale-125">
        <img
          src={bird.imageUrl}
          alt={bird.commonName}
          className="h-full w-full object-cover object-top"
          loading="lazy"
        />
      </div>
    </div>
  );
}
