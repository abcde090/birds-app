# CLAUDE.md - Development Guidelines

## Project Overview

This repository contains one projects:

1. **Aussie Birds Web App** - Interactive Australian native bird explorer (`birds-app/`)

## Birds App Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 (via `@import "tailwindcss"` and `@theme` directive)
- **Maps**: Leaflet + react-leaflet (OpenTopoMap tiles)
- **Charts**: Recharts
- **State**: Zustand (stores in `src/stores/`)
- **Animations**: Framer Motion
- **Routing**: React Router v6

## Development Rules

### Git Workflow

- Always work on the designated feature branch (never push directly to `main`)
- Write clear, descriptive commit messages with conventional commit prefixes: `feat()`, `fix()`, `refactor()`, `docs()`
- Commit frequently — don't accumulate large uncommitted changes
- Push after each meaningful commit
- Never force push unless explicitly asked

### Code Style

- Use TypeScript strict mode — no `any` types unless absolutely unavoidable
- Use functional React components with hooks (no class components)
- All components must be default exports
- Use named exports for types, hooks, and utilities
- Keep components under 200 lines — split into smaller components if larger
- Use `useMemo` and `useCallback` for expensive computations and stable references

### Tailwind & Styling

- Use Tailwind utility classes for ALL styling — no inline styles, no CSS modules
- Custom colors are defined in `src/index.css` under `@theme` — use them via classes like `bg-eucalyptus-500`, `text-bark-900`, `bg-sand-100`
- Font families: `font-serif` (DM Serif Display for headings), `font-sans` (Inter for body), `font-mono` (JetBrains Mono for data)
- Responsive breakpoints: mobile-first, use `sm:`, `md:`, `lg:`, `xl:` prefixes

### Project Structure (birds-app/)

```
src/
  components/     # Reusable UI components grouped by domain
    birds/        # Bird-specific components (BirdCard, BirdGrid, etc.)
    filters/      # Filter UI components
    layout/       # Header, Footer, navigation
    map/          # Map-related components
    charts/       # Data visualization components
    ui/           # Generic reusable UI primitives
  hooks/          # Custom React hooks
  lib/            # Constants, utilities, helpers
  pages/          # Route-level page components
  stores/         # Zustand state stores
  types/          # TypeScript type definitions
public/
  data/           # Static JSON data files (birds.json, regions.geojson)
```

### Data & Types

- Bird data lives in `public/data/birds.json` — loaded at runtime via fetch
- GeoJSON for Australian regions lives in `public/data/regions.geojson`
- All types defined in `src/types/bird.ts` — import from there, don't redeclare
- Conservation statuses: `extinct`, `critically_endangered`, `endangered`, `vulnerable`, `near_threatened`, `least_concern`
- Regions: `nsw`, `vic`, `qld`, `wa`, `sa`, `tas`, `nt`, `act`
- Habitats: `rainforest`, `eucalyptus_forest`, `wetland`, `grassland`, `desert`, `coastal`, `mangrove`, `alpine`, `urban`

### State Management

- Use Zustand stores — NOT React Context for global state
- `useBirdStore` — bird data fetching and access
- `useFilterStore` — search, region, habitat, conservation filters
- `useMapStore` — map viewport, selected region, layer toggles
- Derived/filtered data should use the `useBirds` custom hook (combines store data with filters via `useMemo`)

### Agent Best Practices

- When writing large data files (>100 lines), use the **Write tool** not Bash
- Split large tasks across multiple agents working in parallel
- For JSON data files, split into parts if >500 lines and merge after
- Always verify builds compile after making changes: `cd birds-app && npx tsc --noEmit`
- Run `npm run build` before final push to catch errors

### Image Strategy

- Bird images use the path pattern: `/images/{bird-id}.jpg`
- Lazy load all images with `loading="lazy"` attribute
- Always include fallback background color on image containers
- Image credits stored in bird data as `imageCredit` field

### Performance

- Lazy-load page components with `React.lazy()` + `Suspense`
- Use staggered animations (don't animate 40+ items simultaneously)
- Debounce search inputs (300ms)
- Memoize filtered/sorted bird lists

### Accessibility

- All images must have meaningful `alt` text
- Interactive elements need proper focus styles
- Color is never the sole indicator — pair with text labels
- Touch targets minimum 44x44px on mobile
