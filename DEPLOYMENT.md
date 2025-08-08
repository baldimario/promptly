# Deployment and Production Setup

This project uses Next.js (App Router), Prisma (MySQL), and NextAuth. We provide a production Docker image, a docker-compose for prod, and an optional GitHub Actions workflow to deploy to a VPS.

## Environment Variables

Required at runtime (set in your env or compose):
- NODE_ENV=production
- DATABASE_URL=mysql://user:pass@db:3306/promptly
- NEXTAUTH_URL=https://your-domain
- NEXTAUTH_SECRET=your-strong-secret
- GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET (optional)
- GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET (optional)

Build-time (if different env during build):
- Ensure Prisma can generate client (DATABASE_URL may be required for some setups).

## Docker

- App image: app/Dockerfile.prod (multi-stage)
  - Installs devDependencies in builder for Next.js build (Tailwind/PostCSS)
  - Prunes to production dependencies in runner
- Compose: stack/docker/docker-compose.prod.yaml
  - Services: app, db (MySQL 8)
  - Mounts no host volumes in prod; uses image layers only

Usage (on server):
- Set environment via .env or compose env vars
- docker compose -f stack/docker/docker-compose.prod.yaml up -d --build

## CI/CD (GitHub Actions)

Workflow: .github/workflows/deploy.yml
- Trigger: push to main
- Steps: SSH to VPS, rsync repo to target path, docker compose down/build/up with prod compose
- Secrets to configure:
  - SSH_HOST, SSH_USER, SSH_KEY, SSH_PORT (optional)
  - VPS_PATH (repo destination on server)
  - Any runtime env via server-side .env or docker secrets

## Notes

- ESLint blocking is disabled during Next.js production build (next.config.ts). Keep linting in CI.
- NextAuth config is centralized in src/lib/authOptions.ts; route files export only handlers.
- Prisma client is generated at build time; run `prisma migrate deploy` during release if DB schema evolves.
