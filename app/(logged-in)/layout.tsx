'use client';
import { useAuth } from '@clerk/nextjs';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
export default function LoggedInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  useEffect(() => {
    if (!isLoaded) return;
    // If not signed in, redirect to sign-in
    if (!isSignedIn) {
      const signInUrl = new URL('/sign-in', window.location.origin);
      signInUrl.searchParams.set('redirect_url', pathname);
      router.push(signInUrl.toString());
      return;
    }
    // If we get here, user is signed in
    setIsCheckingAuth(false);
  }, [isLoaded, isSignedIn, pathname, router]);
  // Show loading state while checking auth
  if (!isLoaded || isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }
  return <>{children}</>;
}
