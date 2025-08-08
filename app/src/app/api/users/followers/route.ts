import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

// API endpoint to get current user's followers
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user ID from session
    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found in session" }, { status: 400 });
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Get followers with pagination
    const follows = await prisma.follow.findMany({
      where: {
        followingId: userId, // Users following the current user
      },
      select: {
        follower: {
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
          },
        },
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    // Get total count of followers
    const totalFollowers = await prisma.follow.count({
      where: {
        followingId: userId,
      },
    });

    // Format the response to include whether the current user is following each follower
    const followersWithFollowStatus = await Promise.all(
      follows.map(async (follow) => {
        // Check if current user is following this follower
        const isFollowing = await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: userId,
              followingId: follow.follower.id,
            },
          },
        });

        return {
          ...follow.follower,
          isFollowing: !!isFollowing,
          followedSince: follow.createdAt,
        };
      })
    );

    return NextResponse.json({
      followers: followersWithFollowStatus,
      pagination: {
        total: totalFollowers,
        page,
        limit,
        totalPages: Math.ceil(totalFollowers / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching followers:", error);
    return NextResponse.json(
      { error: "Failed to fetch followers" },
      { status: 500 }
    );
  }
}
