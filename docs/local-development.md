# Local Development

## Requirements
* Docker & Docker Compose
* Make (optional convenience)

## Start Stack
```bash
docker compose -f stack/docker/docker-compose.yaml up -d
```
or
```bash
make up
```

## Install Dependencies
Packages installed in container via `npm ci`. To add a package:
```bash
docker compose exec app npm install <pkg>
```

## Tests
```bash
make test-unit
make test-e2e
make test-all
```

## DB Access
* phpMyAdmin: http://localhost:8080
* CLI: `mysql -h 127.0.0.1 -u promptly -ppromptlypass promptly`

## Reset DB
```bash
docker compose down -v
docker compose up -d
```

## Common Tasks
| Action | Command |
|--------|---------|
| Prisma generate | docker compose exec app npx prisma generate |
| Prisma migrate dev | docker compose exec app npx prisma migrate dev |
