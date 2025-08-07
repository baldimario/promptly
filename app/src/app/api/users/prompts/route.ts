import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

// API endpoint to get current user's prompts
export async function GET(req: NextRequest) {
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

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get user prompts with pagination
    const prompts = await prisma.prompt.findMany({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    // Get total count of user prompts
    const totalPrompts = await prisma.prompt.count({
      where: {
        userId: userId,
      },
    });

    return NextResponse.json({
      prompts,
      pagination: {
        total: totalPrompts,
        page,
        limit,
        totalPages: Math.ceil(totalPrompts / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching user prompts:", error);
    return NextResponse.json(
      { error: "Failed to fetch prompts" },
      { status: 500 }
    );
  }
}
