import { useCallback, useMemo } from "react";
import { useStationStore } from "../../stores/useStationStore";
import { useVisitorStore } from "../../stores/useVisitorStore";
import { useCollectionStore } from "../../stores/useCollectionStore";
import { useBirdStore } from "../../stores/useBirdStore";

export default function SessionSummary() {
  const startNewSession = useStationStore((s) => s.startNewSession);
  const setScreen = useStationStore((s) => s.setScreen);
  const placedItems = useStationStore((s) => s.placedItems);

  const sessionSpecies = useVisitorStore((s) => s.sessionSpecies);
  const newDiscoveries = useVisitorStore((s) => s.newDiscoveries);
  const resetSession = useVisitorStore((s) => s.resetSession);

  const discoveredBirdIds = useCollectionStore((s) => s.discoveredBirdIds);
  const getBirdBySlug = useBirdStore((s) => s.getBirdBySlug);

  const bestSession = useMemo(() => {
    const stored = localStorage.getItem("bird-station-best");
    const prev = stored ? parseInt(stored, 10) : 0;
    const current = sessionSpecies.length;
    if (current > prev) {
      localStorage.setItem("bird-station-best", String(current));
      return current;
    }
    return prev;
  }, [sessionSpecies.length]);

  const handlePlayAgain = useCallback(() => {
    resetSession();
    startNewSession();
  }, [resetSession, startNewSession]);

  const handleBackToTitle = useCallback(() => {
    resetSession();
    setScreen("station-title");
  }, [resetSession, setScreen]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-night-sky p-6">
      <h1 className="animate-fade-in font-serif text-4xl text-outback-gold">
        Session Complete
      </h1>

      <div className="animate-slide-up flex gap-8 text-center">
        <div>
          <p className="font-mono text-3xl text-outback-gold">
            {sessionSpecies.length}
          </p>
          <p className="text-xs text-bark-400">Species This Session</p>
        </div>
        <div>
          <p className="font-mono text-3xl text-outback-gold">
            {newDiscoveries.length}
          </p>
          <p className="text-xs text-bark-400">New Discoveries</p>
        </div>
        <div>
          <p className="font-mono text-3xl text-outback-gold">
            {discoveredBirdIds.length}/40
          </p>
          <p className="text-xs text-bark-400">Collection</p>
        </div>
      </div>

      {newDiscoveries.length > 0 && (
        <div className="animate-slide-up w-full max-w-md rounded-lg border border-eucalyptus-600/30 bg-eucalyptus-700/20 p-4">
          <h3 className="mb-2 font-serif text-sm text-outback-gold">
            New Discoveries
          </h3>
          <div className="flex flex-wrap gap-2">
            {newDiscoveries.map((id) => {
              const bird = getBirdBySlug(id);
              return bird ? (
                <div
                  key={id}
                  className="flex items-center gap-2 rounded-full bg-eucalyptus-600/30 px-3 py-1"
                >
                  <div className="h-6 w-6 overflow-hidden rounded-full">
                    <img
                      src={bird.imageUrl}
                      alt={bird.commonName}
                      className="h-full w-full object-cover object-top"
                    />
                  </div>
                  <span className="text-xs text-sand-200">
                    {bird.commonName}
                  </span>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}

      <div className="animate-slide-up flex flex-col items-center gap-3">
        <p className="text-xs text-bark-400">
          Best session: {bestSession} species | {placedItems.length} items
          placed
        </p>

        <div className="flex gap-3">
          <button
            onClick={handlePlayAgain}
            className="rounded-full bg-outback-gold px-6 py-2.5 font-serif text-lg text-deep-bark shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            Play Again
          </button>
          <button
            onClick={handleBackToTitle}
            className="rounded-lg border border-eucalyptus-500/50 px-4 py-2 text-sm text-sand-200 transition-colors hover:border-outback-gold/50"
          >
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
}
