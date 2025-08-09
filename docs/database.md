# Database

## Stack
* MySQL 8
* Prisma ORM (`prisma/schema.prisma`)

## Migrations
* Local: `npx prisma migrate dev`
* Production: `npx prisma migrate deploy` (during deploy or container start)

## Initialization
* Dev scripts under `stack/docker/data/db_init` (if any)

## Connection
`DATABASE_URL=mysql://USER:PASS@HOST:3306/DB`

## Best Practices
* Edit only Prisma schema (avoid manual DB drift)
* Add indexes for frequent filters (e.g., `createdAt`, `categoryName`, `userId`)

## Future
* Full-text search
* Archive or partition large tables if growth demands
