import { auth } from "@clerk/nextjs/server";
import { getDbConnection } from "./db";
export type UserPlan = 'free' | 'basic' | 'pro';
export async function getUserPlan(userId: string): Promise<{
  plan: UserPlan;
  isActive: boolean;
  priceId: string | null;
}> {
  const sql = await getDbConnection();
  try {
    const [user] = await sql`
      SELECT price_id, status 
      FROM users 
      WHERE clerk_id = ${userId}
      LIMIT 1
    `;
    // Default to free plan if no user record or no price_id
    if (!user || !user.price_id) {
      return { plan: 'free', isActive: false, priceId: null };
    }
    const priceId = user.price_id as string;
    const isActive = user.status === 'active';
    // Determine plan based on price_id
    let plan: UserPlan = 'free';
    if (priceId.includes('basic')) {
      plan = 'basic';
    } else if (priceId.includes('pro')) {
      plan = 'pro';
    }
    return { plan, isActive, priceId };
  } catch (error) {
    ;
    // Default to free plan on error
    return { plan: 'free', isActive: false, priceId: null };
  }
}
export async function canUploadPdf(userId: string): Promise<boolean> {
  try {
    const { plan, isActive } = await getUserPlan(userId);
    // Only allow uploads for active basic or pro subscriptions
    return isActive && (plan === 'basic' || plan === 'pro');
  } catch (error) {
    ;
    return false;
  }
}
// Server action to check user plan (can be used in Server Components)
export async function getUserPlanAction() {
  const { userId } = auth();
  if (!userId) {
    return { plan: 'free' as const, isActive: false, priceId: null };
  }
  return getUserPlan(userId);
}
