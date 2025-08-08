import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { PromptService } from '@/services/PromptService';
import { prisma } from '@/lib/prisma';

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
  const userId = session?.user?.id || null;
  
  try {
    // If we have a query, search for prompts using the service
    if (query) {
      const sort = sortBy === 'oldest' ? 'oldest' : 'recent';
      let resolvedCategoryId: string | null = categoryFilter || null;
      if (categoryFilter) {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryFilter);
        if (!isUUID) {
          const category = await prisma.category.findFirst({ where: { name: categoryFilter } });
          resolvedCategoryId = category?.id || null;
        }
      }
      const result = await PromptService.list({
        currentUserId: userId,
        q: query,
        categoryId: resolvedCategoryId,
        page,
        pageSize,
        sort,
      });

      // Apply optional minRating filter on the already-aggregated results
      const filtered = minRating > 0
        ? {
            ...result,
            prompts: result.prompts.filter((p: any) => (p.averageRating ?? p.rating ?? 0) >= minRating),
          }
        : result;

      return NextResponse.json(filtered);
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
