import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { FollowService } from "@/services/FollowService";

// API endpoint to follow or unfollow a user
export async function POST(
  req: NextRequest,
  context: any
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

  // Get user IDs
  const followerId = session.user.id;
  // Ensure params is awaited properly before accessing properties
  const resolvedParams = await Promise.resolve((context?.params || {}) as { id: string });
  const { id: followingId } = resolvedParams;
    
    if (!followerId) {
      return NextResponse.json({ error: "User ID not found in session" }, { status: 400 });
    }
    
    if (!followingId) {
      return NextResponse.json({ error: "Target user ID is required" }, { status: 400 });
    }
    
    // Prevent self-following
    if (followerId === followingId) {
      return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
    }

    // Get request body
    const { action } = await req.json();
    
    if (action !== 'follow' && action !== 'unfollow') {
      return NextResponse.json({ error: "Invalid action. Use 'follow' or 'unfollow'." }, { status: 400 });
    }
    
    // Check if the target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: followingId },
    });
    
    if (!targetUser) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 });
    }

    if (action === 'follow') {
      const exists = await FollowService.isFollowing(followerId, followingId);
      if (exists) return NextResponse.json({ error: "Already following this user" }, { status: 400 });
      await FollowService.follow(followerId, followingId);
    } else {
      await FollowService.unfollow(followerId, followingId);
    }
    
    // Get updated follower count for this user
  const followerCount = await prisma.follow.count({ where: { followingId } });
    
    return NextResponse.json({
      success: true,
      action,
      followingId,
      followerCount,
    });
  } catch (error) {
    console.error("Error in follow/unfollow operation:", error);
    return NextResponse.json(
      { error: "Failed to process follow/unfollow request" },
      { status: 500 }
    );
  }
}
