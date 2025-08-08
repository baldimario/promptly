import prisma from '@/lib/prisma';

export class FollowService {
  static async isFollowing(followerId: string | null | undefined, followingId: string | null | undefined): Promise<boolean> {
    if (!followerId || !followingId) return false;
    const follow = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
      select: { followerId: true },
    });
    return !!follow;
  }

  static async follow(followerId: string, followingId: string) {
    await prisma.follow.create({ data: { followerId, followingId } });
    const followerCount = await prisma.follow.count({ where: { followingId } });
    return { followerCount };
  }

  static async unfollow(followerId: string, followingId: string) {
    await prisma.follow.delete({ where: { followerId_followingId: { followerId, followingId } } });
    const followerCount = await prisma.follow.count({ where: { followingId } });
    return { followerCount };
  }

  static async listFollowers(params: {
    userId: string; // the user being followed
    currentUserId: string; // the viewing user to compute isFollowing
    page?: number;
    limit?: number;
  }) {
    const { userId, currentUserId, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followingId: userId },
        select: {
          follower: { select: { id: true, name: true, image: true, bio: true } },
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.follow.count({ where: { followingId: userId } }),
    ]);

    const followers = await Promise.all(
      rows.map(async (row) => {
        const isFollowing = await this.isFollowing(currentUserId, row.follower.id);
        return {
          ...row.follower,
          isFollowing,
          followedSince: row.createdAt,
        };
      })
    );

    return {
      followers,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  static async listFollowing(params: {
    userId: string; // the follower user
    page?: number;
    limit?: number;
  }) {
    const { userId, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followerId: userId },
        select: {
          following: { select: { id: true, name: true, image: true, bio: true } },
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.follow.count({ where: { followerId: userId } }),
    ]);

    const following = rows.map((row) => ({
      ...row.following,
      followingSince: row.createdAt,
      isFollowing: true,
    }));

    return {
      following,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
