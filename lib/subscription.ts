import { getDbConnection } from "./db";
import type { Pool } from 'pg';
import type Stripe from "stripe";
let stripeInstance: Stripe | null = null;
async function getStripe(): Promise<Stripe | null> {
  if (stripeInstance) return stripeInstance;
  if (typeof window !== 'undefined') {
    ;
    return null;
  }
  try {
    const Stripe = (await import('stripe')).default;
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-05-28.basil', // Use the specific API version required
    });
    return stripeInstance;
  } catch (error) {
    ;
    return null;
  }
}
export async function verifyAndUpdateSubscription(userId: string) {
  if (typeof window !== 'undefined') {
    ;
    return null;
  }
  const db = await getDbConnection();
  if (!db) {
    ;
    return null;
  }
  try {
    // Get user's current subscription from DB
    const result = await db.query<{
      customer_id: string | null;
      subscription_id: string | null;
      price_id: string | null;
      status: string | null;
    }>(
      `SELECT customer_id, subscription_id, price_id, status 
       FROM users 
       WHERE clerk_id = $1
       LIMIT 1`,
      [userId]
    );
    const user = result.rows[0];
    if (!user) {
      ;
      return null;
    }
    if (!user.customer_id) {
      ;
      return null;
    }
    // If user has a subscription ID, verify it with Stripe
    if (user.subscription_id) {
      const stripe = await getStripe();
      if (!stripe) {
        ;
        return null;
      }
      try {
        const subscription = await stripe.subscriptions.retrieve(user.subscription_id);
        // If subscription is active in Stripe but not in our DB, update our DB
        if (subscription.status !== user.status) {
          const updateResult = await db.query<{
            price_id: string | null;
          }>(
            `UPDATE users 
             SET 
               status = $1,
               updated_at = NOW()
             WHERE clerk_id = $2
             RETURNING price_id`,
            [subscription.status, userId]
          );
          if (updateResult.rowCount === 0) {
            ;
            return null;
          }
          const updatedUser = updateResult.rows[0];
          return {
            status: subscription.status,
            priceId: subscription.items.data[0]?.price.id || updatedUser.price_id || null,
            isActive: ['active', 'trialing'].includes(subscription.status)
          };
        }
        return {
          status: subscription.status,
          priceId: subscription.items.data[0]?.price.id || user.price_id || null,
          isActive: ['active', 'trialing'].includes(subscription.status)
        };
      } catch (error: unknown) {
        // If subscription not found in Stripe, mark as inactive in our DB
        if (error && typeof error === 'object' && 'code' in error && error.code === 'resource_missing') {
          await db.query(
            `UPDATE users 
             SET 
               status = 'canceled',
               updated_at = NOW()
             WHERE clerk_id = $1`,
            [userId]
          );
          return {
            status: 'canceled',
            priceId: user.price_id || null,
            isActive: false
          };
        }
        ;
        return null;
      }
    }
    // If we get here, either no subscription or there was an error
    return {
      status: user.status || 'inactive',
      priceId: user.price_id,
      isActive: user.status === 'active'
    };
  } catch (error) {
    ;
    throw error;
  }
}
// Simple check if user has an active subscription
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  try {
    const subscription = await verifyAndUpdateSubscription(userId);
    return subscription?.isActive || false;
  } catch (error) {
    ;
    return false;
  }
}
