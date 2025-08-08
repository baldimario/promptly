import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { SaveService } from "@/services/SaveService";

// API endpoint to save or unsave a prompt
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
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

  const { isSaved, saveCount } = await SaveService.toggle({ userId, promptId, action });
  return NextResponse.json({ success: true, action, promptId, isSaved, saveCount });
  } catch (error) {
    console.error("Error in save/unsave prompt operation:", error);
    return NextResponse.json(
      { error: "Failed to process save/unsave request" },
      { status: 500 }
    );
  }
}
