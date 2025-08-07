import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { generatePromptPlaceholder } from '@/utils/placeholderImage';

// Define types for better TypeScript support
interface PromptWithRelations {
  id: string;
  title: string;
  description: string;
  promptText: string;
  exampleOutputs: string | null;
  suggestedModel: string;
  image: string | null;
  tags: string | null;
  userId: string;
  categoryId: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
  category: {
    id: string;
    name: string;
    image: string | null;
  } | null;
  ratings: {
    rating: number;
  }[];
  _count: {
    ratings: number;
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
  const sortBy = searchParams.get('sortBy') || 'newest';
  const categoryFilter = searchParams.get('category') || undefined;
  const minRating = parseFloat(searchParams.get('minRating') || '0');
  
  // Get the current user session
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  
  try {
    // If we have a query, search for prompts
    if (query) {
      // Base where clause
      const whereClause: any = {
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
          { promptText: { contains: query } },
          // Search in category name using relation
          {
            category: {
              name: { contains: query }
            }
          },
          // Search in tags (which is stored as JSON string)
          {
            tags: { contains: query }
          }
        ]
      };
      
      // Add category filter if specified
      if (categoryFilter) {
        // Check if category filter is a UUID (categoryId) or a name
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryFilter);
        
        if (isUUID) {
          // Filter by category ID
          whereClause.categoryId = categoryFilter;
        } else {
          // Filter by category name
          whereClause.category = {
            name: categoryFilter
          };
        }
      }
      
      // Determine sort order
      let orderBy: any = {};
      switch (sortBy) {
        case 'oldest':
          orderBy = { createdAt: 'asc' };
          break;
        case 'newest':
          orderBy = { createdAt: 'desc' };
          break;
        default:
          orderBy = { createdAt: 'desc' };
      }
      
      // Count total matches for pagination
      const totalPrompts = await prisma.prompt.count({
        where: whereClause
      });
      
      // Get paginated results with the new schema
      const prompts = await prisma.prompt.findMany({
        where: whereClause,
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
            select: { ratings: true }
          }
        },
        orderBy,
        take: pageSize,
        skip: (page - 1) * pageSize
      }) as unknown as PromptWithRelations[];

      // Get saved prompts for the current user if logged in
      let savedPromptIds: string[] = [];
      if (userId) {
        const savedPrompts = await prisma.savedPrompt.findMany({
          where: {
            userId: userId
          },
          select: {
            promptId: true
          }
        });
        savedPromptIds = savedPrompts.map(sp => sp.promptId);
      }

      // Calculate average ratings and transform the data
      const promptsWithRatings = prompts.map(prompt => {
        // Calculate average rating
        let averageRating = 0;
        if (prompt.ratings && prompt.ratings.length > 0) {
          const totalRating = prompt.ratings.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0);
          averageRating = totalRating / prompt.ratings.length;
        }
        
        // Filter prompts by minimum rating if specified
        if (minRating > 0 && averageRating < minRating) {
          return null;
        }
        
        // Parse tags from JSON string
        let tags: string[] = [];
        if (prompt.tags) {
          try {
            tags = JSON.parse(prompt.tags);
          } catch (e) {
            console.error('Error parsing tags:', e);
          }
        }
        
        // Generate a placeholder image if none exists
        const imageUrl = prompt.image || generatePromptPlaceholder(
          prompt.title,
          prompt.user ? prompt.user.name : 'Unknown',
          tags
        );
        
        // Check if the prompt is saved by the current user
        const isSaved = userId ? savedPromptIds.includes(prompt.id) : false;
        
        // Create formatted response
        return {
          id: prompt.id,
          title: prompt.title,
          description: prompt.description,
          promptText: prompt.promptText,
          exampleOutputs: prompt.exampleOutputs,
          suggestedModel: prompt.suggestedModel,
          image: imageUrl,
          createdAt: prompt.createdAt.toISOString(),
          userId: prompt.userId,
          user: prompt.user,
          tags: tags,
          categoryId: prompt.categoryId,
          categoryName: prompt.category?.name,
          categoryImage: prompt.category?.image,
          averageRating: averageRating,
          _count: prompt._count,
          isSaved
        };
      }).filter(Boolean); // Remove null values from minRating filter

      return NextResponse.json({
        prompts: promptsWithRatings,
        pagination: {
          page,
          pageSize,
          total: totalPrompts,
          totalPages: Math.ceil(totalPrompts / pageSize)
        }
      });
    } 
    
    // If no query, return empty results
    return NextResponse.json({ 
      prompts: [],
      pagination: {
        page: 1,
        pageSize,
        total: 0,
        totalPages: 0
      }
    });
    
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'An error occurred while searching for prompts' }, 
      { status: 500 }
    );
  }
}
