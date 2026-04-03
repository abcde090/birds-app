import type { Variants } from "framer-motion";
import type { BirdAnimation } from "./biomes";

const soar: Variants = {
  hidden: { opacity: 0, x: -200, y: 40 },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: { duration: 1, ease: "easeOut" },
  },
};

const fade: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const drop: Variants = {
  hidden: { opacity: 0, y: -80 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, type: "spring", bounce: 0.3 },
  },
};

const waddle: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const burst: Variants = {
  hidden: { opacity: 0, scale: 0.3 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, type: "spring", bounce: 0.5 },
  },
};

const emerge: Variants = {
  hidden: { opacity: 0, scale: 1.1, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 1, ease: "easeOut" },
  },
};

export const BIRD_VARIANTS: Record<BirdAnimation, Variants> = {
  soar,
  fade,
  drop,
  waddle,
  burst,
  emerge,
};

export const STAGGER_CHILDREN: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.3 } },
};
