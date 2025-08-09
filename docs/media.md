# Media & File Uploads

## Storage
Local filesystem under `public/uploads` mounted as a persistent volume.

## Flow
1. User submits form with file(s)
2. `saveUploadedFiles` saves to `/public/uploads/images/<uuid>_<timestamp>.ext`
3. URL stored or returned (`/uploads/images/...`)
4. Served directly by Next.js static file serving

## Fallback Images
* Placeholder via `getPromptImageUrl`
* External avatar service is unoptimized (bypass proxy) to avoid failures

## Future Enhancements
* MIME type validation & size limits
* Thumbnail generation (sharp) asynchronously
* Cleanup script for stale uploads
