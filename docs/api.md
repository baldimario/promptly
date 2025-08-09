# API Guide

## Conventions
* JSON responses
* Errors: `{ "error": "message" }`
* Pagination: `page`, `pageSize`; response includes `pagination` object
* Rating fields: `rating` (average), `averageRating` (alias), `numRatings`
* Saved flag: `isSaved`

## Representative Endpoints
| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/prompts` | GET | List prompts w/ filters | Optional |
| `/api/prompts` | POST | Create prompt (uploads) | Required |
| `/api/prompts/[id]` | GET | Prompt details | Optional |
| `/api/prompts/rate` | POST | Rate a prompt | Required |
| `/api/prompts/save` | POST | Toggle save | Required |
| `/api/users/[id]` | GET | Profile & follow status | Optional |
| `/api/users/[id]/prompts` | GET | User prompts | Optional |
| `/api/users/[id]/saved` | GET | Saved prompts | Auth (if privacy later) |
| `/api/follow` | POST | Follow/unfollow target | Required |

## Prompt Filters
| Param | Description |
|-------|-------------|
| `q` | Text search (title, description, promptText, tags) |
| `category` | Category name |
| `sort` | `recent` | `trending` | `oldest` |
| `page`, `pageSize` | Pagination |
| `minRating` | Minimum average rating (post-filter) |

## Example
```
GET /api/prompts?q=chatgpt&sort=trending&page=2&pageSize=20
```

## Example List Response
```json
{
  "prompts": [
    {
      "id": "...",
      "title": "...",
      "rating": 4.6,
      "averageRating": 4.6,
      "numRatings": 12,
      "isSaved": true,
      "image": "/uploads/images/abc.png",
      "imageUrls": ["/uploads/images/abc.png"],
      "tags": ["ai","chat"],
      "user": { "id":"u1","name":"Jane" }
    }
  ],
  "pagination": { "page":2,"pageSize":20 }
}
```

## Authentication
* next-auth session (cookies)
* Use `getServerSession(authOptions)` in route handlers

## Roadmap
* Add rate limiting & request validation
* Standard OpenAPI/Swagger spec generation
