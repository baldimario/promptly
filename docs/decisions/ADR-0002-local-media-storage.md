# ADR-0002: Local Media Storage

## Status
Accepted

## Context
External media service would add dependency, cost, and secrets.

## Decision
Store uploads locally (`public/uploads`) with a Docker volume.

## Consequences
* + Simplicity
* + No external billing
* - No automatic CDN
* - Must manage storage growth

## Future
Optionally adopt S3/minio + CDN when scale demands.
