import { query, getOne } from "./db";
export interface User {
  id: string;
  clerk_id: string;
  email: string;
  full_name?: string;
  customer_id?: string;
  price_id?: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}
export async function getOrCreateUser(clerkUserId: string, email: string, fullName?: string): Promise<User | null> {
  ;
  if (!clerkUserId || !email) {
    ;
    return null;
  }
  try {
    // Check if user already exists
    const existingUser = await getOne(
      'SELECT * FROM users WHERE clerk_id = $1',
      [clerkUserId]
    ) as unknown as User;
    if (existingUser) {
      ;
      return existingUser;
    }
    // Create new user if not exists
    ;
    const newUser = await query(
      `INSERT INTO users (clerk_id, email, full_name, status, created_at, updated_at)
       VALUES ($1, $2, $3, 'active', NOW(), NOW())
       RETURNING *`,
      [clerkUserId, email, fullName || null]
    ) as unknown as { rows: User[] };
    if (newUser.rows[0]) {
      ;
      return newUser.rows[0];
    }
    return null;
  } catch (error: any) {
    ;
    return null;
  }
}
export async function updateUserSubscription(
  clerkUserId: string,
  customerId: string,
  priceId: string
): Promise<User | null> {
  try {
    const result = await query(
      `UPDATE users 
       SET customer_id = $1, 
           price_id = $2, 
           updated_at = NOW() 
       WHERE clerk_id = $3 
       RETURNING *`,
      [customerId, priceId, clerkUserId]
    ) as unknown as { rows: User[] };
    return result.rows[0] || null;
  } catch (error: any) {
    ;
    return null;
  }
}
export async function getUserById(userId: string): Promise<User | null> {
  try {
    return await getOne('SELECT * FROM users WHERE id = $1', [userId]) as unknown as User;
  } catch (error) {
    ;
    return null;
  }
}
export async function getUserByClerkId(clerkId: string): Promise<User | null> {
  try {
    return await getOne('SELECT * FROM users WHERE clerk_id = $1', [clerkId]) as unknown as User;
  } catch (error) {
    ;
    return null;
  }
}
