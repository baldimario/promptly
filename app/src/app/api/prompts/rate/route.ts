import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { RatingService } from "@/services/RatingService";

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
    
    // Upsert rating and compute aggregates
    const { averageRating, totalRatings } = await RatingService.ratePrompt({ userId, promptId, rating });

    return NextResponse.json({
      success: true,
      rating: { promptId, userId, rating },
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
