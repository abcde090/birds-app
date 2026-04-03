import { useMemo } from "react";
import { motion } from "framer-motion";
import { useBirdStore } from "../../stores/useBirdStore";
import AnimatedCounter from "../ui/AnimatedCounter";
import ConservationBadge from "../birds/ConservationBadge";
import type { ConservationStatus } from "../../types/bird";

const SPOTLIGHT_STATUSES: ConservationStatus[] = [
  "critically_endangered",
  "endangered",
  "vulnerable",
  "near_threatened",
];

export default function ConservationSpotlight() {
  const allBirds = useBirdStore((s) => s.birds);

  const spotlightBirds = useMemo(
    () =>
      allBirds.filter((b) => SPOTLIGHT_STATUSES.includes(b.conservationStatus)),
    [allBirds],
  );

  if (spotlightBirds.length === 0) return null;

  return (
    <section
      className="relative min-h-screen overflow-hidden bg-neutral-900 px-6 py-24"
      aria-label="Conservation spotlight"
    >
      <motion.div
        className="mx-auto max-w-2xl text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="font-serif text-4xl font-bold text-white md:text-5xl">
          But not all stories are thriving.
        </h2>
        <p className="mt-4 text-lg text-neutral-400">
          {spotlightBirds.length} of Australia&apos;s bird species face an
          uncertain future.
        </p>
      </motion.div>

      <div className="mx-auto mt-16 flex max-w-3xl flex-col gap-20">
        {spotlightBirds.map((bird) => (
          <motion.div
            key={bird.id}
            className="flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-neutral-800 text-6xl ring-2 ring-outback-red/30">
              <img
                src={bird.imageUrl}
                alt={bird.commonName}
                loading="lazy"
                className="h-full w-full rounded-full object-cover"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.style.display = "none";
                  if (img.parentElement) {
                    img.parentElement.textContent = "🐦";
                  }
                }}
              />
            </div>

            <h3 className="mt-6 font-serif text-3xl font-bold text-white md:text-4xl">
              {bird.commonName}
            </h3>
            <p className="mt-1 text-sm italic text-neutral-500">
              {bird.scientificName}
            </p>

            <div className="mt-4">
              <ConservationBadge status={bird.conservationStatus} />
            </div>

            <div className="mt-6">
              <AnimatedCounter
                value={bird.population.current}
                label={`Estimated population (${bird.population.lastSurveyYear})`}
              />
            </div>

            {bird.population.trend === "decreasing" && (
              <p className="mt-2 text-sm text-outback-red">
                ↓ Population declining
              </p>
            )}

            <p className="mt-4 max-w-md text-sm text-neutral-400">
              {bird.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
