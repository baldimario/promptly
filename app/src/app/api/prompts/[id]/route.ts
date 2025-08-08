import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { PromptService } from '@/services/PromptService';
import { avatarUrl } from '@/utils/format';
import { RatingService } from '@/services/RatingService';

// Define the expected type for the prompt response
interface PromptWithRelations {
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
  category: {
    id: string;
    name: string;
    image: string | null;
    description: string | null;
  } | null;
  ratings: {
    rating: number;
  }[];
  comments: {
    id: string;
    text: string;
    createdAt: Date;
    userId: string;
    user: {
      id: string;
      name: string;
      image: string | null;
    };
  }[];
  _count: {
    ratings: number;
  };
}

export async function GET(
  request: NextRequest,
  context: any
) {
  try {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id ?? null;
  const { id } = await Promise.resolve(context?.params || {} as { id: string });

  const prompt = await PromptService.getById(id, currentUserId);
  if (!prompt) return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });

  return NextResponse.json({ prompt });
  } catch (error) {
    console.error('Error fetching prompt:', error);
    return NextResponse.json(
      { error: 'Error fetching prompt details. Please try again.' },
      { status: 500 }
    );
  }
}

// POST - Add a comment or rating
export async function POST(
  request: NextRequest,
  context: any
) {
  const session = await getServerSession(authOptions);
  
  // Check if the user is authenticated
  if (!session?.user) {
    return NextResponse.json(
      { error: 'You must be logged in to interact with prompts.' },
      { status: 401 }
    );
  }
  
  // Ensure params is awaited properly
  const resolvedParams = await Promise.resolve(context?.params || {} as { id: string });
  const { id } = resolvedParams;
  const userId = session.user.id;
  
  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    );
  }
  
  // Check if prompt exists
  const prompt = await prisma.prompt.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          ratings: true
        }
      }
    }
  });
  
  if (!prompt) {
    return NextResponse.json(
      { error: 'Prompt not found' },
      { status: 404 }
    );
  }
  
  try {
    const data = await request.json();
    const { action, content } = data;
    
    if (action === 'comment' && content) {
      // Add comment to database
      const newComment = await prisma.comment.create({
        data: {
          text: content,
          promptId: id,
          userId
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true
            }
          }
        }
      });
      
      // Format the comment for response
      const formattedComment = {
        id: newComment.id,
        userId: newComment.userId,
        userName: newComment.user.name || 'Anonymous User',
  userImage: avatarUrl(newComment.user.name || 'Anonymous', newComment.user.image || null),
        text: newComment.text,
        createdAt: newComment.createdAt.toISOString()
      };
      
      return NextResponse.json({ comment: formattedComment }, { status: 201 });
    } 
    else if (action === 'rate' && typeof content === 'number' && content >= 1 && content <= 5) {
      const rating = content;
      const { averageRating, totalRatings } = await RatingService.ratePrompt({ userId, promptId: id, rating });
      return NextResponse.json({ rating: averageRating, numRatings: totalRatings });
    } 
    else {
      return NextResponse.json(
        { error: 'Invalid action or content' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error updating prompt:', error);
    return NextResponse.json(
      { error: 'Error updating prompt. Please try again.' },
      { status: 500 }
    );
  }
}

// PUT - Update a prompt
export async function PUT(
  request: NextRequest,
  context: any
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Ensure params is awaited properly
  const resolvedParams = await Promise.resolve(context?.params || {} as { id: string });
    const id = resolvedParams.id;
    const userId = session.user.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Check if prompt exists and belongs to the user
    const existingPrompt = await prisma.prompt.findUnique({
      where: { id },
      select: { 
        userId: true,
        image: true
      }
    });
    
    if (!existingPrompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }
    
    if (existingPrompt.userId !== userId) {
      return NextResponse.json(
        { error: 'You are not authorized to update this prompt' },
        { status: 403 }
      );
    }
    
    // Process form data
    const formData = await request.formData();
    
    const title = formData.get('title') as string;
    const promptText = formData.get('promptText') as string;
    const description = formData.get('description') as string;
    const exampleOutputs = formData.get('exampleOutputs') as string || '';
    const suggestedModel = formData.get('suggestedModel') as string;
    const categoryId = formData.get('categoryId') as string || null;
    const tagsJson = formData.get('tags') as string;
    const tags = tagsJson ? JSON.parse(tagsJson) : []; // Parse the tags from JSON
    const existingImagesJson = formData.get('existingImages') as string;
    const existingImages = existingImagesJson ? JSON.parse(existingImagesJson) : [];
    
    // Handle image uploads
    const outputImages = formData.getAll('outputImages') as File[];
    const imageUrls = [...existingImages]; // Start with existing images that were not removed
    
    // Upload new images using the same method as in the POST endpoint
    // For simplicity, we'll skip the Cloudinary integration for now

    // Update the prompt in the database with correct typing for Prisma
    const updatedPrompt = await prisma.prompt.update({
      where: { id },
      data: {
        title,
        promptText,
        description,
        exampleOutputs,
        suggestedModel,
        categoryId: categoryId || null,
        tags: JSON.stringify(tags), // Store tags as JSON string
        image: imageUrls.length > 0 ? imageUrls[0] : null, // Use first image as main image
      },
    });

    // Get the user associated with the prompt
    const user = await prisma.user.findUnique({
      where: { id: updatedPrompt.userId },
      select: {
        id: true,
        name: true,
        image: true
      }
    });

    // Get the category if it exists
    const category = categoryId ? await prisma.category.findUnique({
      where: { id: categoryId }
    }) : null;

    // Get ratings for the prompt
    const ratings = await prisma.rating.findMany({
      where: { promptId: id },
      select: {
        rating: true
      }
    });

    // Get ratings count
    const ratingsCount = await prisma.rating.count({
      where: { promptId: id }
    });

    // Calculate average rating
    let averageRating = 0;
    if (ratings.length > 0) {
      const totalRating = ratings.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0);
      averageRating = totalRating / ratings.length;
    }
    
    // Parse tags from input directly since we've already parsed them
    
    // Get category ID and name safely
    const promptCategoryId = categoryId;
    const categoryName = category?.name;
    
    // Format the prompt response
    const formattedPrompt = {
      id: updatedPrompt.id,
      title: updatedPrompt.title,
      description: updatedPrompt.description,
      promptText: updatedPrompt.promptText,
      exampleOutputs: updatedPrompt.exampleOutputs,
      suggestedModel: updatedPrompt.suggestedModel,
      image: updatedPrompt.image,
      imageUrls,
      userId: updatedPrompt.userId,
      userName: user?.name || 'Unknown',
      userImage: user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Unknown')}&background=random`,
      createdAt: updatedPrompt.createdAt.toISOString(),
      updatedAt: updatedPrompt.updatedAt.toISOString(),
      rating: averageRating,
      numRatings: ratingsCount,
      categoryId: promptCategoryId,
      categoryName: categoryName,
      categoryImage: null, // Set to null since we can't access category.image due to type issues
      tags: tags // Use the parsed tags from input
    };
    
    return NextResponse.json({ 
      success: true,
      prompt: formattedPrompt
    });
  } catch (error) {
    console.error('Error updating prompt:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
