# Promptly Makefile
# 
# A Makefile to simplify common Docker operations for the Promptly application

.DEFAULT_GOAL := help

# Default target
.PHONY: help
help:
	@echo "Promptly Makefile"
	@echo "------------------"
	@echo "Available targets:"
	@echo "  setup           - Set up development environment (create .env files, directories)"
	@echo "  start           - Build and start Docker containers with logs"
	@echo "  build           - Build containers, install dependencies and initialize the database"
	@echo "  up              - Start the Docker Compose project (app + database)"
	@echo "  down            - Stop the Docker Compose project"
	@echo "  ps              - Show active containers"
	@echo "  logs            - Show logs from all containers"
	@echo "  logs-app        - Show logs from the app container"
	@echo "  logs-db         - Show logs from the database container"
	@echo "  test-unit       - Run unit tests (Vitest) inside the app container"
	@echo "  test-e2e        - Run end-to-end tests against http://localhost:3000"
	@echo "  test-all        - Run unit then e2e tests (brings up containers if needed)"
	@echo "  health          - Run health checks on running containers"
	@echo "  db-init         - Initialize the database"
	@echo "  db-migrate      - Run database migrations"
	@echo "  db-push         - Push schema changes directly to database (dev only)"
	@echo "  db-generate     - Generate Prisma client"
	@echo "  db-reset        - Reset the database (warning: deletes all data)"
	@echo "  db-reset-migrate - Reset database and apply schema (warning: deletes all data)"
	@echo "  db-studio       - Open Prisma Studio"
	@echo "  mysql-guide     - Display MySQL integration guide for NextAuth.js"
	@echo "  clean           - Remove all containers, volumes, and reset the database"

# Check if docker-compose exists, otherwise try docker compose
DOCKER_COMPOSE := $(shell command -v docker-compose 2> /dev/null || echo "docker compose")
# Set Docker Compose file path
DOCKER_COMPOSE_FILE := -f stack/docker/docker-compose.yaml

# Constants for database operations
PRISMA_DIR := ./app/prisma
PRISMA_CMD := npx prisma

# Colors for output
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m

# Default database URL if not set in environment
DATABASE_URL ?= mysql://promptly:promptly123@localhost:3306/promptly

# Helper to run commands in the app container
APP_EXEC := $(DOCKER_COMPOSE) $(DOCKER_COMPOSE_FILE) exec -T app sh -lc

# Set up development environment
.PHONY: setup
setup:
	@echo -e "$(GREEN)=== Promptly Development Environment Setup ===$(NC)"
	
	@# Check for Docker
	@if ! command -v docker &> /dev/null; then \
		echo -e "$(RED)Error: Docker is not installed. Please install Docker first.$(NC)"; \
		echo "Visit: https://www.docker.com/get-started"; \
		exit 1; \
	fi
	
	@# Check for Docker Compose
	@if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then \
		echo -e "$(RED)Error: Docker Compose is not installed. Please install Docker Compose first.$(NC)"; \
		echo "Visit: https://docs.docker.com/compose/install/"; \
		exit 1; \
	fi
	
	@# Create .env if it doesn't exist
	@if [ ! -f .env ]; then \
		echo -e "$(YELLOW)Creating .env file...$(NC)"; \
		if [ -f .env.example ]; then \
			cp .env.example .env; \
		else \
			echo -e "$(YELLOW)No .env.example found, creating default .env...$(NC)"; \
			echo "# Docker Compose Environment Variables\n\n# MySQL Configuration\nMYSQL_ROOT_PASSWORD=rootpassword\nMYSQL_DATABASE=promptly\nMYSQL_USER=promptly\nMYSQL_PASSWORD=promptly123\n\n# Next.js Application\nNEXTAUTH_SECRET=your-nextauth-secret\nNEXTAUTH_URL=http://localhost:3000\n\n# Database URL for Prisma\nDATABASE_URL=mysql://promptly:promptly123@mysql:3306/promptly" > .env; \
		fi; \
		echo -e "$(GREEN)Created .env file. Please review and update if needed.$(NC)"; \
	fi
	
	@# Create app/.env.local if it doesn't exist
	@if [ ! -f app/.env.local ]; then \
		echo -e "$(YELLOW)Creating app/.env.local file...$(NC)"; \
		if [ -f app/.env.example ]; then \
			cp app/.env.example app/.env.local; \
		else \
			echo -e "$(YELLOW)No app/.env.example found, creating default app/.env.local...$(NC)"; \
			echo "# Next.js Environment Variables\n\n# NextAuth Configuration\nNEXTAUTH_SECRET=your-nextauth-secret\nNEXTAUTH_URL=http://localhost:3000\n\n# Database\nDATABASE_URL=mysql://promptly:promptly123@mysql:3306/promptly\n\n# OAuth Providers (add your own credentials)\n# GitHub\n# GITHUB_ID=\n# GITHUB_SECRET=\n\n# Google\n# GOOGLE_ID=\n# GOOGLE_SECRET=" > app/.env.local; \
		fi; \
		echo -e "$(GREEN)Created app/.env.local file. Please review and update if needed.$(NC)"; \
	fi
	
	@# Create the data directories
	@echo -e "$(YELLOW)Creating data directories...$(NC)"
	@mkdir -p stack/docker/data/mysql
	@mkdir -p stack/docker/data/db_init
	@chmod -R 777 stack/docker/data/mysql
	
	@# Check if the init script exists
	@if [ ! -f stack/docker/data/db_init/01-schema.sql ]; then \
		echo -e "$(YELLOW)No schema file found. Please ensure you have a schema file at stack/docker/data/db_init/01-schema.sql$(NC)"; \
	fi
	
	@echo -e "$(GREEN)Setup complete!$(NC)"
	@echo -e "\nTo start the application, run: $(YELLOW)make start$(NC)"
	@echo -e "To initialize the database (first time), run: $(YELLOW)make db-init$(NC)"
	@echo -e "\n$(GREEN)Happy coding!$(NC)"

