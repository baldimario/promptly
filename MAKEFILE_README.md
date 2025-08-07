# Promptly Makefile Usage Guide

This document provides a quick reference for all the Makefile targets available in the Promptly project.

## Basic Commands

| Command | Description |
|---------|-------------|
| `make help` | Display a list of all available commands |
| `make setup` | Set up development environment (create .env files, directories) |
| `make start` | Build and start Docker containers with logs |
| `make build` | Build containers, install dependencies and initialize the database |
| `make up` | Start the Docker Compose project (app + database) |
| `make down` | Stop the Docker Compose project |
| `make ps` | Show active containers |
| `make health` | Run health checks on running containers |

## Logs

| Command | Description |
|---------|-------------|
| `make logs` | Show logs from all containers |
| `make logs-app` | Show logs from the app container |
| `make logs-db` | Show logs from the database container |

## Database Management

| Command | Description |
|---------|-------------|
| `make db-init` | Initialize the database (first-time setup) |
| `make db-migrate` | Generate and apply migrations |
| `make db-push` | Push schema changes directly to database (dev only) |
| `make db-generate` | Generate Prisma client |
| `make db-reset` | Reset the database (WARNING: Deletes all data!) |
| `make db-reset-migrate` | Reset database and apply schema (WARNING: Deletes all data!) |
| `make db-studio` | Open Prisma Studio to browse and edit data |
| `make mysql-guide` | Display MySQL integration guide for NextAuth.js |

## Cleanup

| Command | Description |
|---------|-------------|
| `make clean` | Remove all containers, volumes, and reset the database |

## Examples

### First-time setup:
```bash
make setup
make build
```

### Daily development workflow:
```bash
make up           # Start containers
make db-studio    # Open Prisma Studio for database management
make health       # Check if everything is working
# Make code changes...
make down         # Stop containers when done
```

### Reset database and apply schema changes:
```bash
make db-reset-migrate
```
