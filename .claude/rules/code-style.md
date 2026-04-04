---
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
---

# Code Style

- Use TypeScript strict mode — no `any` types
- Use functional React components with hooks (no class components)
- All components must be default exports
- Keep components under 200 lines
- Use `useMemo` and `useCallback` for expensive computations
