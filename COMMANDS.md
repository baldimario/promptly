# Promptly Development Commands

This document provides a quick reference for common commands used during development of the Promptly application.

## Docker Commands

### Start the application
```bash
make start
```

### Start the application in background
```bash
make up
```

### Stop the application
```bash
make down
```

### View logs
```bash
make logs
```

### View logs for a specific service
```bash
make logs-app    # Application logs
make logs-db     # Database logs
```

### Rebuild containers
```bash
make build
```

### Enter the app container
```bash
docker compose -f stack/docker/docker-compose.yaml exec app bash
```

### Enter the MySQL container
```bash
docker compose -f stack/docker/docker-compose.yaml exec db bash
```

## Database Management

### Initialize the database (first time)
```bash
make db-init
```

### Generate Prisma Client
```bash
make db-generate
```

### Create a new migration
```bash
make db-migrate
```

### Apply migrations
```bash
make db-push
```

### Open Prisma Studio
```bash
make db-studio
```

### Reset the database (warning: deletes all data)
```bash
make db-reset
```

### Reset database and apply schema (warning: deletes all data)
```bash
make db-reset-migrate
```

## Next.js Development

### Install dependencies
```bash
cd app && npm install
```

### Run the development server locally (outside Docker)
```bash
cd app && npm run dev
```

### Build the application
```bash
cd app && npm run build
```

### Run linting
```bash
cd app && npm run lint
```

### Run tests
```bash
cd app && npm test
```

## Git Commands

### Create a new branch
```bash
git checkout -b feature/your-feature-name
```

### Commit changes
```bash
git add .
git commit -m "Description of changes"
```

### Push changes
```bash
git push origin feature/your-feature-name
```

### Pull latest changes
```bash
git pull origin main
```

## Environment Variables

### Update environment variables
```bash
# Edit the Docker Compose environment file
nano stack/docker/.env

# Edit the app/.env.local file for Next.js variables
nano app/.env.local
```

## Helpful Tools

### Check the health of the application
```bash
make health
```

### Set up a new development environment
```bash
make setup
```

### Display all available commands
```bash
make help
```

## Documentation

The following documents provide more information about the project:

- [README.md](README.md) - Project overview and getting started
- [CONTRIBUTING.md](CONTRIBUTING.md) - Guidelines for contributing
- [ROADMAP.md](ROADMAP.md) - Future development plans
- [LICENSE](LICENSE) - Project license information
