import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { SaveService } from "@/services/SaveService";
import { parseTags } from "@/utils/format";

// API endpoint to get current user's saved prompts
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
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get saved prompts with pagination
    const savedPrompts = await prisma.savedPrompt.findMany({
      where: {
        userId: userId,
      },
      select: {
        prompt: {
          select: {
            id: true,
            title: true,
            description: true,
            image: true,
            createdAt: true,
            userId: true,
            promptText: true,
            exampleOutputs: true,
            suggestedModel: true,
            tags: true,
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            ratings: {
              select: {
                rating: true,
              },
            },
            _count: {
              select: { ratings: true },
            },
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

    // Get total count of saved prompts
  const totalSavedPrompts = await SaveService.countForUser(userId);

    // Format the response to flatten the data structure
    const prompts = savedPrompts.map(savedPrompt => {
      const p = savedPrompt.prompt;
      return {
        id: p.id,
        title: p.title,
        description: p.description,
        promptText: (p as any).promptText,
        exampleOutputs: (p as any).exampleOutputs,
        suggestedModel: (p as any).suggestedModel,
        image: p.image,
        createdAt: p.createdAt,
        userId: (p as any).userId,
        user: p.user,
        userName: p.user?.name || 'Unknown',
        userImage: p.user?.image || null,
        tags: parseTags((p as any).tags),
        categoryId: (p as any).categoryId,
        categoryName: (p as any).category?.name,
        categoryImage: (p as any).category?.image,
        averageRating: (p._count?.ratings && p._count.ratings > 0)
          ? (p.ratings?.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / p._count.ratings)
          : 0,
        _count: { ratings: p._count?.ratings || 0 },
        isSaved: true,
        savedAt: savedPrompt.createdAt,
        author: p.user,
      };
    });

    return NextResponse.json({
      prompts,
      pagination: {
        total: totalSavedPrompts,
        page,
        limit,
        totalPages: Math.ceil(totalSavedPrompts / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching saved prompts:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved prompts" },
      { status: 500 }
    );
  }
}
