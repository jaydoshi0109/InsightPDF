import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import type { NextRequest } from 'next/server';
export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    // Get user's subscription status from the database
    const userResult = await query(
      `SELECT u.status, u.price_id, u.customer_id, u.email 
       FROM users u 
       WHERE u.clerk_id = $1`,
      [userId]
    );
    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    const user = userResult.rows[0];
    // If user has a price_id, check if there's a corresponding payment
    let payment_status = null;
    if (user.price_id) {
      const paymentResult = await query(
        `SELECT status 
         FROM payments 
         WHERE user_email = $1 
         ORDER BY created_at DESC 
         LIMIT 1`,
        [user.email]
      );
      if (paymentResult.rows.length > 0) {
        payment_status = paymentResult.rows[0].status;
      }
    }
    return NextResponse.json({
      status: user.status || 'inactive',
      price_id: user.price_id,
      customer_id: user.customer_id,
      payment_status: payment_status
    });
  } catch (error) {
    ;
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
