---
paths:
  - "src/components/**/*.tsx"
  - "src/pages/**/*.tsx"
  - "src/hooks/**/*.ts"
---

# React Rules

When working on React components and hooks in this project:

1. **Functional components only** - never class components
2. **Default export** the component, named export for types
3. **Under 200 lines** - split if larger
4. **useMemo** for filtered/sorted lists and expensive computations
5. **useCallback** for event handlers passed as props
6. **No prop drilling** - use Zustand stores from `src/stores/`
7. **Tailwind only** - no inline styles or CSS modules
8. **Mobile-first** - base styles for mobile, `sm:`/`md:`/`lg:` for larger
9. **Lazy loading** - images use `loading="lazy"`, pages use `React.lazy()`
10. **Accessibility** - alt text, focus styles, ARIA labels, 44x44px touch targets
