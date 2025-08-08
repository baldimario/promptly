import prisma from '@/lib/prisma';
import { averageRating, parseTags, avatarUrl } from '@/utils/format';
import { getPromptImageUrl } from '@/utils/placeholderImage';
import { ImageService } from './ImageService';

export class PromptService {
  static async getById(id: string, currentUserId?: string | null) {
    const prompt = await prisma.prompt.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, image: true } },
        category: { select: { id: true, name: true, image: true, description: true } },
        ratings: { select: { rating: true } },
        comments: {
          include: { user: { select: { id: true, name: true, image: true } } },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { ratings: true } },
      },
    });

    if (!prompt) return null;

    const images = ImageService.listPromptImages(prompt.id);
  const imageUrls = images.length > 0 ? images : prompt.image ? [prompt.image] : [];

    const isSaved = currentUserId
      ? !!(await prisma.savedPrompt.findUnique({
          where: { userId_promptId: { userId: currentUserId, promptId: id } },
        }))
      : false;

    const tags = parseTags(prompt.tags as string | null | undefined);
    const avg = averageRating(prompt.ratings);

    return {
      id: prompt.id,
      title: prompt.title,
      description: prompt.description,
      promptText: prompt.promptText,
      exampleOutputs: prompt.exampleOutputs,
      suggestedModel: prompt.suggestedModel,
  image: prompt.image || getPromptImageUrl({ title: prompt.title, userName: prompt.user?.name || 'Unknown', tags }),
      imageUrls,
      userId: prompt.userId,
      userName: prompt.user?.name || 'Unknown',
      userImage: avatarUrl(prompt.user?.name || 'Unknown', prompt.user?.image || null),
      createdAt: prompt.createdAt.toISOString(),
      ratings: avg,
      numRatings: prompt._count?.ratings || 0,
      comments: prompt.comments.map((c) => ({
        id: c.id,
        userId: c.userId,
        userName: c.user?.name || 'Anonymous User',
        userImage: avatarUrl(c.user?.name || 'Anonymous', c.user?.image || null),
        text: c.text,
        createdAt: c.createdAt.toISOString(),
      })),
      categoryId: prompt.categoryId || undefined,
      categoryName: prompt.category?.name,
      categoryImage: prompt.category?.image || undefined,
      tags,
      isSaved,
    };
  }

  static async list(options: {
    currentUserId?: string | null;
    userId?: string | null;
    categoryId?: string | null;
    q?: string | null;
    sort?: 'recent' | 'trending';
    page?: number;
    pageSize?: number;
  }) {
    const { currentUserId, userId, categoryId, q, sort = 'recent', page = 1, pageSize = 20 } = options;

    const where: any = {};
    if (userId) where.userId = userId;
    if (categoryId) where.categoryId = categoryId;
    if (q) where.OR = [{ title: { contains: q } }, { description: { contains: q } }];

    const total = await prisma.prompt.count({ where });
    const orderBy: any =
      sort === 'trending' ? { ratings: { _count: 'desc' as const } } : { createdAt: 'desc' as const };

    const prompts = await prisma.prompt.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, image: true } },
        category: true,
        ratings: { select: { rating: true } },
        _count: { select: { ratings: true } },
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    let savedIds: string[] = [];
    if (currentUserId) {
      const saved = await prisma.savedPrompt.findMany({
        where: { userId: currentUserId },
        select: { promptId: true },
      });
      savedIds = saved.map((s) => s.promptId);
    }

  const items = prompts.map((p: any) => {
      const tags = parseTags(p.tags as string | null | undefined);
      const avg = averageRating(p.ratings);
      const images = ImageService.listPromptImages(p.id);
      const imageUrls = images.length > 0 ? images : p.image ? [p.image] : [];
  const mainImage = p.image || imageUrls[0] || getPromptImageUrl({ title: p.title, userName: p.user?.name || 'Unknown', tags });

      return {
        id: p.id,
        title: p.title,
        description: p.description,
        promptText: p.promptText,
        exampleOutputs: p.exampleOutputs,
        image: mainImage,
        imageUrls: imageUrls.length > 0 ? imageUrls : mainImage ? [mainImage] : [],
        userId: p.userId,
        userName: p.user?.name || 'Unknown',
        userImage: avatarUrl(p.user?.name || 'Unknown', p.user?.image || null),
        createdAt: p.createdAt.toISOString(),
        tags,
        categoryId: p.categoryId || undefined,
        categoryName: p.category?.name,
        categoryImage: (p as any).category?.image,
        rating: avg,
        averageRating: avg,
        numRatings: p._count?.ratings || 0,
        suggestedModel: (p as any).suggestedModel,
        isSaved: currentUserId ? savedIds.includes(p.id) : false,
      };
    });

    return {
      prompts: items,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  }
}
