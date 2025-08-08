import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RatingService } from '@/services/RatingService';

vi.mock('@/lib/prisma', () => {
  const db: any = {
    prompt: { findUnique: vi.fn(async ({ where }: any) => (where.id ? { id: where.id } : null)) },
    rating: {
      upsert: vi.fn(async () => ({})),
      findMany: vi.fn(async () => [{ rating: 4 }, { rating: 2 }]),
    },
  };
  return { default: db, prisma: db };
});

describe('RatingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('upserts rating and returns aggregates', async () => {
    const result = await RatingService.ratePrompt({ userId: 'u1', promptId: 'p1', rating: 5 });
    expect(result.averageRating).toBe(3);
    expect(result.totalRatings).toBe(2);
  });
});
