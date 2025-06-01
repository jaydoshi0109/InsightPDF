'use client';
import { useAuth } from '@clerk/nextjs';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
// List of public paths that don't require authentication
const publicPaths = [
  '/',
  '/sign-in',
  '/sign-up',
  '/pricing',
  '/features',
  '/api',
  '/_next',
  '/images',
  '/favicon.ico'
];
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  useEffect(() => {
    if (!isLoaded) return;
    const isPublicPath = publicPaths.some(path => 
      pathname === path || pathname.startsWith(`${path}/`)
    );
    // If user is signed in and trying to access auth pages, redirect to dashboard
    if (isSignedIn && (pathname === '/sign-in' || pathname === '/sign-up' || pathname === '/')) {
      if (initialCheckDone) {
        router.replace('/dashboard');
      }
    } 
    // If user is not signed in and trying to access protected pages, redirect to sign-in
    else if (!isSignedIn && !isPublicPath && !pathname.startsWith('/_next') && !pathname.startsWith('/api')) {
      if (initialCheckDone) {
        const signInUrl = new URL('/sign-in', window.location.origin);
        signInUrl.searchParams.set('redirect_url', pathname);
        router.push(signInUrl.toString());
      }
    }
    // Mark initial check as done
    if (!initialCheckDone) {
      setInitialCheckDone(true);
    }
    // Always set checking to false after the first check
    if (isCheckingAuth) {
      setIsCheckingAuth(false);
    }
  }, [isLoaded, isSignedIn, pathname, router, isCheckingAuth, initialCheckDone]);
  // Show loading state only on initial load
  if (!isLoaded || isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600">Loading application...</p>
      </div>
    );
  }
  return <>{children}</>;
}
