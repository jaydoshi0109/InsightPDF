'use client';
import { SignUp, useAuth } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
export default function SignUpPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isClient, setIsClient] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const redirectUrl = searchParams.get('redirect_url') || '/dashboard';
  // Handle redirect if already signed in
  useEffect(() => {
    if (!isLoaded || !isSignedIn || isRedirecting) return;
    setIsRedirecting(true);
    router.replace(redirectUrl);
  }, [isLoaded, isSignedIn, redirectUrl, router, isRedirecting]);
  // Only render on the client to avoid hydration mismatches
  useEffect(() => {
    setIsClient(true);
  }, []);
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md">
          <div className="h-[600px] bg-white rounded-lg shadow-sm"></div>
        </div>
      </div>
    );
  }
  // If we're in the middle of a redirect, show loading state
  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting you to the dashboard...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <SignUp 
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
          afterSignUpUrl={redirectUrl}
          afterSignInUrl={redirectUrl}
          redirectUrl={redirectUrl}
        />
      </div>
    </div>
  );
}
