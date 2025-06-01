import { NextResponse } from 'next/server';
import { createPool } from '@vercel/postgres';
import { auth } from '@clerk/nextjs/server';
// Create a database connection pool
const pool = createPool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for some hosting providers
  }
});
// Type for the response
interface UserPlanResponse {
  success: boolean;
  plan: 'free' | 'basic' | 'pro';
  isActive: boolean;
  status?: string;
  priceId?: string | null;
  message?: string;
}
// Helper function to get Stripe price IDs
function getStripePriceIds() {
  const basicPriceId = process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID || '';
  const proPriceId = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || '';
  ;
  return { basicPriceId, proPriceId };
}
export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Unauthorized',
          plan: 'free',
          isActive: false
        },
        { status: 401 }
      );
    }
    ;
    // Get user from database with enhanced logging
    ;
    ;
    const { rows } = await pool.query(
      `SELECT email, status, price_id, customer_id, created_at, updated_at
       FROM users 
       WHERE clerk_id = $1
       LIMIT 1`,
      [userId]
    );
    ;
    const user = rows[0];
    if (!user) {
      ;
      return NextResponse.json(
        { 
          success: false, 
          message: 'User not found',
          plan: 'free',
          isActive: false
        },
        { status: 404 }
      );
    }
    ;
    // Get Stripe price IDs
    const { basicPriceId, proPriceId } = getStripePriceIds();
    // Simplified plan determination function
    const getPlanFromPriceId = (priceId: string | null): 'free' | 'basic' | 'pro' => {
      if (!priceId) return 'free';
      if (priceId === basicPriceId) return 'basic';
      if (priceId === proPriceId) return 'pro';
      return 'free';
    };
    // Determine user's plan with detailed logging
    const isActive = user.status === 'active' || user.status === 'trialing';
    const plan = getPlanFromPriceId(user.price_id);
    
    // Return the response with detailed subscription info
    const response: UserPlanResponse = {
      success: true,
      plan,
      isActive,
      status: user.status,
      priceId: user.price_id,
      message: isActive 
        ? `Active ${plan} subscription` 
        : `Subscription status: ${user.status || 'inactive'}`
    };
    ;
    return NextResponse.json(response);
  } catch (error) {
    ;
    return NextResponse.json(
      { 
        success: false, 
        plan: 'free',
        isActive: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
