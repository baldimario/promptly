import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Generate random placeholder images for categories
const generateCategoryImage = (categoryName: string) => {
  // List of color palettes for visually appealing category images
  const palettes = [
    '4338CA', // Indigo
    '3B82F6', // Blue
    '06B6D4', // Cyan
    '10B981', // Emerald
    '059669', // Green
    '65A30D', // Lime
    'CA8A04', // Yellow
    'EA580C', // Orange
    'E11D48', // Rose
    'BE185D', // Pink
    '7E22CE', // Purple
    '6366F1', // Indigo 2
  ];
  
  // Simple hash function to consistently pick a color for each category name
  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colorIndex = Math.abs(hash) % palettes.length;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(categoryName)}&background=${palettes[colorIndex]}&color=fff&size=300&bold=true`;
};

export async function GET(request: Request) {
  try {
    // Get sort parameter from URL (default to 'popular')
    const url = new URL(request.url);
    const sort = url.searchParams.get('sort') || 'popular';
    
    // Determine sort order based on parameter
    let orderBy: any;
    if (sort === 'name') {
      orderBy = { name: 'asc' };
    } else {
      // Default to sorting by popularity (prompt count)
      orderBy = {
        prompts: {
          _count: 'desc'
        }
      };
    }

    // Find categories with prompt counts
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            prompts: true
          }
        }
      },
      orderBy,
      take: 50 // Get more categories to provide better suggestions
    });

    // Map categories to a simplified format with placeholder images
    const categoryList = categories.map(category => ({
      id: category.id,
      name: category.name,
      promptCount: category._count?.prompts || 0, // Safely access the count with fallback
      image: generateCategoryImage(category.name)
    }));

    return NextResponse.json({ 
      categories: categoryList
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    
    // Return empty categories array instead of fallbacks
    return NextResponse.json({ 
      categories: []
    });
  }
}
