# Troubleshooting

| Issue | Symptom | Fix |
|-------|---------|-----|
| Prisma client missing | Runtime error about `.prisma/client` | Run `npx prisma generate` or ensure build stage executed |
| useSearchParams build error | Prerender failure | Wrap page in `<Suspense>` / mark dynamic |
| Auth failing | 500 or redirect loop | Check `NEXTAUTH_URL` & `NEXTAUTH_SECRET` |
| Missing images | 404 under /uploads | Verify volume & permissions |
| SSH deploy fails | Permission denied | Validate key & authorized_keys |

## Useful Commands
```bash
docker compose ps
docker compose logs -f app
docker exec -it promptly-nextjs sh
```
