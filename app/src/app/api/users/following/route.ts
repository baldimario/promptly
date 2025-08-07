import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

// API endpoint to get users the current user is following
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

    // Get users being followed with pagination
    const follows = await prisma.follow.findMany({
      where: {
        followerId: userId, // Current user is following these users
      },
      select: {
        following: {
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

    // Get total count of followed users
    const totalFollowing = await prisma.follow.count({
      where: {
        followerId: userId,
      },
    });

    // Format the response
    const following = follows.map(follow => ({
      ...follow.following,
      followingSince: follow.createdAt,
      isFollowing: true, // Current user is following all these users
    }));

    return NextResponse.json({
      following,
      pagination: {
        total: totalFollowing,
        page,
        limit,
        totalPages: Math.ceil(totalFollowing / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching following list:", error);
    return NextResponse.json(
      { error: "Failed to fetch following list" },
      { status: 500 }
    );
  }
}
