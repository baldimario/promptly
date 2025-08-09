# ADR-0003: Dynamic Pages & Suspense

## Status
Accepted

## Context
Next.js build failed: `useSearchParams` used without Suspense in statically rendered pages.

## Decision
Wrap pages in `<Suspense>` & mark `dynamic='force-dynamic'` where necessary.

## Consequences
* + Stable production builds
* - Lose static optimization for those pages

## Future
Revisit when partial static generation strategy evolves.
