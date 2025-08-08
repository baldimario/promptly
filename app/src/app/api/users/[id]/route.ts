import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

// API endpoint to get a user's profile
export async function GET(
  req: NextRequest,
  context: any
) {
  try {
    // Await params properly before accessing properties
    const resolvedParams = await Promise.resolve((context?.params || {}) as { id: string });
    const { id: userId } = resolvedParams;
    
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Get the current user session to check if the visitor is following this user
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id;

    // Get the user profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        _count: {
          select: {
            prompts: true,
            followedBy: true,
            following: true,
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if the current user is following this user
    let isFollowing = false;
    if (currentUserId) {
      const followRecord = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: userId,
          }
        }
      });
      isFollowing = !!followRecord;
    }

    return NextResponse.json({
      ...user,
      isFollowing
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}
