import { useEffect } from "react";
import { useBirdStore } from "../../stores/useBirdStore";
import ConservationBadge from "../birds/ConservationBadge";

interface BirdInfoCardProps {
  birdId: string;
  onDismiss: () => void;
}

export default function BirdInfoCard({ birdId, onDismiss }: BirdInfoCardProps) {
  const bird = useBirdStore((s) => s.getBirdBySlug(birdId));

  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!bird) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onDismiss}
      role="dialog"
      aria-label={`New species discovered: ${bird.commonName}`}
    >
      <div
        className="animate-card-flip w-full max-w-sm overflow-hidden rounded-2xl bg-night-sky shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-48 overflow-hidden">
          <img
            src={bird.imageUrl}
            alt={bird.commonName}
            className="h-full w-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-night-sky/90 to-transparent" />
          <p className="absolute bottom-2 left-4 font-mono text-xs text-outback-gold">
            NEW SPECIES DISCOVERED!
          </p>
        </div>

        <div className="flex flex-col gap-2 p-4">
          <h2 className="font-serif text-2xl text-outback-gold">
            {bird.commonName}
          </h2>
          <p className="text-xs italic text-bark-400">{bird.scientificName}</p>

          <ConservationBadge status={bird.conservationStatus} />

          <p className="text-sm text-sand-200">{bird.description}</p>

          <div className="mt-2 rounded-lg bg-eucalyptus-700/30 p-3">
            <p className="text-xs text-bark-400">Fun Fact</p>
            <p className="text-sm text-outback-gold">{bird.funFact}</p>
          </div>

          <button
            onClick={onDismiss}
            className="mt-2 rounded-lg bg-eucalyptus-500/80 px-4 py-2 text-sm text-sand-100 transition-colors hover:bg-eucalyptus-400"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