# Start application with full logs (for interactive use)
.PHONY: start
start:
	@echo "Starting Promptly Docker environment..."
	@$(DOCKER_COMPOSE) $(DOCKER_COMPOSE_FILE) up --build

# Health check for running services
.PHONY: health
health:
	@echo -e "$(GREEN)=== Promptly Health Check ===$(NC)"
	
	@# Check if Docker containers are running
	@echo -e "\n$(YELLOW)Checking Docker containers...$(NC)"
	@if ! docker ps | grep -q "promptly-app" && ! docker ps | grep -q "promptly-nextjs"; then \
		echo -e "$(RED)Error: Promptly application container is not running.$(NC)"; \
		echo -e "Use $(YELLOW)make up$(NC) to start the application."; \
	else \
		echo -e "$(GREEN)✓ App container is running$(NC)"; \
	fi
	
	@if ! docker ps | grep -q "promptly-mysql"; then \
		echo -e "$(RED)Error: MySQL container is not running.$(NC)"; \
		echo -e "Use $(YELLOW)make up$(NC) to start the application."; \
	else \
		echo -e "$(GREEN)✓ MySQL container is running$(NC)"; \
	fi
	
	@# Check if the application is accessible
	@echo -e "\n$(YELLOW)Checking application access...$(NC)"
	@if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then \
		echo -e "$(GREEN)✓ Application is accessible at http://localhost:3000$(NC)"; \
	else \
		echo -e "$(RED)Error: Cannot access application at http://localhost:3000$(NC)"; \
	fi
	
	@# Check database connection (via the application's health endpoint)
	@echo -e "\n$(YELLOW)Checking database connection...$(NC)"
	@if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health | grep -q "200"; then \
		echo -e "$(GREEN)✓ Database connection is working$(NC)"; \
	else \
		echo -e "$(RED)Warning: Cannot verify database connection.$(NC)"; \
		echo -e "Please check that the $(YELLOW)/api/health$(NC) endpoint is implemented."; \
	fi
	
	@echo -e "\n$(GREEN)Health check completed.$(NC)"

# Build containers, install dependencies and initialize database
.PHONY: build
build:
	@echo "Building containers..."
	@$(DOCKER_COMPOSE) $(DOCKER_COMPOSE_FILE) build
	@echo "Installing dependencies..."
	@$(DOCKER_COMPOSE) $(DOCKER_COMPOSE_FILE) run --rm app npm install
	@echo "Starting containers..."
	@$(DOCKER_COMPOSE) $(DOCKER_COMPOSE_FILE) up -d
	@echo "Initializing database..."
	@$(MAKE) db-init
	@echo "Build complete."

# Start the Docker Compose project
.PHONY: up
up:
	@echo "Starting containers..."
	@$(DOCKER_COMPOSE) $(DOCKER_COMPOSE_FILE) up -d
	@echo "Containers started."
	@echo "App is running at http://localhost:3000"

