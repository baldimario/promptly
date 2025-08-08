import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { PromptService } from "@/services/PromptService";

// API endpoint to get a user's prompts
export async function GET(
  req: NextRequest,
  context: any
) {
  try {
    const resolvedParams = await Promise.resolve((context?.params || {}) as { id: string });
    const { id: userId } = resolvedParams;
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id || null;

    const searchParams = new URL(req.url).searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

    const result = await PromptService.list({
      currentUserId,
      userId,
      sort: 'recent',
      page,
      pageSize,
    });

  return NextResponse.json(result.prompts);
  } catch (error) {
    console.error("Error fetching user prompts:", error);
    return NextResponse.json(
      { error: "Failed to fetch user prompts" },
      { status: 500 }
    );
  }
}
