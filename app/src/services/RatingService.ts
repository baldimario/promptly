import prisma from '@/lib/prisma';
import { averageRating } from '@/utils/format';

export class RatingService {
  static async ratePrompt(params: { userId: string; promptId: string; rating: number }) {
    const { userId, promptId, rating } = params;

    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const prompt = await prisma.prompt.findUnique({ where: { id: promptId }, select: { id: true } });
    if (!prompt) throw new Error('Prompt not found');

    // Upsert rating (unique on promptId+userId)
    await prisma.rating.upsert({
      where: { promptId_userId: { promptId, userId } },
      update: { rating },
      create: { promptId, userId, rating },
    });

    // Compute aggregate
    const ratings = await prisma.rating.findMany({ where: { promptId }, select: { rating: true } });
    const avg = averageRating(ratings);
    return { averageRating: avg, totalRatings: ratings.length };
  }
}
