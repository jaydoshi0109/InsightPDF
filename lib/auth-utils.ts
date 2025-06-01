import { currentUser } from "@clerk/nextjs";
export async function getAuthData() {
  try {
    const user = await currentUser();
    if (!user) {
      return { userId: null, sessionClaims: null, userEmail: undefined };
    }
    return {
      userId: user.id,
      sessionClaims: user,
      userEmail: user.emailAddresses[0]?.emailAddress
    };
  } catch (error) {
    ;
    return { userId: null, sessionClaims: null, userEmail: undefined };
  }
}
export async function getUserPlanFromDb(userId: string) {
  try {
    const { getDbConnection } = await import("@/lib/db");
    const sql = await getDbConnection();
    const user = await sql`
      SELECT * FROM users 
      WHERE clerk_id = ${userId}
      LIMIT 1;
    `;
    return user?.[0] || null;
  } catch (error) {
    ;
    return null;
  }
}
export function determineUserPlan(user: any) {
  let isPro = false;
  let isBasic = false;
  let planName = "Free";
  if (user?.price_id) {
    // Check for Pro plan first
    if (user.price_id === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID) {
      isPro = true;
      planName = "Pro";
    } 
    // Then check for Basic plan
    else if (user.price_id === process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID) {
      isBasic = true;
      planName = "Basic";
    }
  }
  return { isPro, isBasic, planName };
}
