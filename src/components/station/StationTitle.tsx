import { useCallback } from "react";
import { useStationStore } from "../../stores/useStationStore";
import { useCollectionStore } from "../../stores/useCollectionStore";

interface StationTitleProps {
  onPlayCatcher: () => void;
}

export default function StationTitle({ onPlayCatcher }: StationTitleProps) {
  const startNewSession = useStationStore((s) => s.startNewSession);
  const sessionNumber = useStationStore((s) => s.sessionNumber);
  const discoveredBirdIds = useCollectionStore((s) => s.discoveredBirdIds);

  const handleStart = useCallback(() => {
    startNewSession();
  }, [startNewSession]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-night-sky p-6">
      <div className="animate-fade-in text-center">
        <h1 className="font-serif text-5xl text-outback-gold md:text-6xl">
          Feeding Station
        </h1>
        <p className="mt-3 max-w-md text-lg text-sand-300">
          Build a feeding station to attract Australia's birds. Place food,
          water, and vegetation strategically to discover all 40 species.
        </p>
      </div>

      <div className="animate-slide-up flex flex-col items-center gap-4">
        <button
          onClick={handleStart}
          className="rounded-full bg-outback-gold px-8 py-3 font-serif text-xl text-deep-bark shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          Start Session
        </button>

        <button
          onClick={onPlayCatcher}
          className="rounded-lg border border-eucalyptus-500/50 px-6 py-2 text-sm text-sand-200 transition-colors hover:border-outback-gold/50"
        >
          Play Bird Catcher instead
        </button>
      </div>

      <div className="animate-slide-up flex gap-6 text-center">
        <div>
          <p className="font-mono text-2xl text-outback-gold">
            {discoveredBirdIds.length}
          </p>
          <p className="text-xs text-bark-400">Species Found</p>
        </div>
        <div>
          <p className="font-mono text-2xl text-outback-gold">40</p>
          <p className="text-xs text-bark-400">Total Species</p>
        </div>
        <div>
          <p className="font-mono text-2xl text-outback-gold">
            {sessionNumber}
          </p>
          <p className="text-xs text-bark-400">Sessions</p>
        </div>
      </div>
    </div>
  );
}
