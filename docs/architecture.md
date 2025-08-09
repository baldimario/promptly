# Architecture

## High-Level
* **Frontend / UI**: Next.js App Router (SSR + dynamic pages using Suspense where required by `useSearchParams`).
* **Backend (API)**: Next.js route handlers under `src/app/api`.
* **Service Layer**: Encapsulates domain logic (`src/services`).
* **Persistence**: MySQL via Prisma.
* **Auth**: next-auth with centralized `authOptions`.
* **Media**: Local filesystem under `public/uploads` (Docker volume backed).
* **CI/CD**: GitHub Actions workflow (pull + build on VPS).

## Layering
UI → Hooks → Services → Prisma Client → MySQL

## Key Directories
| Path | Purpose |
|------|---------|
| `src/services` | Domain logic (prompt, follow, rating, save) |
| `src/utils` | Helpers (formatting, file handling, placeholder) |
| `src/lib` | Prisma client, auth options |
| `public/uploads` | Persistent user-uploaded images |
| `docs/decisions` | Architectural Decision Records |

## Cross-Cutting Concerns
* **Error Handling**: JSON `{ error }` with proper HTTP status.
* **Validation**: (Planned) Zod schemas at route boundaries.
* **Caching**: None yet (candidates: prompt listing, profiles).
* **Logging**: Minimal now (console); consider structured logging (Pino) later.

## Future Enhancements
* Caching layer (Redis) for hot endpoints
* Background job queue (BullMQ / QStash) for heavy processing
* Rate limiting middleware
* Observability (metrics + tracing)