# Stop the Docker Compose project
.PHONY: down
down:
	@echo "Stopping containers..."
	@$(DOCKER_COMPOSE) $(DOCKER_COMPOSE_FILE) down
	@echo "Containers stopped."

# Restart the Next.js development server
.PHONY: restart-app
restart-app:
	@echo "Restarting Next.js development server..."
	@$(DOCKER_COMPOSE) $(DOCKER_COMPOSE_FILE) restart app
	@echo "Next.js server restarted."

# Show active containers
.PHONY: ps
ps:
	@$(DOCKER_COMPOSE) $(DOCKER_COMPOSE_FILE) ps

# Show logs from all containers
.PHONY: logs
logs:
	@$(DOCKER_COMPOSE) $(DOCKER_COMPOSE_FILE) logs

# Show logs from all containers
.PHONY: tail
tail:
	@$(DOCKER_COMPOSE) $(DOCKER_COMPOSE_FILE) logs -f

# Show logs from the app container
.PHONY: logs-app
logs-app:
	@$(DOCKER_COMPOSE) $(DOCKER_COMPOSE_FILE) logs app

# Show logs from the database container
.PHONY: logs-db
logs-db:
	@$(DOCKER_COMPOSE) $(DOCKER_COMPOSE_FILE) logs db

# Initialize the database
.PHONY: db-init
db-init:
	@echo "Initializing database setup..."
	
	# Start the database if it's not running
	@$(DOCKER_COMPOSE) $(DOCKER_COMPOSE_FILE) up -d db
	
	@echo "Generating Prisma client..."
	@cd app && $(PRISMA_CMD) generate
	
	@echo "Database initialization complete."
	@echo "You can now run 'make db-migrate' to apply migrations."

# Generate and apply migrations
.PHONY: db-migrate
db-migrate:
	@echo "Generating and applying database migrations..."
	
	# Start the database if it's not running
	@$(DOCKER_COMPOSE) $(DOCKER_COMPOSE_FILE) up -d db
	
	@echo "Ensuring dependencies are installed..."
	@if [ ! -d "./app/node_modules/@prisma/client" ]; then \
		(cd app && npm install); \
	fi
	
	# Ensure necessary OpenSSL libraries are installed in the container
	@echo "Installing OpenSSL in container if needed..."
	@$(DOCKER_COMPOSE) $(DOCKER_COMPOSE_FILE) exec -T app sh -c "apk add --no-cache openssl" || true
	
	# Confirm reset before proceeding
	@echo -e "$(RED)WARNING: This will reset your database and all data will be lost.$(NC)"
	@read -p "Do you want to proceed? (y/N): " confirm; \
	if [[ ! "$$confirm" =~ ^[Yy]$$ ]]; then \
		echo "Operation cancelled."; \
		exit 1; \
	fi
	
	# Drop the database and recreate it
	@echo "Dropping database and recreating schema..."
	@$(DOCKER_COMPOSE) $(DOCKER_COMPOSE_FILE) exec -T db mysql -uroot -prootpassword -e "DROP DATABASE IF EXISTS promptly; CREATE DATABASE promptly; GRANT ALL PRIVILEGES ON promptly.* TO 'promptly'@'%';"
	
	# Push schema changes directly to the database
	@echo "Pushing schema to the empty database..."
	@(cd app && $(PRISMA_CMD) db push)
	
	@echo "Schema update complete."

# Push schema changes directly (dev only)
.PHONY: db-push
db-push:
	@echo "Pushing schema changes directly to database (dev mode)..."
	
	# Start the database if it's not running
	@$(DOCKER_COMPOSE) $(DOCKER_COMPOSE_FILE) up -d db
	
	@cd app && $(PRISMA_CMD) db push
	
	@echo "Schema push complete."

# Generate Prisma client
.PHONY: db-generate
db-generate:
	@echo "Generating Prisma client..."
	@cd app && $(PRISMA_CMD) generate
	@echo "Client generation complete."

# Reset the database
.PHONY: db-reset
db-reset:
	@echo "WARNING: This will delete ALL data in the database!"
	@read -p "Are you sure you want to proceed? (y/N) " confirm; \
	if [[ $$confirm =~ ^[Yy]$$ ]]; then \
		echo "Resetting database..."; \
		cd app && $(PRISMA_CMD) migrate reset --force; \
		echo "Database reset complete."; \
	else \
		echo "Database reset cancelled."; \
	fi

