import { motion } from "framer-motion";
import type { BirdSpecies } from "../../types/bird";
import ConservationBadge from "../birds/ConservationBadge";
import HabitatTag from "../birds/HabitatTag";

interface Props {
  bird: BirdSpecies;
  onSelect: (bird: BirdSpecies) => void;
}

export default function BirdCard({ bird, onSelect }: Props) {
  return (
    <motion.button
      className="flex w-full flex-col overflow-hidden rounded-2xl bg-white text-left shadow-md transition-shadow hover:shadow-xl"
      whileHover={{ y: -4 }}
      onClick={() => onSelect(bird)}
      aria-label={`View details for ${bird.commonName}`}
    >
      <div className="relative h-40 bg-sand-200">
        <img
          src={bird.imageUrl}
          alt={bird.commonName}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <div className="absolute left-2 top-2">
          <ConservationBadge status={bird.conservationStatus} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-serif text-lg font-bold text-bark-900">
          {bird.commonName}
        </h3>
        <p className="text-xs italic text-bark-400">{bird.scientificName}</p>
        <div className="mt-auto flex flex-wrap gap-1 pt-2">
          {bird.habitats.slice(0, 3).map((h) => (
            <HabitatTag key={h} habitat={h} />
          ))}
        </div>
      </div>
    </motion.button>
  );
}
