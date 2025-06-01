import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from 'next/server';

// List of routes that don't require authentication
const publicRoutes = [
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/pricing(.*)',
  '/features(.*)',
  '/api/webhook(.*)',
  '/api/uploadthing(.*)',
  '/api/trpc(.*)'
];

// List of static files and assets that should be ignored
const ignoredPatterns = [
  '/_next/static/(.*)',
  '/_next/image(.*)',
  '/favicon.ico',
  '/(images|fonts|icons|assets)/(.*)',
  '/(.*)\.(svg|png|jpg|jpeg|gif|webp|css|js|woff|woff2|ttf|eot)$'
];

// Configure Clerk middleware with simplified route handling
export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: ['/api/webhook/clerk', '/api/uploadthing'],
  
  // Ignore static files and API routes
  ignoredRoutes: [
    '/_next/static(.*)',
    '/_next/image(.*)',
    '/favicon.ico',
    '/(images|fonts|icons|assets)/(.*)',
    '/(.*)\.(svg|png|jpg|jpeg|gif|webp|css|js|woff|woff2|ttf|eot)$',
    '/api/trpc(.*)'
  ],
  
  afterAuth(auth, req) {
    const { pathname, searchParams } = req.nextUrl;
    const isSignedIn = !!auth.userId;
    
    // Skip middleware for static files and API routes
    const isPublicPath = [
      '/_next',
      '/api',
      '/favicon.ico',
      '/images',
      '/fonts',
      '/assets',
      '/sign-in',
      '/sign-up',
      '/pricing',
      '/features'
    ].some(prefix => pathname.startsWith(prefix));
    
    // Allow public paths and static files
    if (isPublicPath) {
      // If user is signed in and tries to access auth pages, redirect to dashboard
      if (isSignedIn && (pathname === '/' || pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up'))) {
        const redirectUrl = new URL('/dashboard', req.url);
        return NextResponse.redirect(redirectUrl);
      }
      return NextResponse.next();
    }
    
    // Handle unauthenticated users trying to access protected routes
    if (!isSignedIn) {
      const signInUrl = new URL('/sign-in', req.url);
      // Only add redirect_url if we're not already on the sign-in page
      if (pathname !== '/sign-in') {
        signInUrl.searchParams.set('redirect_url', pathname);
      }
      return NextResponse.redirect(signInUrl);
    }
    
    return NextResponse.next();
  },
});

// This matcher ensures the middleware only runs on relevant routes
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|woff|woff2|ttf|eot)$).*)',
    '/',
    '/(api|trpc)(.*)'
  ]
};
