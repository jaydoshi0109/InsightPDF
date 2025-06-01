/** @type {import('@clerk/nextjs').ClerkConfig} */
module.exports = {
  // The domain of your application (e.g., 'example.com' or 'localhost:3000')
  // This should match the domain in your Clerk dashboard
  // If using a custom domain, set it here and in your environment variables
  // as NEXT_PUBLIC_CLERK_DOMAIN
  domain: process.env.NEXT_PUBLIC_CLERK_DOMAIN || 'localhost:3000',
  
  // The URL of your application (e.g., 'https://example.com' or 'http://localhost:3000')
  // This is used for redirects and webhooks
  // Set this in your environment variables as NEXT_PUBLIC_APP_URL
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  
  // Configure the sign-in and sign-up pages
  pages: {
    signIn: '/sign-in',
    signUp: '/sign-up',
    // After sign-in/sign-up, redirect to the dashboard
    afterSignIn: '/dashboard',
    afterSignUp: '/dashboard',
  },
  
  // Configure the appearance of Clerk components
  appearance: {
    variables: { 
      colorPrimary: '#6366f1',
      borderRadius: '0.5rem',
    },
    elements: {
      formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-sm normal-case',
      card: 'shadow-lg',
      headerTitle: 'text-xl font-bold',
      headerSubtitle: 'text-sm text-gray-500',
      socialButtonsBlockButton: 'border border-gray-300 hover:bg-gray-50',
      socialButtonsBlockButtonText: 'text-gray-700',
      dividerLine: 'bg-gray-200',
      dividerText: 'text-gray-500',
      formFieldLabel: 'text-sm font-medium text-gray-700',
      formFieldInput: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm',
      footerActionText: 'text-sm text-gray-600',
      footerActionLink: 'text-indigo-600 hover:text-indigo-500',
    },
  },
  
  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development',
  
  // Configure JWT settings
  jwt: {
    // The secret used to sign JWTs
    // In production, set this to a secure random string
    secret: process.env.CLERK_JWT_SECRET || 'dev-secret',
  },
};