# Reset and migrate the database in one operation
.PHONY: db-reset-migrate
db-reset-migrate:
	@echo "Resetting and migrating database..."
	
	# Start the database if it's not running
	@$(DOCKER_COMPOSE) $(DOCKER_COMPOSE_FILE) up -d db
	
	@echo "Ensuring dependencies are installed..."
	@if [ ! -d "./app/node_modules/@prisma/client" ]; then \
		(cd app && npm install); \
	fi
	
	# Drop the database and recreate it
	@echo "Dropping database and recreating schema..."
	@$(DOCKER_COMPOSE) $(DOCKER_COMPOSE_FILE) exec -T db mysql -uroot -prootpassword -e "DROP DATABASE IF EXISTS promptly; CREATE DATABASE promptly; GRANT ALL PRIVILEGES ON promptly.* TO 'promptly'@'%';"
	
	# Push schema changes directly to the database
	@echo "Pushing schema to the empty database..."
	@(cd app && $(PRISMA_CMD) db push)
	
	@echo "Reset and migration complete."

# Open Prisma Studio
.PHONY: db-studio
db-studio:
	@echo "Opening Prisma Studio..."
	
	# Start the database if it's not running
	@$(DOCKER_COMPOSE) $(DOCKER_COMPOSE_FILE) up -d db
	
	@cd app && $(PRISMA_CMD) studio

# Display MySQL integration guide
.PHONY: mysql-guide
mysql-guide:
	@echo ""
	@echo "To integrate MySQL with your NextAuth.js setup, you'll need to add these dependencies to your project:"
	@echo ""
	@echo "1. Run this command in your app directory:"
	@echo "   npm install mysql2 @auth/prisma-adapter @prisma/client"
	@echo ""
	@echo "2. Initialize Prisma:"
	@echo "   npx prisma init"
	@echo ""
	@echo "3. Update the Prisma schema based on your MySQL database structure."
	@echo "   The schema file will be created at: app/prisma/schema.prisma"
	@echo ""
	@echo "4. Set the datasource in the schema file to:"
	@echo "   datasource db {"
	@echo "     provider = \"mysql\""
	@echo "     url      = env(\"DATABASE_URL\")"
	@echo "   }"
	@echo ""
	@echo "5. Generate the Prisma client:"
	@echo "   npx prisma generate"
	@echo ""
	@echo "6. Update the NextAuth configuration to use the Prisma adapter."
	@echo ""
	@echo "A complete example schema is available in the project documentation."

# Remove all containers, volumes, and reset the database
.PHONY: clean
clean:
	@echo "Warning: This will delete all containers, volumes, and data."
	@read -p "Are you sure you want to continue? [y/N] " confirm; \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		echo "Stopping containers..."; \
		$(DOCKER_COMPOSE) $(DOCKER_COMPOSE_FILE) down -v; \
		echo "Removing data directories..."; \
		rm -rf stack/docker/data/mysql/*; \
		echo "Clean complete."; \
	else \
		echo "Operation cancelled."; \
	fi

# Ensure app deps installed in container
.PHONY: deps-install
deps-install:
	@echo "Ensuring dependencies are installed in app container..."
	@$(DOCKER_COMPOSE) $(DOCKER_COMPOSE_FILE) up -d app db
	@$(APP_EXEC) "cd /app && npm install"
	@$(APP_EXEC) "cd /app && npx prisma generate"

# Wait for the health endpoint to be ready
.PHONY: wait-health
wait-health:
	@echo "Waiting for app health endpoint..."
	@attempts=0; \
	until curl -sf http://localhost:3000/api/health >/dev/null 2>&1; do \
	  attempts=$$((attempts+1)); \
	  if [ $$attempts -gt 60 ]; then \
	    echo "App did not become healthy in time."; \
	    exit 1; \
	  fi; \
	  sleep 1; \
	done; \
	echo "Health endpoint is up."

# Run unit tests inside app container
.PHONY: test-unit
test-unit: deps-install
	@echo "Running unit tests..."
	@$(APP_EXEC) "cd /app && npm run test:unit"

# Run e2e tests (vitest e2e) against running app
.PHONY: test-e2e
test-e2e: deps-install wait-health
	@echo "Running e2e tests..."
	@$(APP_EXEC) "cd /app && npm run test:e2e"

# Run both unit and e2e tests
.PHONY: test-all
test-all: test-unit test-e2e
	@echo "All tests completed."
