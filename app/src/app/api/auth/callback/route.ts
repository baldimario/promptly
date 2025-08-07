import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // This is a basic callback handler for OAuth providers
  // In a real application, you'd typically handle this through NextAuth's built-in callbacks

  const searchParams = request.nextUrl.searchParams;
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  
  return NextResponse.redirect(new URL(callbackUrl, request.url));
}
