import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET;
  const token = await getToken({ req: request, secret });

  // Define protected routes that require authentication
  const protectedPaths = ['/create', '/profile'];

  const path = request.nextUrl.pathname;
  
  // Check if the path is in the protected routes and user is not authenticated
  const isProtectedPath = protectedPaths.some(protectedPath => 
    path === protectedPath || path.startsWith(`${protectedPath}/`));

  if (isProtectedPath && !token) {
    // Create the url to redirect to
    const redirectUrl = new URL('/login', request.url);
    // Add the original url as a parameter to redirect back after login
    redirectUrl.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(redirectUrl);
  }

  // If the path is login/signup and user is already authenticated, redirect to homepage
  if ((path === '/login' || path === '/signup') && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Specify the paths that should trigger this middleware
export const config = {
  matcher: [
    '/create/:path*',
    '/profile/:path*',
    '/login',
    '/signup',
  ],
};
