import { motion } from 'framer-motion';
import type { BirdSpecies } from '../../types/bird';
import BirdCard from './BirdCard';

interface Props {
  birds: BirdSpecies[];
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function BirdGrid({ birds }: Props) {
  if (birds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-bark-400">
        <p className="text-lg font-medium">No birds found</p>
        <p className="text-sm">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {birds.map((bird) => (
        <motion.div key={bird.id} variants={item}>
          <BirdCard bird={bird} />
        </motion.div>
      ))}
    </motion.div>
  );
}
