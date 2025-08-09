# Style Guide & Conventions

## Code
* Prefer explicit types at boundaries
* Service layer over inline Prisma logic
* Flat, explicit API responses

## Naming
| Entity | Convention |
|--------|------------|
| Files | kebab-case (React components PascalCase) |
| Services | `XService.ts` |
| Env vars | UPPER_SNAKE_CASE |

## Git
* Conventional commits (`feat:`, `fix:`, etc.)
* Avoid mixing refactor + feature in one commit

## Imports
* `@/` alias → `src/`
* Order: std lib → 3rd party → internal → relative
