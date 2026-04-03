---
paths:
  - "src/__tests__/**/*"
  - "*.test.ts"
  - "*.test.tsx"
---

# Testing Rules

When writing or modifying tests:

1. **TDD workflow** - write test first (RED), implement (GREEN), refactor (IMPROVE)
2. **Arrange-Act-Assert** pattern in every test
3. **One concept per test** - tests should be focused and readable
4. **Descriptive names** - `it('displays bird name and conservation status')` not `it('works')`
5. **80% coverage minimum** - check with `npm test -- --coverage`
6. **Mock stores** - use `vi.mock()` for Zustand stores
7. **Mock external libs** - mock Leaflet, Recharts, Framer Motion
8. **Test user behavior** - use @testing-library queries (`getByRole`, `getByText`)
9. **Test edge cases** - empty data, loading states, error states
