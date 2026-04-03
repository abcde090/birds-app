import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useBirdStore } from "../../stores/useBirdStore";
import ConservationBadge from "../birds/ConservationBadge";

const NOCTURNAL_IDS = ["powerful-owl", "tawny-frogmouth"];

export default function DawnTransition() {
  const ref = useRef<HTMLDivElement>(null);
  const birds = useBirdStore((s) => s.birds);
  const nocturnalBirds = birds.filter((b) => NOCTURNAL_IDS.includes(b.id));

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const bg = useTransform(
    scrollYProgress,
    [0, 0.3, 0.6, 1],
    [
      "linear-gradient(180deg, #0f172a, #1e293b)",
      "linear-gradient(180deg, #334155, #475569)",
      "linear-gradient(180deg, #ea580c, #f59e0b)",
      "linear-gradient(180deg, #fef3c7, #fed7aa)",
    ],
  );

  return (
    <motion.section
      ref={ref}
      className="relative flex min-h-[50vh] flex-col items-center justify-center gap-16 overflow-hidden px-6 py-24"
      style={{ background: bg }}
      aria-label="Dawn transition — nocturnal birds"
    >
      {nocturnalBirds.map((bird, index) => (
        <motion.div
          key={bird.id}
          className="flex max-w-lg flex-col items-center text-center"
          initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <span className="text-6xl" role="img" aria-label={bird.commonName}>
            🦉
          </span>
          <h2 className="mt-4 font-serif text-3xl font-bold text-white md:text-4xl">
            {bird.commonName}
          </h2>
          <p className="mt-1 text-sm italic text-white/60">
            {bird.scientificName}
          </p>
          <p className="mt-3 text-base text-white/80">{bird.funFact}</p>
          <div className="mt-3">
            <ConservationBadge status={bird.conservationStatus} />
          </div>
        </motion.div>
      ))}
    </motion.section>
  );
}
