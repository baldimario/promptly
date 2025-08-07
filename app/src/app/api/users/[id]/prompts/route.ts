import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// Define interfaces for types
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

// API endpoint to get a user's prompts
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Await params properly before accessing properties
    const resolvedParams = await Promise.resolve(params);
    const { id: userId } = resolvedParams;
    
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Get the current user session to check if prompts are saved by current user
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id;

    // Get saved prompts if user is logged in
    let savedPromptIds: string[] = [];
    if (currentUserId) {
      const savedPrompts = await prisma.savedPrompt.findMany({
        where: {
          userId: currentUserId
        },
        select: {
          promptId: true
        }
      });
      savedPromptIds = savedPrompts.map(sp => sp.promptId);
    }

    // Get the user's prompts
    const prompts = await prisma.prompt.findMany({
      where: {
        userId: userId
      },
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    }) as unknown as PromptWithIncludes[];

    // Format the prompts data
    const formattedPrompts = prompts.map((prompt: PromptWithIncludes) => {
      // Calculate average rating
      const totalRating = prompt.ratings.reduce((sum: number, rating: RatingInfo) => sum + rating.rating, 0);
      const averageRating = prompt.ratings.length > 0 ? totalRating / prompt.ratings.length : 0;
      
      // Extract tags from JSON string if available
      let tags: string[] = [];
      if (prompt.tags) {
        try {
          tags = JSON.parse(prompt.tags);
        } catch (e) {
          console.error('Error parsing tags:', e);
        }
      }
      
      // Format category
      const categoryName = prompt.category?.name || null;
      const categoryId = prompt.category?.id || null;
      const categoryImage = prompt.category?.image || null;
      
      // Check if prompt is saved by current user
      const isSaved = currentUserId ? savedPromptIds.includes(prompt.id) : false;
      
      // Remove ratings array and category object from response
      const { ratings, category, ...promptWithoutRatings } = prompt;
      
      return {
        ...promptWithoutRatings,
        categoryId,
        categoryName,
        categoryImage,
        tags,
        averageRating,
        isSaved
      };
    });

    return NextResponse.json(formattedPrompts);
  } catch (error) {
    console.error("Error fetching user prompts:", error);
    return NextResponse.json(
      { error: "Failed to fetch user prompts" },
      { status: 500 }
    );
  }
}
