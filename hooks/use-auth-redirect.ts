'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export function useAuthRedirect() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Only run on the client side
    if (typeof window === 'undefined') return;
    
    // Prevent multiple redirects
    if (isRedirecting) return;

    // Wait for auth to load
    if (!isLoaded) return;

    const isAuthPage = pathname.startsWith('/sign-');
    const redirectUrl = searchParams.get('redirect_url') || '/dashboard';

    // If user is signed in and on auth page, redirect to dashboard or intended URL
    if (isSignedIn && isAuthPage) {
      setIsRedirecting(true);
      // Use window.location for a full page reload to prevent state issues
      window.location.href = redirectUrl;
    }
    // If user is not signed in and on a protected page, redirect to sign-in
    else if (!isSignedIn && !isAuthPage && !pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
      setIsRedirecting(true);
      const signInUrl = new URL('/sign-in', window.location.origin);
      signInUrl.searchParams.set('redirect_url', pathname);
      window.location.href = signInUrl.toString();
    }
  }, [isLoaded, isSignedIn, pathname, router, searchParams, isRedirecting]);
}
