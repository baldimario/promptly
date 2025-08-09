# Testing Strategy

## Layers
| Type | Location | Tool |
|------|----------|------|
| Unit | `src/__tests__` | Vitest |
| E2E (API) | `src/__e2e__` | Vitest |
| (Planned) Browser | (future) | Playwright |

## Commands
```bash
make test-unit
make test-e2e
make test-all
```

## Patterns
* Mock Prisma via DI/mocks if needed
* Add factories for model creation (planned)
* Keep tests deterministic (no reliance on clock randomness)

## TODO
* Browser e2e for auth + prompt CRUD
* Coverage reports (`vitest run --coverage`)
