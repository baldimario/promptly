'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export function useAuth({ required = false } = {}) {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const isAuthenticated = !!session;
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If authentication is required and user is not authenticated
    if (required && !isAuthenticated && !loading) {
      // Redirect to login page with callback URL
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, loading, required, router, pathname]);

  return {
    session,
    loading,
    isAuthenticated,
    user: session?.user,
  };
}
