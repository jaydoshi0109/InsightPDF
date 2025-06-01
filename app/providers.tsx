'use client';
import { ClerkProvider as ClerkBaseProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
export function ClerkProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <ClerkBaseProvider
      appearance={{
        baseTheme: mounted && resolvedTheme === 'dark' ? dark : undefined,
        variables: {
          colorPrimary: '#6366f1',
          colorTextOnPrimaryBackground: '#ffffff',
        },
        elements: {
          formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-sm normal-case',
          footerActionLink: 'text-indigo-500 hover:text-indigo-600',
          card: 'shadow-lg',
          headerTitle: 'text-2xl font-bold',
          headerSubtitle: 'text-gray-600',
          socialButtonsBlockButton: 'border-gray-300 hover:bg-gray-50',
          socialButtonsBlockButtonText: 'text-gray-700',
          formFieldInput: 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500',
          formFieldLabel: 'text-gray-700',
        },
      }}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
    >
      {children}
    </ClerkBaseProvider>
  );
}
