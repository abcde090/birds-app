import { useScroll, useTransform, type MotionValue } from "framer-motion";

interface ScrollProgress {
  scrollYProgress: MotionValue<number>;
  scrollY: MotionValue<number>;
}

export function useScrollProgress(): ScrollProgress {
  const { scrollYProgress, scrollY } = useScroll();
  return { scrollYProgress, scrollY };
}

export function useSectionProgress(
  scrollYProgress: MotionValue<number>,
  start: number,
  end: number,
): MotionValue<number> {
  return useTransform(scrollYProgress, [start, end], [0, 1]);
}
