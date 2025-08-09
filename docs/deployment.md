# Deployment

## Flow
1. Push to `main`
2. GitHub Actions workflow:
   * SSH connectivity test
   * Clone/pull repo on VPS
   * Build images (no cache) via compose
   * (Optional) Run `npx prisma migrate deploy`
   * `docker compose up -d --remove-orphans`

## Required Secrets
| Secret | Purpose |
|--------|---------|
| `SSH_PRIVATE_KEY_B64` | Base64 private key for VPS |
| `VPS_HOST` / `VPS_USER` / `VPS_APP_PATH` | Target location |
| `NEXTAUTH_URL` / `NEXTAUTH_SECRET` | Auth config |
| `DATABASE_URL` | DB connection |
| `MYSQL_*` | DB runtime env vars |
| `VPS_SSH_PORT` (opt) | Custom SSH port |

## Post-Deploy
```bash
docker compose -f stack/docker/docker-compose.prod.yaml logs -f app
```

## Rollback Strategy
* Tag images by commit SHA (future enhancement)
* Re-run deploy with previous tag
