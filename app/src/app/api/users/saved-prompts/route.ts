import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

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
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
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
    const totalSavedPrompts = await prisma.savedPrompt.count({
      where: {
        userId: userId,
      },
    });

    // Format the response to flatten the data structure
    const prompts = savedPrompts.map(savedPrompt => ({
      id: savedPrompt.prompt.id,
      title: savedPrompt.prompt.title,
      description: savedPrompt.prompt.description,
      image: savedPrompt.prompt.image,
      createdAt: savedPrompt.prompt.createdAt,
      savedAt: savedPrompt.createdAt,
      author: savedPrompt.prompt.user,
    }));

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
