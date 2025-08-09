# Docker & Containers

## Multi-Stage Build (`Dockerfile.prod`)
Stages: deps → builder → runner.

## Volumes
| Mount | Purpose |
|-------|---------|
| `./data/mysql:/var/lib/mysql` | Persistent database |
| `./data/uploads:/app/public/uploads` | Persistent user uploads |

## Rebuild Without Cache
```bash
docker compose -f stack/docker/docker-compose.prod.yaml build --no-cache
```

## Issues
| Symptom | Fix |
|---------|-----|
| Prisma client missing | Ensure `npx prisma generate` in build |
| Missing uploads | Verify host directory & permissions |
