import { useState } from "react";
import type { BirdVisit } from "../../types/station";
import { useBirdStore } from "../../stores/useBirdStore";
import ConservationBadge from "../birds/ConservationBadge";

interface VisitorBirdProps {
  visit: BirdVisit;
  index: number;
}

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
  const [showTooltip, setShowTooltip] = useState(false);

  if (!bird) return null;
  if (visit.status === "fleeing" || visit.status === "watching") return null;

  const offset = OFFSETS[index % OFFSETS.length];

  return (
    <div
      className="absolute z-10 animate-fade-in"
      style={offset}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="h-10 w-10 cursor-pointer overflow-hidden rounded-full border-2 border-outback-gold shadow-lg transition-transform hover:scale-125">
        <img
          src={bird.imageUrl}
          alt={bird.commonName}
          className="h-full w-full object-cover object-top"
          loading="lazy"
        />
      </div>

      {showTooltip && (
        <div className="absolute left-1/2 bottom-full z-50 mb-2 w-56 -translate-x-1/2 rounded-xl bg-night-sky/95 p-3 shadow-2xl backdrop-blur-sm">
          <div className="mb-2 h-24 overflow-hidden rounded-lg">
            <img
              src={bird.imageUrl}
              alt={bird.commonName}
              className="h-full w-full object-cover object-top"
            />
          </div>
          <p className="font-serif text-sm font-bold text-outback-gold">
            {bird.commonName}
          </p>
          <p className="text-xs italic text-bark-400">{bird.scientificName}</p>
          <div className="mt-1">
            <ConservationBadge status={bird.conservationStatus} />
          </div>
          <p className="mt-2 text-xs leading-relaxed text-sand-300">
            {bird.funFact}
          </p>
          <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-night-sky/95" />
        </div>
      )}
    </div>
  );
}
