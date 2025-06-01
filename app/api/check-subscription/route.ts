import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getDbConnection } from "@/lib/db";
interface SubscriptionInfo {
  isActive: boolean;
  isPro: boolean;
  isBasic: boolean;
  planName: string;
  priceId: string | null;
  status: string | null;
  lastUpdated: string | null;
}
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    const sql = await getDbConnection();
    const [user] = await sql`
      SELECT 
        subscription_id,
        subscription_status as status,
        price_id,
        updated_at as last_updated
      FROM users 
      WHERE clerk_id = ${userId}
      LIMIT 1;
    `;
    if (!user) {
      return NextResponse.json({
        subscription: null,
        error: 'User not found'
      }, { status: 404 });
    }
    // Determine plan type based on price_id
    const isActive = user.status === 'active';
    const isPro = isActive && user.price_id?.includes('pro');
    const isBasic = isActive && user.price_id?.includes('basic');
    let planName = 'Free';
    if (isPro) planName = 'Pro';
    else if (isBasic) planName = 'Basic';
    const subscriptionInfo: SubscriptionInfo = {
      isActive,
      isPro,
      isBasic,
      planName,
      priceId: user.price_id,
      status: user.status,
      lastUpdated: user.last_updated ? new Date(user.last_updated).toISOString() : null
    };
    return NextResponse.json({
      subscription: subscriptionInfo
    });
  } catch (error) {
    ;
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
