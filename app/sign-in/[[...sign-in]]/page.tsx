'use client';
import { SignIn } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isClient, setIsClient] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState('/dashboard');
  // Set up redirect URL on client side
  useEffect(() => {
    setIsClient(true);
    try {
      const redirectParam = searchParams?.get('redirect_url');
      if (redirectParam && !redirectParam.startsWith('/sign-')) {
        // Validate the redirect URL
        const url = new URL(redirectParam, window.location.origin);
        if (url.origin === window.location.origin) {
          setRedirectUrl(url.pathname + url.search);
        }
      }
    } catch (e) {
      ;
    }
  }, [searchParams]);
  // Show loading state while checking client-side
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sign-in...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-gray-600 mt-2">Sign in to your account to continue</p>
          </div>
          <SignIn 
            path="/sign-in"
            routing="path"
            signUpUrl="/sign-up"
            afterSignInUrl={redirectUrl}
            afterSignUpUrl={redirectUrl}
            redirectUrl={redirectUrl}
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'shadow-none w-full',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                socialButtonsBlockButton: 'border-gray-200 hover:bg-gray-50',
                socialButtonsBlockButtonText: 'text-gray-700',
                formFieldInput: 'border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
                formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-sm normal-case',
                footerActionLink: 'text-indigo-600 hover:text-indigo-800',
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
