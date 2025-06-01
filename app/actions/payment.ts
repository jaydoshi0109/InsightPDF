'use server';
import { getDbConnection } from '@/lib/db';
export async function updateUserSubscription(userId: string, subscriptionId: string, status: string, priceId: string) {
  try {
    const sql = await getDbConnection();
    await sql`
      UPDATE users 
      SET 
        subscription_id = ${subscriptionId},
        subscription_status = ${status},
        price_id = ${priceId},
        updated_at = NOW()
      WHERE clerk_id = ${userId}
      RETURNING *;
    `;
  } catch (error) {
    ;
    throw error;
  }
}
