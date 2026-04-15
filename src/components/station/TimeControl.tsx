import { useCallback } from "react";
import { useStationStore } from "../../stores/useStationStore";
import { getPhaseDefinition, PHASE_ORDER } from "../../lib/station-config";

export default function TimeControl() {
  const currentPhase = useStationStore((s) => s.currentPhase);
  const advancePhase = useStationStore((s) => s.advancePhase);
  const phaseDef = getPhaseDefinition(currentPhase);
  const currentIndex = PHASE_ORDER.indexOf(currentPhase);
  const isLastPhase = currentIndex === PHASE_ORDER.length - 1;

  const handleAdvance = useCallback(() => {
    advancePhase();
  }, [advancePhase]);

  return (
    <div className="flex items-center gap-3 rounded-lg border border-eucalyptus-600/30 bg-night-sky/80 px-4 py-2">
      <div className="flex items-center gap-2">
        <span className="text-xl">{phaseDef.emoji}</span>
        <div>
          <p className="font-serif text-sm text-outback-gold">
            {phaseDef.label}
          </p>
          <p className="text-xs text-bark-400">{phaseDef.description}</p>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="flex gap-1">
          {PHASE_ORDER.map((phase, idx) => (
            <div
              key={phase}
              className={`h-2 w-6 rounded-full ${
                idx <= currentIndex ? "bg-outback-gold" : "bg-eucalyptus-600/30"
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleAdvance}
          className="rounded-lg bg-eucalyptus-500/80 px-3 py-1.5 text-sm text-sand-100 transition-colors hover:bg-eucalyptus-400"
        >
          {isLastPhase ? "End Session" : "Next Phase"}
        </button>
      </div>
    </div>
  );
}
