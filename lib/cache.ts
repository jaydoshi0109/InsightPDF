import { cache } from 'react';
import { auth } from '@clerk/nextjs/server';
import { query } from './db';
type UserCache = {
  planType: string;
  planName: string;
  updatedAt: number;
};
// In-memory cache with 5-minute TTL (Time To Live)
const userCache = new Map<string, UserCache>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
// Clear expired cache entries periodically
setInterval(() => {
  const now = Date.now();
  // Convert to array first for better compatibility
  Array.from(userCache.entries()).forEach(([key, value]) => {
    if (now - value.updatedAt > CACHE_TTL) {
      userCache.delete(key);
    }
  });
}, CACHE_TTL);
export const getUserPlanWithCache = cache(async (clerkUserId: string) => {
  try {
    // Check if we have a cached result
    const cached = userCache.get(clerkUserId);
    const now = Date.now();
    // Return cached result if it's still valid
    if (cached && now - cached.updatedAt <= CACHE_TTL) {
      return { planType: cached.planType, planName: cached.planName };
    }
    // If not in cache or expired, fetch from database
    const result = await query(
      `SELECT 
          price_id,
          status,
          CASE 
            WHEN status = 'active' AND price_id = $1 THEN 'pro'
            WHEN status = 'active' AND price_id IS NOT NULL THEN 'basic'
            ELSE 'none'
          END as plan_type,
          CASE 
            WHEN status = 'active' AND price_id = $1 THEN 'Pro'
            WHEN status = 'active' AND price_id IS NOT NULL THEN 'Basic'
            ELSE 'Free'
          END as plan_name
       FROM users 
       WHERE clerk_id = $2`,
      [process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID, clerkUserId]
    );
    const planType = result.rows[0]?.status === 'active' ? (result.rows[0]?.plan_type || 'none') : 'none';
    const planName = result.rows[0]?.status === 'active' ? (result.rows[0]?.plan_name || 'Free') : 'Free';
    // Update cache
    userCache.set(clerkUserId, {
      planType,
      planName,
      updatedAt: now
    });
    return { planType, planName };
  } catch (error) {
    ;
    return { planType: 'none', planName: 'Free' };
  }
});
// Clear cache for a specific user (call this when user's plan changes)
export const clearUserCache = (userId: string) => {
  userCache.delete(userId);
  ;
};
// Clear cache for all users with a specific status (e.g., when subscription is cancelled)
export const clearCacheForStatus = async (status: string) => {
  try {
    const result = await query(
      'SELECT clerk_id FROM users WHERE status = $1',
      [status]
    );
    result.rows.forEach(row => {
      userCache.delete(row.clerk_id);
    });
    ;
  } catch (error) {
    ;
  }
};
// Clear all caches (useful for development)
export const clearAllCaches = () => {
  userCache.clear();
};
