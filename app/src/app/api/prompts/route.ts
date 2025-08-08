import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { saveUploadedFiles } from '@/utils/fileUpload';
import { PromptService } from '@/services/PromptService';

// GET /api/prompts - Get all prompts
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id ?? null;

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const categoryId = searchParams.get('categoryId');
    const query = searchParams.get('q');
    const sort = (searchParams.get('sort') as 'recent' | 'trending' | null) || 'recent';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

    const result = await PromptService.list({
      currentUserId,
      userId,
      categoryId,
      q: query,
      sort,
      page,
      pageSize,
    });

    return NextResponse.json(result);
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
