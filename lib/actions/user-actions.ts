'use server';
import { auth } from "@clerk/nextjs";
import { query, getOne } from "../db";
export async function getUserPlanAction() {
  try {
    const { userId } = auth();
    if (!userId) {
      return {
        isPro: false,
        isBasic: false,
        isActive: false,
        planName: 'Free',
      };
    }
    // Get user from database
    const user = await getOne(
      'SELECT plan, "stripeSubscriptionId" as "stripeSubscriptionId", "stripeCurrentPeriodEnd" as "stripeCurrentPeriodEnd", "stripeCustomerId" as "stripeCustomerId", "stripePriceId" as "stripePriceId" FROM users WHERE id = $1',
      [userId]
    );
    if (!user) {
      return {
        isPro: false,
        isBasic: false,
        isActive: false,
        planName: 'Free',
      };
    }
    // Check if subscription is active
    const isActive = user.stripeSubscriptionId && 
                     user.stripeCurrentPeriodEnd && 
                     new Date(user.stripeCurrentPeriodEnd).getTime() > Date.now();
    // Determine plan type
    const isPro = user.plan === 'PRO' && isActive;
    const isBasic = user.plan === 'BASIC' && isActive;
    const planName = isPro ? 'Pro' : isBasic ? 'Basic' : 'Free';
    return {
      isPro,
      isBasic,
      isActive: isActive || false,
      planName,
    };
  } catch (error) {
    ;
    return {
      isPro: false,
      isBasic: false,
      isActive: false,
      planName: 'Free',
    };
  }
}
