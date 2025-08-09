# Security & Hardening

## Current Measures
* Secrets via CI (not committed)
* Minimal exposed services
* Local media (no external credentials)

## Recommendations
| Area | Action |
|------|--------|
| Rate limiting | Add middleware (e.g., Redis) |
| Input validation | Add Zod schemas |
| Dependency scans | Enable Dependabot / Snyk |
| HTTPS | Reverse proxy (nginx/Caddy) |
| Session security | Ensure secure & sameSite cookies in prod |

## Upload Safety
* Restrict extensions (TODO)
* Enforce size limits
