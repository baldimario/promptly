# Promptly - AI Prompt Sharing Platform

Promptly is a modern web platform where users can share, discover, and rate AI prompts. The application allows users to log in, follow other users, and interact with prompts through comments and ratings.

## Features

- **User Authentication**: Sign up, log in, and manage user profiles
- **Prompt Sharing**: Users can share prompts with example outputs and suggested models
- **Search & Discovery**: Search for prompts by category or tags
- **Social Features**: Follow users and see their prompts in a feed
- **Rating System**: Rate prompts and view average ratings
- **Comments**: Leave comments on prompts

## Technology Stack

- **Frontend**: Next.js 15 with App Router, React 19, Tailwind CSS 4
- **Backend**: Next.js API Routes
- **Database**: MySQL 8.0 with Prisma ORM
- **Authentication**: NextAuth.js
- **Containerization**: Docker & Docker Compose

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/get-started) and Docker Compose
- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) (v8 or later)

### First-Time Setup Guide

Follow these steps sequentially to set up your development environment from scratch:

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd promptly
   ```

2. **Run the setup command**

   This will create all necessary directories and environment files:

   ```bash
   make setup
   ```

3. **Configure environment variables**

   ```bash
   # Verify and edit Docker environment variables if needed
   nano stack/docker/.env
   
   # Configure Next.js application variables
   cp app/.env.example app/.env.local
   nano app/.env.local
   ```

4. **Build and start the containers**

   ```bash
   # Build containers and start in detached mode
   make build
   ```

5. **Initialize the database**

   ```bash
   # Generate Prisma client and prepare the database
   make db-init
   
   # Apply the database schema
   make db-push
   ```

6. **Verify the setup**

   ```bash
   # Check that all containers are running
   make ps
   
   # Check the application and database health
   make health
   ```

7. **Open your browser and navigate to:**

   ```
   http://localhost:3000
   ```

8. **Access phpMyAdmin (optional):**

   To manage your database through a web interface:

   ```
   http://localhost:8080
   
   Username: promptly
   Password: promptlypass
   ```

### Regular Startup

After the initial setup, you can use these commands for your regular workflow:

1. **Start the application**

   ```bash
   make up
   ```

2. **View logs (in a separate terminal)**

   ```bash
   make logs
   ```

3. **Stop the application when finished**

   ```bash
   make down
   ```

## Database Management

The project includes the following database management commands:

- `make db-init`: Initialize the database (first-time setup)
- `make db-migrate`: Generate and apply migrations
- `make db-push`: Push schema changes directly to the database (development only)
- `make db-generate`: Generate Prisma client
- `make db-studio`: Open Prisma Studio to browse and edit data
- `make db-reset`: Reset the database (WARNING: Deletes all data!)
- `make db-reset-migrate`: Reset database and apply schema changes (WARNING: Deletes all data!)
- `make db-reset`
- `make db-reset-migrate`
- `make db-studio`

## Development Workflow

### Day-to-Day Development

1. **Start your development environment**

   ```bash
   # Start all services in detached mode
   make up
   
   # View logs if needed
   make logs
   ```

2. **Make code changes** in the `app/` directory
   - All changes are immediately reflected due to the volume mount
   - Next.js hot reloading will update the browser automatically

3. **Apply database changes**:
   
   ```bash
   # Edit the Prisma schema
   nano app/prisma/schema.prisma
   
   # Generate and apply changes
   make db-push
   
   # If needed, generate Prisma client
   make db-generate
   ```

4. **Test your changes**
   
   ```bash
   # You can run tests from inside the container
   docker compose -f stack/docker/docker-compose.yaml exec app npm test
   ```

5. **View database via Prisma Studio**
   
   ```bash
   # Open Prisma Studio in your browser
   make db-studio
   ```

6. **Shut down when done**
   
   ```bash
   # Stop all containers
   make down
   ```

## Project Structure

```
promptly/
├── app/                   # Next.js application
│   ├── prisma/            # Prisma schema and migrations
│   │   ├── schema.prisma  # Database schema definition
│   │   └── migrations/    # Database migrations
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── app/           # Next.js App Router pages
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions and shared code
│   ├── .env.example       # Example environment variables
│   └── .env.local         # Local environment variables (not in git)
│
├── stack/                 # Infrastructure components
│   └── docker/            # Docker related files
│       ├── app/           # Application container configs
│       │   └── Dockerfile # Docker configuration for the app
│       ├── data/          # Data directory (not in git)
│       │   ├── mysql/     # MySQL data files
│       │   └── db_init/   # Database initialization scripts
│       ├── docker-compose.yaml # Docker Compose configuration
│       └── .env           # Docker Compose environment variables
│
├── mockups/              # UI/UX design mockups
├── Makefile              # Project management commands
├── COMMANDS.md           # Quick reference for common commands
├── CONTRIBUTING.md       # Contribution guidelines
└── README.md             # Project documentation
```

## Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Commit your changes: `git commit -m 'Add some feature'`
3. Push to the branch: `git push origin feature/my-feature`
4. Open a pull request

## Troubleshooting

### Common Issues and Solutions

#### Database Connection Issues

If the application can't connect to the database:

```bash
# Check if the database container is running
make ps

# Restart the database container
make down
make up

# Verify database initialization
make db-init
```

#### Node Modules Issues

If you're experiencing dependency-related errors:

```bash
# Enter the app container
docker compose -f stack/docker/docker-compose.yaml exec app bash

# Install/rebuild dependencies
npm install

# Exit the container
exit
```

#### Permission Issues with Data Directory

If you see permission errors related to the MySQL data directory:

```bash
# Fix permissions for the data directory
sudo chmod -R 777 stack/docker/data/mysql
```

#### Reset Everything and Start Fresh

If you want to completely reset the environment:

```bash
# Stop all containers and remove volumes
make clean

# Set up everything again
make setup
make build
make db-init
make db-push
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
