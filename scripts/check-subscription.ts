import { auth } from "@clerk/nextjs/server";
import { getDbConnection } from '../lib/db';
import { NextResponse } from 'next/server';
// Mock request object for the API route
const mockRequest = {
  headers: new Headers({
    'cookie': ''
  })
} as any;
async function checkSubscription() {
  try {
    // Get the current user
    const { userId } = auth(mockRequest);
    if (!userId) {
      ;
      return;
    }
    ;
    // Get database connection
    const sql = await getDbConnection();
    // Query user's subscription status
    const userResult = await sql.query(
      `SELECT 
        u.status, 
        u.price_id, 
        u.customer_id,
        CASE 
          WHEN u.price_id = $1 THEN 'Pro Plan'
          WHEN u.price_id = $2 THEN 'Basic Plan'
          ELSE 'Free Plan'
        END as plan_name,
        u.status = 'active' as is_active
      FROM users u 
      WHERE u.clerk_id = $3`,
      [
        process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
        process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID,
        userId
      ]
    );
    if (userResult.rows.length === 0) {
      ;
      return;
    }
    const user = userResult.rows[0];
    ;
    ;
    ;
    ;
    ;
    ;
    // Check payments if available
    if (user.customer_id) {
      const paymentResult = await sql.query(
        `SELECT status, amount, created_at 
         FROM payments 
         WHERE customer_id = $1 
         ORDER BY created_at DESC 
         LIMIT 1`,
        [user.customer_id]
      );
      if (paymentResult.rows.length > 0) {
        const payment = paymentResult.rows[0];
        ;
        ;
        .toFixed(2)}`);
        .toLocaleString()}`);
      }
    }
  } catch (error) {
    ;
  }
}
// Run the check
checkSubscription().catch();
