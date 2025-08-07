import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// API endpoint for rating prompts
export async function POST(req: NextRequest) {
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
    const { promptId, rating } = await req.json();
    
    if (!promptId) {
      return NextResponse.json({ error: "Prompt ID is required" }, { status: 400 });
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }
    
    // Check if the prompt exists
    const prompt = await prisma.prompt.findUnique({
      where: { id: promptId },
    });
    
    if (!prompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    // Check if user has already rated this prompt
    const existingRating = await prisma.rating.findUnique({
      where: {
        promptId_userId: {
          promptId,
          userId,
        },
      },
    });

    let userRating;

    if (existingRating) {
      // Update existing rating
      userRating = await prisma.rating.update({
        where: {
          id: existingRating.id,
        },
        data: {
          rating: rating,
        },
      });
    } else {
      // Create new rating
      userRating = await prisma.rating.create({
        data: {
          promptId,
          userId,
          rating: rating,
        },
      });
    }

    // Calculate new average rating
    const ratings = await prisma.rating.findMany({
      where: {
        promptId,
      },
      select: {
        rating: true,
      },
    });

    const totalRatings = ratings.length;
    const averageRating = ratings.reduce((sum, item) => sum + item.rating, 0) / totalRatings;

    return NextResponse.json({
      success: true,
      rating: userRating,
      averageRating,
      totalRatings,
    });
  } catch (error) {
    console.error("Error rating prompt:", error);
    return NextResponse.json(
      { error: "Failed to process rating" },
      { status: 500 }
    );
  }
}
