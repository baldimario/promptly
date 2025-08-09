# ADR-0001: Introduce Service Layer

## Status
Accepted

## Context
Route handlers duplicated Prisma queries & formatting.

## Decision
Create services (Prompt, Rating, Follow, Save) encapsulating data access & logic.

## Consequences
* + Reuse & testability
* + Centralized logic
* - Added indirection

## Alternatives
Inline queries (rejected for maintainability).
