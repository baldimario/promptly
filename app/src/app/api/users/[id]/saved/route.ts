import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { parseTags } from "@/utils/format";

// API endpoint to get a user's saved prompts
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

    // Get the current user session
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id;

    // Verify if the requesting user is authorized to view saved prompts
    // Users should only see their own saved prompts
    if (userId !== currentUserId) {
      return NextResponse.json({ error: "Not authorized to view saved prompts" }, { status: 403 });
    }

    // Get the user's saved prompts
    const savedPrompts = await prisma.savedPrompt.findMany({
      where: {
        userId: userId
      },
      include: {
        prompt: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            },
            category: {
              select: {
                id: true,
                name: true,
                image: true
              }
            },
            ratings: {
              select: {
                rating: true
              }
            },
            _count: {
              select: { 
                ratings: true 
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    }) as unknown as SavedPromptWithIncludes[];

    // Define types for Prisma response
    interface RatingInfo {
      rating: number;
    }
    
    interface CategoryInfo {
      id: string;
      name: string;
      image: string | null;
    }
    
    interface PromptWithIncludes {
      id: string;
      title: string;
      description: string;
      promptText: string;
      exampleOutputs: string | null;
      suggestedModel: string;
      image: string | null;
      userId: string;
      tags: string | null;
      categoryId: string | null;
      createdAt: Date;
      updatedAt: Date;
      user: {
        id: string;
        name: string;
        image: string | null;
      };
      category: CategoryInfo | null;
      ratings: RatingInfo[];
      _count: {
        ratings: number;
      };
    }
    
    interface SavedPromptWithIncludes {
      id: string;
      userId: string;
      promptId: string;
      createdAt: Date;
      prompt: PromptWithIncludes;
    }

    // Format the prompts data
    const formattedPrompts = savedPrompts.map((savedPrompt: SavedPromptWithIncludes) => {
      const prompt = savedPrompt.prompt;
      
      // Calculate average rating
      const totalRating = prompt.ratings.reduce((sum: number, rating: RatingInfo) => sum + rating.rating, 0);
      const averageRating = prompt.ratings.length > 0 ? totalRating / prompt.ratings.length : 0;
      
      // Extract tags from JSON string if available
  const tags = parseTags(prompt.tags);
      
      // Format category
      const categoryName = prompt.category?.name || null;
      const categoryId = prompt.category?.id || null;
      const categoryImage = prompt.category?.image || null;
      
      // Remove ratings array and category object from response
      const { ratings, category, ...promptWithoutRatings } = prompt;
      
      return {
        ...promptWithoutRatings,
        categoryId,
        categoryName,
        categoryImage,
        tags,
        averageRating,
        isSaved: true  // These are saved prompts
      };
    });

    return NextResponse.json(formattedPrompts);
  } catch (error) {
    console.error("Error fetching saved prompts:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved prompts" },
      { status: 500 }
    );
  }
}
