import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { FollowService } from "@/services/FollowService";

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user ID from session
    const followerId = session.user.id;
    if (!followerId) {
      return NextResponse.json({ error: "User ID not found in session" }, { status: 400 });
    }

    // Get request body
    const { userId, action } = await req.json();
    
    if (!userId) {
      return NextResponse.json({ error: "Target user ID is required" }, { status: 400 });
    }
    
    if (followerId === userId) {
      return NextResponse.json({ error: "You cannot follow yourself" }, { status: 400 });
    }
    
    // Check if the target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!targetUser) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 });
    }

    // Handle follow/unfollow action
    if (action === 'follow') {
      const exists = await FollowService.isFollowing(followerId, userId);
      if (exists) return NextResponse.json({ error: "Already following this user" }, { status: 400 });
      await FollowService.follow(followerId, userId);
    } else if (action === 'unfollow') {
      await FollowService.unfollow(followerId, userId);
    } else {
      return NextResponse.json({ error: "Invalid action. Use 'follow' or 'unfollow'." }, { status: 400 });
    }
    
    // Get updated follower count
    const followerCount = await prisma.follow.count({ where: { followingId: userId } });
    
    return NextResponse.json({
      success: true,
      action,
      userId,
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
