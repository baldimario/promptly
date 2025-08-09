# Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](architecture.md)
3. [Domain & Services](services.md)
4. [API Guide](api.md)
5. [Data & Database](database.md)
6. [Configuration & Environment](configuration.md)
7. [Local Development](local-development.md)
8. [Testing Strategy](testing.md)
9. [Docker & Containers](docker.md)
10. [Deployment (VPS + CI/CD)](deployment.md)
11. [CI/CD Pipeline Details](ci-cd.md)
12. [Frontend App (Next.js)](frontend.md)
13. [File Uploads & Media](media.md)
14. [Security & Hardening](security.md)
15. [Troubleshooting](troubleshooting.md)
16. [Style Guide & Conventions](style-guide.md)
17. [Architectural Decisions (ADRs)](decisions/)
18. [Roadmap & Future Work](../ROADMAP.md)

---

## Overview
Modular Next.js + Prisma + MySQL application with a service layer (`PromptService`, `RatingService`, `FollowService`, `SaveService`) and containerized deployment for dev & prod. Local filesystem uploads replace any external media service.

See linked documents for details. Quick start:

```bash
make up          # start dev stack
make test-all    # run unit + e2e tests in containers
```

---

## Quick Links
| Topic | File |
|-------|------|
| Build/Deploy | deployment.md |
| API | api.md |
| Services | services.md |
| ADRs | decisions/ |
| Troubleshooting | troubleshooting.md |
