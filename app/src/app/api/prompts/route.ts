import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { saveUploadedFiles } from '@/utils/fileUpload';
import { generatePromptPlaceholder } from '@/utils/placeholderImage';
import fs from 'fs';
import path from 'path';

// GET /api/prompts - Get all prompts
export async function GET(request: NextRequest) {
  try {
    // Get current user session to check saved status
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id;
    
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const categoryId = searchParams.get('categoryId');
    const query = searchParams.get('q');
    const sort = searchParams.get('sort') || 'recent';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    
    const whereConditions: any = {};
    
    // Filter by user ID
    if (userId) {
      whereConditions.userId = userId;
    }
    
    // Filter by category ID directly
    if (categoryId) {
      whereConditions.categoryId = categoryId;
    }
    
    // Filter by search query
    if (query) {
      whereConditions.OR = [
        { title: { contains: query } },
        { description: { contains: query } }
      ];
    }
    
    // Get total count for pagination
    const totalPrompts = await prisma.prompt.count({
      where: whereConditions
    });
    
    // Determine sort order
    let orderBy: any = {};
    if (sort === 'trending') {
      orderBy = {
        ratings: {
          _count: 'desc'
        }
      };
    } else {
      orderBy = {
        createdAt: 'desc'
      };
    }
    
    const prompts = await prisma.prompt.findMany({
      where: whereConditions,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        category: true,
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
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize
    });
    
    // Get saved prompts by the current user if logged in
    let savedPromptIds: string[] = [];
    if (currentUserId) {
      try {
        const savedPrompts = await prisma.savedPrompt.findMany({
          where: { userId: currentUserId },
          select: { promptId: true }
        });
        savedPromptIds = savedPrompts.map(sp => sp.promptId);
      } catch (error) {
        console.error('Error fetching saved prompts:', error);
        // Continue with empty savedPromptIds array
      }
    }
    
    // Format the prompts to match the expected structure
    const formattedPrompts = await Promise.all(prompts.map(async (prompt: any) => {
      // Calculate average rating
      let averageRating = 0;
      if (prompt.ratings && prompt.ratings.length > 0) {
        const totalRating = prompt.ratings.reduce((sum: number, rating: any) => sum + rating.rating, 0);
        averageRating = totalRating / prompt.ratings.length;
        // Log this for debugging
        console.log(`Prompt ${prompt.id} has ${prompt.ratings.length} ratings, average: ${averageRating}`);
      }
      
      // Check if this prompt is saved by the current user
      const isSaved = currentUserId ? savedPromptIds.includes(prompt.id) : false;
      
      // Parse tags from JSON string
      let tags: string[] = [];
      if (prompt.tags) {
        try {
          tags = JSON.parse(prompt.tags as string);
        } catch (e) {
          console.error('Error parsing tags:', e);
        }
      }
      
      // Check for additional images with the same prompt ID pattern
      let imageUrls: string[] = [];
      try {
        const promptId = prompt.id;
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'images');
        
        try {
          if (fs.existsSync(uploadsDir)) {
            const files = fs.readdirSync(uploadsDir);
            // Filter files that contain the prompt ID in their name
            imageUrls = files
              .filter((file: string) => file.includes(promptId))
              .map((file: string) => `/uploads/images/${file}`);
          }
        } catch (error) {
          console.error('Error reading uploads directory:', error);
        }
        
        // If no images found but prompt has a main image, include it
        if (imageUrls.length === 0 && prompt.image) {
          imageUrls = [prompt.image];
        }
      } catch (error) {
        console.error('Error finding additional images:', error);
      }
      
      // Generate a placeholder image if none exists
      const imageUrl = prompt.image || generatePromptPlaceholder(
        prompt.title,
        prompt.user?.name || 'Unknown',
        tags || []
      );
      
      return {
        id: prompt.id,
        title: prompt.title,
        description: prompt.description,
        promptText: prompt.promptText,
        exampleOutputs: prompt.exampleOutputs,
        image: imageUrl,
        imageUrls: imageUrls.length > 0 ? imageUrls : [imageUrl],
        userId: prompt.userId,
        userName: prompt.user?.name || 'Unknown',
        userImage: prompt.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(prompt.user?.name || 'Unknown')}&background=random`,
        createdAt: prompt.createdAt.toISOString(),
        tags: tags,
        categoryId: prompt.categoryId,
        categoryName: prompt.category?.name,
        categoryImage: prompt.category?.image,
        rating: averageRating,
        averageRating: averageRating, // Add this for consistency with other endpoints
        numRatings: prompt._count?.ratings || 0,
        suggestedModel: prompt.suggestedModel,
        isSaved: isSaved // Add the saved status flag
      };
    }));
    
    return NextResponse.json({
      prompts: formattedPrompts,
      pagination: {
        page,
        pageSize,
        total: totalPrompts,
        totalPages: Math.ceil(totalPrompts / pageSize)
      }
    });
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json(
      { error: 'Error fetching prompts. Please try again.' },
      { status: 500 }
    );
  }
}

// POST /api/prompts - Create a new prompt
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if the user is authenticated
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'You must be logged in to create a prompt.' },
        { status: 401 }
      );
    }
    
    // Get the user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please log in again.' },
        { status: 404 }
      );
    }
    
    // Parse form data
    const formData = await request.formData();
    
    const title = formData.get('title') as string;
    const promptText = formData.get('promptText') as string;
    const description = formData.get('description') as string;
    const exampleOutputs = formData.get('exampleOutputs') as string;
    const suggestedModel = formData.get('suggestedModel') as string;
    const categoryId = formData.get('categoryId') as string;
    const tagsInput = formData.get('tags') as string;
    const outputImages = formData.getAll('outputImages') as File[];
    
    // Validate required fields
    if (!title || !promptText || !description || !suggestedModel) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Process tags
    let tags: string[] = [];
    try {
      if (tagsInput) {
        tags = JSON.parse(tagsInput);
      }
    } catch (e) {
      console.error("Error parsing tags:", e);
    }
    
    try {
      // Create the prompt with a transaction to ensure all operations succeed or fail together
      const newPrompt = await prisma.$transaction(async (tx) => {
        // First create the prompt without images to get the ID
        const prompt = await tx.prompt.create({
          data: {
            title,
            description,
            promptText,
            exampleOutputs: exampleOutputs || null,
            suggestedModel,
            image: null, // We'll update this after processing images
            userId: user.id,
            tags: tags.length > 0 ? JSON.stringify(tags) : null,
            categoryId: categoryId || null
          },
          include: {
            user: true,
            category: true
          }
        });
        
        // Now that we have the prompt ID, process images
        let imageUrls: string[] = [];
        if (outputImages.length > 0) {
          try {
            // Use the prompt ID as prefix for better organization
            imageUrls = await saveUploadedFiles(outputImages, 'uploads/images', prompt.id);
            
            // Update the prompt with the main image
            if (imageUrls.length > 0) {
              await tx.prompt.update({
                where: { id: prompt.id },
                data: { image: imageUrls[0] } // Use the first image as the main prompt image
              });
            }
          } catch (error) {
            console.error('Error saving images:', error);
          }
        }
        
        // Return the prompt with the updated image field
        const updatedPrompt = await tx.prompt.findUnique({
          where: { id: prompt.id },
          include: {
            user: true,
            category: true
          }
        });
        
        return {
          ...updatedPrompt!,
          imageUrls
        };
      });
      
      // Format the response
      return NextResponse.json({ 
        prompt: {
          id: newPrompt.id,
          title: newPrompt.title,
          description: newPrompt.description,
          promptText: newPrompt.promptText,
          exampleOutputs: newPrompt.exampleOutputs,
          image: newPrompt.image,
          userId: newPrompt.userId,
          userName: newPrompt.user.name,
          userImage: newPrompt.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(newPrompt.user.name)}&background=random`,
          createdAt: newPrompt.createdAt.toISOString(),
          suggestedModel: newPrompt.suggestedModel,
          imageUrls: newPrompt.imageUrls || [],
          tags: tags,
          categoryId: newPrompt.categoryId,
          categoryName: newPrompt.category?.name,
          categoryImage: newPrompt.category?.image
        }
      }, { status: 201 });
    } catch (txError) {
      console.error('Transaction error:', txError);
      return NextResponse.json(
        { error: 'Error creating prompt. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating prompt:', error);
    return NextResponse.json(
      { error: 'Error creating prompt. Please try again.' },
      { status: 500 }
    );
  }
}
