import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { PromptService } from "@/services/PromptService";

// API endpoint to get current user's prompts
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    if (!userId) return NextResponse.json({ error: "User ID not found in session" }, { status: 400 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || searchParams.get('limit') || '10', 10);

    const result = await PromptService.list({
      currentUserId: userId,
      userId,
      page,
      pageSize,
      sort: 'recent',
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching user prompts:", error);
    return NextResponse.json(
      { error: "Failed to fetch prompts" },
      { status: 500 }
    );
  }
}
