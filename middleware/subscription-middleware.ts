import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getUserPlan } from '@/lib/user';
import { pricingPlans } from '@/utils/constants';

// Routes that require a paid subscription
const PROTECTED_ROUTES = [
  '/upload',
  '/summary',
];

// Dashboard is accessible to all logged-in users
const AUTHENTICATED_ROUTES = [
  '/dashboard',
];

// Routes that are always accessible
const PUBLIC_ROUTES = [
  '/',
  '/sign-in',
  '/sign-up',
  '/pricing',
  '/api',
];

export async function subscriptionMiddleware(request: NextRequest) {
  const user = await currentUser();
  const pathname = request.nextUrl.pathname;
  
  // Allow public routes and static assets
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route)) || 
      pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico)$/)) {
    return NextResponse.next();
  }
  
  // Check if route requires authentication or subscription
  const requiresSubscription = PROTECTED_ROUTES.some(route => 
    pathname.startsWith(route)
  );
  
  const requiresAuth = AUTHENTICATED_ROUTES.some(route =>
    pathname.startsWith(route)
  );

  // Handle authenticated routes (like dashboard)
  if (requiresAuth) {
    if (!user) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
    return NextResponse.next();
  }
  
  // Handle subscription-protected routes
  if (requiresSubscription) {
    // If not logged in, redirect to sign-in
    if (!user) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
    
    // Check user's subscription status
    let priceId: string | null = null;
    const email = user.emailAddresses[0].emailAddress;
    
    if (email) {
      priceId = await getUserPlan(email);
    }
    
    const plan = pricingPlans.find((plan) => plan.priceId === priceId);
    const hasPaidPlan = !!plan; // User has either Basic or Pro plan
    
    // Redirect users without a paid plan to pricing page
    if (!hasPaidPlan) {
      return NextResponse.redirect(new URL('/#pricing', request.url));
    }
  }
  
  return NextResponse.next();
}
