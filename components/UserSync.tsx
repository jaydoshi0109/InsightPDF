"use client";
import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
// Simple client-side only component for handling auth redirects
export function UserSync() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { isLoaded: isAuthLoaded } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSyncing, setIsSyncing] = useState(false);
  useEffect(() => {
    if (!isAuthLoaded || !isLoaded) return;
    const publicPaths = ['/', '/sign-in', '/sign-up', '/pricing', '/api'];
    const isPublicPath = publicPaths.some(path => 
      pathname === path || pathname.startsWith(`${path}/`)
    );
    // If user is not signed in and trying to access protected route
    if (!isSignedIn && !isPublicPath) {
      const signInUrl = new URL('/sign-in', window.location.origin);
      signInUrl.searchParams.set('redirect_url', pathname);
      router.push(signInUrl.toString());
      return;
    }
    // If user is signed in
    if (isSignedIn) {
      // Sync user with database
      const syncUser = async () => {
        if (isSyncing) return;
        try {
          setIsSyncing(true);
          ;
          const response = await fetch('/api/sync-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user?.id,
              email: user?.emailAddresses?.[0]?.emailAddress,
              firstName: user?.firstName,
              lastName: user?.lastName,
            }),
          });
          if (!response.ok) {
            const error = await response.text().catch(() => 'Unknown error');
            ;
          } else {
            ;
          }
        } catch (error) {
          ;
        }
      };
      syncUser();
      // Redirect to dashboard if on auth pages
      if (pathname === '/sign-in' || pathname === '/sign-up' || pathname === '/') {
        router.push('/dashboard');
      }
    }
  }, [isLoaded, isSignedIn, isAuthLoaded, pathname, router, user]);
  // Don't render anything
  return null;
}
