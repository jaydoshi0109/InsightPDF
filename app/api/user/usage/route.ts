import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { getDbConnection } from "@/lib/db";
export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const pool = await getDbConnection();
    // Get current month's start and end dates
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    // Count documents processed this month
    let used = 0;
    try {
      const result = await pool.query(
        `SELECT COUNT(*) as count FROM pdf_summaries 
         WHERE user_id = (SELECT id FROM users WHERE clerk_id = $1) AND 
               created_at >= $2 AND 
               created_at <= $3`,
        [userId, firstDay, lastDay]
      );
      used = parseInt(result.rows[0]?.count) || 0;
    } catch (error) {
      ;
      // Continue with 0 if there's an error
    }
    // Get user's plan to determine the limit
    const userPlan = await pool.query(
      'SELECT price_id FROM users WHERE clerk_id = $1',
      [userId]
    );
    const priceId = userPlan.rows[0]?.price_id;
    let total = 3; // Free plan gets 3 documents
    if (priceId === process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID) {
      total = 10; // Basic plan gets 10 documents
    } else if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID) {
      total = 25; // Pro plan gets 25 documents
    }
    const remaining = Math.max(0, total - used);
    return NextResponse.json({
      used,
      total,
      remaining,
      resetDate: lastDay.toISOString()
    });
  } catch (error) {
    ;
    return new NextResponse("Internal Error", { status: 500 });
  }
}
