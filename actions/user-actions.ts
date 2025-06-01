"use server";
import { getDbConnection } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { pricingPlans } from "@/utils/constants";
export async function getUserPlanAction() {
  // Get auth data directly from the request
  const authData = await auth();
  const userId = authData?.userId;
  const userEmail = authData?.sessionClaims?.email as string | undefined;
  if (!userId) {
    ;
    return {
      success: false,
      message: "Not authenticated",
      data: {
        plan: null,
        isPro: false,
        isBasic: false,
        planName: "Free"
      }
    };
  }
  try {
    // If no email is available, return free plan
    if (!userEmail) {
      ;
      return {
        success: true,
        message: "No email in session",
        data: {
          plan: null,
          isPro: false,
          isBasic: false,
          planName: "Free"
        }
      };
    }
    const sql = await getDbConnection();
    // Get user by email
    const userQuery = await sql`
      SELECT email, price_id, status FROM users 
      WHERE email = ${userEmail}
      AND status = 'active'
      LIMIT 1
    `;
    const user = userQuery?.[0];
    if (!user || !user.price_id) {
      return {
        success: true,
        message: "User has no active subscription",
        data: {
          plan: null,
          isPro: false,
          isBasic: false,
          planName: "Free"
        }
      };
    }
    const plan = pricingPlans.find(plan => plan.priceId === user.price_id);
    const isPro = plan?.id === 'pro';
    const isBasic = plan?.id === 'basic';
    return {
      success: true,
      message: "User plan retrieved successfully",
      data: {
        plan: user.price_id,
        isPro,
        isBasic,
        planName: plan?.name || "Free"
      }
    };
  } catch (error) {
    ;
    return {
      success: false,
      message: "Failed to retrieve user plan",
      data: {
        plan: null,
        isPro: false,
        isBasic: false,
        planName: "Free"
      }
    };
  }
}
