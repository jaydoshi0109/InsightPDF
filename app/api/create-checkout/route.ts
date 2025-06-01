import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe';
import { pricingPlans } from '@/utils/constants';
// Helper function to handle CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
// Helper function to get the base URL
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
};
// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}
export async function POST(req: NextRequest) {
  ;
  try {
    // Get the current user
    ;
    const { userId } = auth();
    const user = userId ? await currentUser() : null;
    ;
    if (!user || !userId) {
      ;
      return new NextResponse(
        JSON.stringify({ error: 'User not authenticated' }),
        { 
          status: 401, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders,
          } 
        }
      );
    }
    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
      ;
    } catch (error) {
      ;
      return new NextResponse(
        JSON.stringify({ 
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        }),
        { 
          status: 500, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders,
          } 
        }
      );
    }
    const { priceId } = requestBody;
    if (!priceId) {
      ;
      return new NextResponse(
        JSON.stringify({ error: 'Price ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    // Validate the price ID
    ;
    const validPlan = pricingPlans.find(plan => plan.priceId === priceId);
    if (!validPlan) {
      ;
      return new NextResponse(
        JSON.stringify({ error: 'Invalid price ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    // Get the user's email
    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) {
      return new NextResponse(
        JSON.stringify({ error: 'No email address found for user' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Create a checkout session using our Stripe utility
    const { url } = await createCheckoutSession({
      priceId,
      userId,
      customerEmail: email,
      customerName: `${user.firstName} ${user.lastName || ''}`.trim() || 'User',
      metadata: {
        clerkUserId: userId,
        userEmail: email
      }
    });
    if (!url) {
      throw new Error('Failed to create checkout session');
    }
    ;
    return new NextResponse(
      JSON.stringify({ url }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders,
        } 
      }
    );
  } catch (error) {
    ;
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders,
        } 
      }
    );
  }
}
