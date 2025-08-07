import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

// Helper function to process avatar URL or data
function processAvatarImage(avatar: string | undefined): string | undefined {
  if (!avatar) return undefined;
  
  // If it's a data URL (base64), create a fallback URL using UI Avatars
  if (avatar.startsWith('data:image')) {
    // For data URLs, we'll use UI Avatars as a fallback since we can't store large data URLs
    return undefined; // Will use the name-based avatar from the frontend
  }
  
  return avatar;
}

// API route to update user profile
export async function PUT(req: NextRequest) {
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

    // Get request body
    const { name, bio, avatar } = await req.json();
    
    // Process the avatar URL to avoid database issues
    const processedAvatar = processAvatarImage(avatar);

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || undefined,
        bio: bio || undefined,
        image: processedAvatar,
      },
    });

    // Remove sensitive fields
    const { password, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({
      user: userWithoutPassword,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

// API route to get user profile
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

    // Get user from database with count of followers and following
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        createdAt: true,
        _count: {
          select: {
            followedBy: true, // Count of followers
            following: true,  // Count of users being followed
            prompts: true     // Count of prompts created
          }
        }
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
