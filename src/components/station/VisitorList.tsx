import { useVisitorStore } from "../../stores/useVisitorStore";
import { useBirdStore } from "../../stores/useBirdStore";

const STATUS_EMOJI: Record<string, string> = {
  eating: "🍽️",
  bathing: "💧",
  watching: "👀",
  fleeing: "💨",
  chasing: "⚔️",
  approaching: "🚶",
  idle: "😴",
};

export default function VisitorList() {
  const visitors = useVisitorStore((s) => s.visitors);
  const events = useVisitorStore((s) => s.events);
  const getBirdBySlug = useBirdStore((s) => s.getBirdBySlug);

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-eucalyptus-600/30 bg-night-sky/80 p-3">
      <h3 className="font-serif text-sm text-outback-gold">
        Visitors ({visitors.length})
      </h3>

      {visitors.length === 0 && (
        <p className="text-xs text-bark-400">
          No birds visiting yet. Place food and habitat items to attract them.
        </p>
      )}

      <div className="flex max-h-48 flex-col gap-1 overflow-y-auto">
        {visitors.map((visit) => {
          const bird = getBirdBySlug(visit.birdId);
          if (!bird) return null;

          return (
            <div
              key={visit.birdId}
              className="flex items-center gap-2 rounded px-2 py-1 text-xs hover:bg-eucalyptus-700/30"
            >
              <span>{STATUS_EMOJI[visit.status] ?? "🐦"}</span>
              <span className="flex-1 text-sand-200">{bird.commonName}</span>
              <span className="capitalize text-bark-400">{visit.status}</span>
            </div>
          );
        })}
      </div>

      {events.length > 0 && (
        <div className="mt-2 border-t border-eucalyptus-600/20 pt-2">
          <p className="mb-1 text-xs uppercase tracking-wider text-bark-400">
            Events
          </p>
          <div className="flex max-h-24 flex-col gap-0.5 overflow-y-auto">
            {events.map((event, idx) => (
              <p key={idx} className="text-xs text-sand-300/70">
                {event.description}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
