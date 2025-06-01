import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserPlanWithCache } from "@/lib/cache";
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export async function GET() {
  try {
    const user = await currentUser();
    if (!user?.id) {
      return NextResponse.json({ planType: "none", planName: "Free" });
    }
    // Get user's plan information with caching
    const { planType, planName } = await getUserPlanWithCache(user.id);
    return NextResponse.json({ 
      planType, 
      planName,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    ;
    return NextResponse.json(
      { 
        error: "Failed to fetch user plan",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
