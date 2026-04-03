import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { TerrainLayer } from "../../lib/biomes";

interface Props {
  gradientColors: readonly [string, string, string];
  terrainLayers: readonly TerrainLayer[];
}

function TerrainLayerEl({
  layer,
  scrollYProgress,
}: {
  layer: TerrainLayer;
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const y = useTransform(scrollYProgress, [0, 1], [0, -60 * layer.speed]);

  return (
    <motion.div
      className="absolute bottom-0 left-0 right-0 will-change-transform"
      style={{
        y,
        height: `${layer.heightPercent}%`,
        opacity: layer.opacity,
      }}
    >
      <div
        className="h-full w-full"
        style={{
          backgroundColor: layer.color,
          borderRadius: layer.roundness,
        }}
      />
    </motion.div>
  );
}

export default function BiomeBackground({
  gradientColors,
  terrainLayers,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  return (
    <div
      ref={ref}
      className="absolute inset-0 overflow-hidden"
      style={{
        background: `linear-gradient(180deg, ${gradientColors[0]}, ${gradientColors[1]}, ${gradientColors[2]})`,
      }}
      aria-hidden="true"
    >
      {terrainLayers.map((layer, i) => (
        <TerrainLayerEl
          key={i}
          layer={layer}
          scrollYProgress={scrollYProgress}
        />
      ))}
    </div>
  );
}
