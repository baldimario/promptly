import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { PromptService } from '@/services/PromptService';

/**
 * Helper function to check if a relation exists in the schema
 * This allows us to gracefully handle missing columns/tables
 */
// Note: relation checks removed as PromptService handles includes safely

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
      const result = await PromptService.list({ currentUserId: userId, page, pageSize, sort: 'recent' });
      return NextResponse.json({ ...result, followsUsers: false, message: "Showing recent prompts as you don't follow anyone yet." });
    }

    // Resolve category to ID if a name was provided
    let resolvedCategoryId: string | null = category || null;
    if (category) {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category);
      if (!isUUID) {
        const cat = await prisma.category.findFirst({ where: { name: category } });
        resolvedCategoryId = cat?.id || null;
      }
    }

    // Use service to get follow feed
    const result = await PromptService.list({
      currentUserId: userId,
      userIds: followingIds,
      categoryId: resolvedCategoryId,
      page,
      pageSize,
      sort: 'recent',
    });
    return NextResponse.json({ ...result, followsUsers: true });
    
  } catch (error) {
    console.error("Error fetching feed prompts:", error);
    return NextResponse.json(
      { error: "Failed to load feed" },
      { status: 500 }
    );
  }
}
