# Services

## PromptService
Responsibilities:
* List prompts with filters (search, category, etc.)
* Aggregate rating + saved status
* Image fallback logic & tag normalization

## RatingService
* Upsert rating
* Return updated aggregates (average + count)

## FollowService
* Follow/unfollow lifecycle
* List followers/following with pagination
* `isFollowing` checks

## SaveService
* Toggle save
* Check & count saved prompts
* List saved prompt IDs

## Patterns
* Stateless functions using shared Prisma instance
* Reuse composition (overlay saved flags after base query)

## Future Candidates
* TagService
* CategoryService (slug normalization)
