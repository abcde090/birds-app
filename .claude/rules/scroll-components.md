---
paths:
  - "src/components/scroll/**/*.tsx"
---

# Scroll Component Rules

When working on scroll-driven components:

1. **Framer Motion only** — use `motion.div`, `useScroll`, `useTransform`, `whileInView` for all animations. No manual scroll event listeners or `requestAnimationFrame` scroll handlers.

2. **viewport once** — always set `viewport={{ once: true }}` on `whileInView` animations to prevent re-triggering when scrolling back up.

3. **GPU-friendly** — only animate `transform` (x, y, scale, rotate) and `opacity`. Never animate `width`, `height`, `top`, `left`, `margin`, or `padding`.

4. **Parallax layers** — use `will-change: transform` via Tailwind `will-change-transform` class. Remove `will-change` when the element is no longer in view.

5. **Stagger limits** — when animating lists (bird reveals), use `staggerChildren: 0.2` to `0.3`. Never stagger more than 8 items in view simultaneously.

6. **Section structure** — every scroll section must:
   - Be a `<section>` element
   - Have `aria-label` describing its content
   - Have `overflow-hidden` to prevent horizontal scroll from animations
   - Use `min-h-screen` (not fixed `h-screen`) for content flexibility

7. **Reduced motion** — wrap particle effects and complex animations in a `prefers-reduced-motion` check. Fall back to simple fade-in.
