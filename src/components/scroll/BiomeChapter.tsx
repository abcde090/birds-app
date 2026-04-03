import { useMemo } from "react";
import { motion } from "framer-motion";
import type { BiomeConfig } from "../../lib/biomes";
import { STAGGER_CHILDREN } from "../../lib/animations";
import { useBirdStore } from "../../stores/useBirdStore";
import BiomeBackground from "./BiomeBackground";
import BirdReveal from "./BirdReveal";
import ParticleField from "./ParticleField";

interface Props {
  config: BiomeConfig;
}

export default function BiomeChapter({ config }: Props) {
  const allBirds = useBirdStore((s) => s.birds);

  const biomeBirds = useMemo(
    () => allBirds.filter((b) => b.habitats.includes(config.id)),
    [allBirds, config.id],
  );

  return (
    <section
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-24"
      aria-label={`${config.name} biome`}
    >
      <BiomeBackground
        gradientColors={config.gradientColors}
        terrainLayers={config.terrainLayers}
      />
      <ParticleField effect={config.particleEffect} />

      <div className="relative z-10 mx-auto w-full max-w-3xl">
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <span className="text-4xl" role="img" aria-hidden="true">
            {config.emoji}
          </span>
          <h2 className="mt-3 font-serif text-4xl font-bold text-white md:text-5xl">
            {config.name}
          </h2>
          <p className="mt-2 text-lg text-white/60">{config.tagline}</p>
        </motion.div>

        <motion.div
          className="flex flex-col gap-12"
          variants={STAGGER_CHILDREN}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {biomeBirds.map((bird, i) => (
            <BirdReveal
              key={bird.id}
              bird={bird}
              animation={config.defaultBirdAnimation}
              index={i}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
