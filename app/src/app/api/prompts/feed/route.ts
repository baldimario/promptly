import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { generatePromptPlaceholder } from '@/utils/placeholderImage';

/**
 * Helper function to check if a relation exists in the schema
 * This allows us to gracefully handle missing columns/tables
 */
async function doesRelationExist(model: string, relation: string): Promise<boolean> {
  try {
    // For category relation specifically, check if categoryId column exists
    if (model === 'prompt' && relation === 'category') {
      await prisma.$queryRaw`SELECT category_id FROM prompts LIMIT 1`;
    }
    return true;
  } catch (e) {
    console.log(`${relation} relation does not exist on ${model}, skipping`);
    return false;
  }
}

/**
 * GET /api/prompts/feed
 * Returns prompts from users that the current user follows
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    const category = searchParams.get('category');

    // Get users that the current user follows
    let followingIds: string[] = [];
    
    try {
      // Directly use a raw SQL approach to avoid Prisma model validation issues
      try {
        // Check if the follows table exists first
        const tableExists = await prisma.$queryRaw`
          SELECT 1 FROM information_schema.tables 
          WHERE table_schema = 'promptly' AND table_name = 'follows' 
          LIMIT 1
        `;
        
        if (Array.isArray(tableExists) && tableExists.length > 0) {
          // Table exists, now get following IDs with raw SQL that doesn't depend on schema
          const rawFollowing = await prisma.$queryRaw`
            SELECT following_id FROM follows WHERE follower_id = ${userId}
          `;
          
          // Process the raw result
          if (Array.isArray(rawFollowing)) {
            followingIds = rawFollowing.map((row: any) => {
              // Handle different column name formats (snake_case or camelCase)
              return row.following_id || row.followingId || null;
            }).filter(Boolean);
          }
        }
      } catch (rawQueryError) {
        console.error('Raw SQL query failed:', rawQueryError);
        
        // Final fallback - try the standard Prisma approach but ignore schema validation errors
        try {
          const following = await prisma.$queryRaw`
            SELECT * FROM follows WHERE follower_id = ${userId}
          `;
          
          if (Array.isArray(following)) {
            followingIds = following.map((f: any) => f.following_id || f.followingId).filter(Boolean);
          }
        } catch (fallbackError) {
          console.error('All follow query attempts failed:', fallbackError);
        }
      }
    } catch (dbError) {
      console.error('Error fetching following users:', dbError);
      // Continue with empty followingIds array
    }

    // If the user doesn't follow anyone, or we couldn't fetch follows
    // due to schema issues, show recent prompts instead of an empty feed
    if (followingIds.length === 0) {
      try {
        // Fetch some recent prompts instead of showing an empty feed
        const recentPrompts = await prisma.prompt.findMany({
          orderBy: { createdAt: 'desc' },
          take: pageSize
        });
        
        if (recentPrompts.length > 0) {
          // We have some recent prompts to show instead
          return NextResponse.json({
            prompts: recentPrompts.map(prompt => ({
              ...prompt,
              user: { id: prompt.userId, name: 'User', image: null },
              rating: 0,
              numRatings: 0,
              isSaved: false
            })),
            pagination: {
              page: 1,
              pageSize,
              total: recentPrompts.length,
              totalPages: 1
            },
            followsUsers: false,
            message: "Showing recent prompts as you don't follow anyone yet."
          });
        } else {
          // No prompts at all in the system
          return NextResponse.json({
            prompts: [],
            pagination: {
              page,
              pageSize,
              total: 0,
              totalPages: 0
            },
            followsUsers: false
          });
        }
      } catch (recentPromptsError) {
        // If we can't even fetch recent prompts, return empty array
        console.error('Failed to fetch recent prompts:', recentPromptsError);
        return NextResponse.json({
          prompts: [],
          pagination: {
            page,
            pageSize,
            total: 0,
            totalPages: 0
          },
          followsUsers: false
        });
      }
    }

    // Build the where conditions - only add user filter if we have followingIds
    const whereConditions: any = {};
    if (followingIds && followingIds.length > 0) {
      whereConditions.userId = { in: followingIds };
    } else {
      // If we don't have any followingIds, we'll still show prompts (most recent)
      // Don't apply any user filter
    }
    
    // Filter by category if provided
    if (category) {
      try {
        // Check if category is an ID or a name
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category);
        
        if (isUUID) {
          // Check if categoryId column exists before filtering by it
          try {
            await prisma.$queryRaw`SELECT category_id FROM prompts LIMIT 1`;
            // Filter by category ID
            whereConditions.categoryId = category;
          } catch (e) {
            console.log('categoryId column does not exist, skipping filter');
          }
        } else {
          // Check if category relation exists before filtering by name
          try {
            await doesRelationExist('prompt', 'category');
            // Filter by category name
            whereConditions.category = {
              name: {
                contains: category
              }
            };
          } catch (e) {
            console.log('category relation does not exist, skipping filter');
          }
        }
      } catch (e) {
        console.error('Error applying category filter:', e);
      }
    }

    // Get total count for pagination
    let totalPrompts = 0;
    try {
      totalPrompts = await prisma.prompt.count({
        where: whereConditions
      });
    } catch (countError) {
      console.error('Error counting prompts:', countError);
      // Continue with default count of 0
    }

    // Get prompts from users that the current user follows
    let prompts: any[] = [];
    try {
      prompts = await prisma.prompt.findMany({
        where: whereConditions,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          // Try to include category if it exists in the schema
          ...(await doesRelationExist('prompt', 'category') ? { category: true } : {}),
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
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize
      });
    } catch (dbError) {
      console.error('Error in prompts query:', dbError);
      
      // Try a more basic query without relationships that might be missing
      try {
        prompts = await prisma.prompt.findMany({
          where: {
            userId: { in: followingIds }
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * pageSize,
          take: pageSize
        });
        
        // Add empty placeholder properties for missing relationships
        prompts = prompts.map(prompt => ({
          ...prompt,
          user: { id: prompt.userId, name: 'User', image: null },
          category: null,
          ratings: [],
          _count: { ratings: 0 }
        }));
      } catch (fallbackError) {
        console.error('Fallback query also failed:', fallbackError);
        // Continue with empty array
      }
    }

    // Get saved prompts by the current user
    let savedPromptIds: string[] = [];
    
    try {
      // Try to use raw SQL to avoid schema validation issues
      try {
        // Check if the savedPrompts table exists
        const tableExists = await prisma.$queryRaw`
          SELECT 1 FROM information_schema.tables 
          WHERE table_schema = 'promptly' AND table_name = 'saved_prompts' 
          LIMIT 1
        `;
        
        if (Array.isArray(tableExists) && tableExists.length > 0) {
          // Table exists, get saved prompt IDs with raw SQL
          const rawSavedPrompts = await prisma.$queryRaw`
            SELECT prompt_id FROM saved_prompts WHERE user_id = ${userId}
          `;
          
          if (Array.isArray(rawSavedPrompts)) {
            savedPromptIds = rawSavedPrompts.map((row: any) => {
              return row.prompt_id || row.promptId || null;
            }).filter(Boolean);
          }
        }
      } catch (rawQueryError) {
        console.error('Raw SQL query for saved prompts failed:', rawQueryError);
        
        // Fall back to standard Prisma approach
        try {
          const savedPrompts = await prisma.savedPrompt.findMany({
            where: { userId },
            select: { promptId: true }
          });
          
          savedPromptIds = savedPrompts.map(sp => sp.promptId);
        } catch (fallbackError) {
          console.error('All saved prompts query attempts failed:', fallbackError);
        }
      }
    } catch (dbError) {
      console.error('Error fetching saved prompts:', dbError);
      // Continue with empty savedPromptIds array
    }

    // Format prompts for response
    const formattedPrompts = prompts.map((prompt: any) => {
      // Calculate average rating
      let averageRating = 0;
      if (prompt.ratings && Array.isArray(prompt.ratings) && prompt.ratings.length > 0) {
        const totalRating = prompt.ratings.reduce((sum: number, r: any) => sum + (r.rating || 0), 0);
        averageRating = totalRating / prompt.ratings.length;
      }
      
      // Parse tags from JSON string if they exist
      let tags: string[] = [];
      if (prompt.hasOwnProperty('tags') && prompt.tags) {
        try {
          tags = JSON.parse(prompt.tags as string);
        } catch (e) {
          console.error('Error parsing tags:', e);
        }
      }
      
      // Check if saved
      const isSaved = savedPromptIds.includes(prompt.id);
      
      // Access user data safely
      const userName = prompt.user?.name || 'Unknown User';
      const userImage = prompt.user?.image || null;
      
      // Generate a placeholder image if none exists
      const imageUrl = prompt.image || generatePromptPlaceholder(
        prompt.title,
        userName,
        tags
      );
      
      // Get formatted user image URL
      const formattedUserImage = userImage || 
        `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`;
      
      return {
        id: prompt.id,
        title: prompt.title,
        description: prompt.description || '',
        promptText: prompt.promptText || '',
        exampleOutputs: prompt.exampleOutputs || null,
        image: imageUrl,
        userId: prompt.userId,
        userName: userName,
        userImage: formattedUserImage,
        createdAt: prompt.createdAt?.toISOString() || new Date().toISOString(),
        tags: tags,
        categoryId: prompt.hasOwnProperty('categoryId') ? prompt.categoryId : null,
        categoryName: prompt.category?.name || null,
        categoryImage: prompt.category?.image || null,
        rating: averageRating,
        averageRating: averageRating, // Add this for consistency with other endpoints
        numRatings: prompt._count?.ratings || 0,
        suggestedModel: prompt.suggestedModel || '',
        isSaved
      };
    });

    return NextResponse.json({
      prompts: formattedPrompts,
      pagination: {
        page,
        pageSize,
        total: totalPrompts,
        totalPages: Math.ceil(totalPrompts / pageSize)
      },
      followsUsers: true
    });
    
  } catch (error) {
    console.error("Error fetching feed prompts:", error);
    return NextResponse.json(
      { error: "Failed to load feed" },
      { status: 500 }
    );
  }
}
