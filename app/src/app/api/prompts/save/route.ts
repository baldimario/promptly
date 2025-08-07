import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// API endpoint to save or unsave a prompt
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user ID from session
    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found in session" }, { status: 400 });
    }

    // Get request body
    const { promptId, action } = await req.json();
    
    if (!promptId) {
      return NextResponse.json({ error: "Prompt ID is required" }, { status: 400 });
    }
    
    if (action !== 'save' && action !== 'unsave') {
      return NextResponse.json({ error: "Invalid action. Use 'save' or 'unsave'." }, { status: 400 });
    }
    
    // Check if the prompt exists
    const prompt = await prisma.prompt.findUnique({
      where: { id: promptId },
    });
    
    if (!prompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    if (action === 'save') {
      // Check if already saved
      const existingSave = await prisma.savedPrompt.findUnique({
        where: {
          userId_promptId: {
            userId,
            promptId,
          },
        },
      });
      
      // If not already saved, save it now
      if (!existingSave) {
        await prisma.savedPrompt.create({
          data: {
            userId,
            promptId,
          },
        });
      }
      // If already saved, do nothing (it's not an error)
    } else {
      // Unsave the prompt
      await prisma.savedPrompt.delete({
        where: {
          userId_promptId: {
            userId,
            promptId,
          },
        },
      });
    }
    
    // Get updated save count for this prompt
    const saveCount = await prisma.savedPrompt.count({
      where: {
        promptId,
      },
    });
    
    return NextResponse.json({
      success: true,
      action,
      promptId,
      saveCount,
    });
  } catch (error) {
    console.error("Error in save/unsave prompt operation:", error);
    return NextResponse.json(
      { error: "Failed to process save/unsave request" },
      { status: 500 }
    );
  }
}
