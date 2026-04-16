import { useVisitorStore } from "../../stores/useVisitorStore";
import { useBirdStore } from "../../stores/useBirdStore";
import { useCollectionStore } from "../../stores/useCollectionStore";

export default function VisitorList() {
  const visitors = useVisitorStore((s) => s.visitors);
  const getBirdBySlug = useBirdStore((s) => s.getBirdBySlug);
  const discoveredCount = useCollectionStore((s) => s.discoveredBirdIds.length);

  // Only show birds that are actively visiting (eating/bathing)
  const activeVisitors = visitors.filter(
    (v) => v.status !== "fleeing" && v.status !== "watching",
  );

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-eucalyptus-600/30 bg-night-sky/80 p-3">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-sm text-outback-gold">
          Visitors ({activeVisitors.length})
        </h3>
        <span className="text-xs text-bark-400">{discoveredCount}/40</span>
      </div>

      {activeVisitors.length === 0 && (
        <p className="text-xs text-bark-400">
          Drag food onto the grid to attract birds.
        </p>
      )}

      <div className="flex max-h-48 flex-col gap-1 overflow-y-auto">
        {activeVisitors.map((visit) => {
          const bird = getBirdBySlug(visit.birdId);
          if (!bird) return null;

          return (
            <div
              key={visit.birdId}
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
