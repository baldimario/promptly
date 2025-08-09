# CI/CD

## Current Pipeline
* Trigger: push to `main`
* Actions: checkout → SSH setup → repo sync on VPS → compose build/up

## Enhancements (Recommended)
| Feature | Benefit |
|---------|---------|
| Build cache (registry) | Faster builds |
| Separate test job | Fails fast before deploy |
| Image tagging | Rollback capability |
| Security scans (Trivy/Snyk) | Vulnerability visibility |
| Health check step | Auto-verify deployment |

## Example Future Step
```bash
docker build -t ghcr.io/owner/app:${GITHUB_SHA} -t ghcr.io/owner/app:latest .
```
