import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { BirdSpecies } from '../../types/bird';
import ConservationBadge from './ConservationBadge';
import HabitatTag from './HabitatTag';

interface Props {
  bird: BirdSpecies;
}

export default function BirdCard({ bird }: Props) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Link
        to={`/species/${bird.id}`}
        className="block rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow overflow-hidden"
      >
        <div className="relative h-48 bg-sand-200 overflow-hidden">
          <img
            src={bird.imageUrl}
            alt={bird.commonName}
            loading="lazy"
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-serif text-lg font-bold text-bark-900 leading-tight">
                {bird.commonName}
              </h3>
              <p className="text-xs italic text-bark-400">{bird.scientificName}</p>
            </div>
          </div>
          <ConservationBadge status={bird.conservationStatus} />
          <div className="flex flex-wrap gap-1">
            {bird.habitats.slice(0, 2).map((h) => (
              <HabitatTag key={h} habitat={h} />
            ))}
          </div>
          <p className="text-sm text-bark-700 line-clamp-2">{bird.description}</p>
        </div>
      </Link>
    </motion.div>
  );
}
