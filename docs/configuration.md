# Configuration & Environment

## Required Variables
| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | MySQL connection |
| `NEXTAUTH_URL` | Public base URL |
| `NEXTAUTH_SECRET` | Auth secret |
| `NODE_ENV` | Environment mode |

## Optional Variables
| Variable | Purpose |
|----------|---------|
| `PORT` | App port (default 3000) |

## Local `.env.local`
```env
DATABASE_URL=mysql://promptly:promptlypass@localhost:3306/promptly
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=changeme
```

## Production
* Inject via GitHub Actions prior to `docker compose up`
* Avoid committing `.env.production`

## Secrets Rotation
* Regenerate `NEXTAUTH_SECRET`: `openssl rand -base64 32`
