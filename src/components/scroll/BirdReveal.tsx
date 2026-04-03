import { motion } from "framer-motion";
import type { BirdSpecies } from "../../types/bird";
import type { BirdAnimation } from "../../lib/biomes";
import { BIRD_VARIANTS } from "../../lib/animations";
import ConservationBadge from "../birds/ConservationBadge";

interface Props {
  bird: BirdSpecies;
  animation: BirdAnimation;
  index: number;
}

export default function BirdReveal({ bird, animation, index }: Props) {
  const variants = BIRD_VARIANTS[animation];

  return (
    <motion.div
      className="flex flex-col items-center gap-3 text-center sm:flex-row sm:gap-6 sm:text-left"
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay: index * 0.2 }}
    >
      <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-white/10 text-5xl backdrop-blur-sm sm:h-24 sm:w-24">
        <img
          src={bird.imageUrl}
          alt={`${bird.commonName} — ${bird.scientificName}`}
          loading="lazy"
          className="h-full w-full rounded-2xl object-cover"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.style.display = "none";
            if (img.parentElement) {
              img.parentElement.textContent = "🐦";
            }
          }}
        />
      </div>
      <div>
        <h3 className="font-serif text-2xl font-bold text-white md:text-3xl">
          {bird.commonName}
        </h3>
        <p className="text-sm italic text-white/50">{bird.scientificName}</p>
        <p className="mt-2 max-w-md text-sm text-white/70">{bird.funFact}</p>
        <div className="mt-2">
          <ConservationBadge status={bird.conservationStatus} />
        </div>
      </div>
    </motion.div>
  );
}
