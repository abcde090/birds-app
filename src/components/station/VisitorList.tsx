import { useMemo } from "react";
import { useVisitorStore } from "../../stores/useVisitorStore";
import { useBirdStore } from "../../stores/useBirdStore";
import { useCollectionStore } from "../../stores/useCollectionStore";

export default function VisitorList() {
  const visitors = useVisitorStore((s) => s.visitors);
  const getBirdBySlug = useBirdStore((s) => s.getBirdBySlug);
  const discoveredCount = useCollectionStore((s) => s.discoveredBirdIds.length);

  // Group by species — show count for flocking birds
  const speciesCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const v of visitors) {
      if (v.status === "fleeing" || v.status === "watching") continue;
      counts.set(v.birdId, (counts.get(v.birdId) ?? 0) + 1);
    }
    return Array.from(counts.entries());
  }, [visitors]);

  const uniqueSpecies = speciesCounts.length;

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-eucalyptus-600/30 bg-night-sky/80 p-3">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-sm text-outback-gold">
          Visitors ({uniqueSpecies})
        </h3>
        <span className="text-xs text-bark-400">{discoveredCount}/40</span>
      </div>

      {uniqueSpecies === 0 && (
        <p className="text-xs text-bark-400">
          Drag food onto the grid to attract birds.
        </p>
      )}

      <div className="flex max-h-48 flex-col gap-1 overflow-y-auto">
        {speciesCounts.map(([birdId, count]) => {
          const bird = getBirdBySlug(birdId);
          if (!bird) return null;

          return (
            <div
              key={birdId}
              className="flex items-center gap-2 rounded-lg bg-eucalyptus-700/20 px-2 py-1.5"
            >
              <div className="h-6 w-6 overflow-hidden rounded-full border border-outback-gold/50">
                <img
                  src={bird.imageUrl}
                  alt={bird.commonName}
                  className="h-full w-full object-cover object-top"
                />
              </div>
              <span className="flex-1 text-xs text-sand-200">
                {bird.commonName}
              </span>
              {count > 1 && (
                <span className="rounded-full bg-outback-gold/20 px-2 py-0.5 text-xs font-bold text-outback-gold">
                  ×{count}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
