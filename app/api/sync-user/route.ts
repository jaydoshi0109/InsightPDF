import { NextResponse } from 'next/server';
import { query, getOne } from '@/lib/db';
export const dynamic = 'force-dynamic';
type User = {
  id: string;
  email: string;
  status: string;
  customer_id: string | null;
  price_id: string | null;
};
// Helper function to create a response with CORS headers
const createResponse = (data: any, status: number = 200) => {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};
export async function OPTIONS() {
  return createResponse({ success: true });
}
export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json().catch(() => ({
      error: 'Invalid JSON in request body',
    }));
    if ('error' in body) {
      return createResponse({ error: body.error }, 400);
    }
    let { userId, email, firstName, lastName } = body;
    
    // Log the incoming request (mask sensitive data)
    console.log('Syncing user:', {
      userId: userId ? `${userId.substring(0, 3)}...` : 'none',
      email: email ? `${email.split('@')[0].substring(0, 3)}...@${email.split('@')[1]}` : 'none',
      hasFirstName: !!firstName,
      hasLastName: !!lastName
    });
    // Validate required fields
    if (!userId) {
      return createResponse(
        { error: 'Missing required field: userId' },
        400
      );
    }
    // Ensure email is a valid email address
    if (!email || typeof email !== 'string' || !email.includes('@') || email.includes(userId)) {
      email = `user-${userId.substring(0, 8)}@temporary.aipdf.com`;
    }
    const fullName = [firstName, lastName].filter(Boolean).join(' ') || null;
    const now = new Date().toISOString();
    try {
      // Check if user exists
      const existingUser = await getOne(
        'SELECT id, email, status, customer_id, price_id FROM users WHERE clerk_id = $1',
        [userId]
      ) as {
        id: string;
        email: string;
        status: string;
        customer_id: string | null;
        price_id: string | null;
      } | null;
      if (existingUser) {
        // Update existing user
        const updateResult = await query(
          `UPDATE users 
           SET email = $1, 
               full_name = COALESCE($2, full_name),
               updated_at = $3
           WHERE clerk_id = $4
           RETURNING id, email, status, customer_id, price_id`,
          [email, fullName, now, userId]
        ) as {
          rows: Array<{
            id: string;
            email: string;
            status: string;
            customer_id: string | null;
            price_id: string | null;
          }>;
        };
        if (!updateResult.rows[0]) {
          throw new Error('Failed to update user');
        }
        return createResponse({ 
          success: true, 
          user: updateResult.rows[0] 
        });
      } else {
        // Create new user
        const createResult = await query(
          `INSERT INTO users (clerk_id, email, full_name, status, created_at, updated_at)
           VALUES ($1, $2, $3, 'active', $4, $5)
           RETURNING id, email, status, customer_id, price_id`,
          [userId, email, fullName, now, now]
        ) as {
          rows: Array<{
            id: string;
            email: string;
            status: string;
            customer_id: string | null;
            price_id: string | null;
          }>;
        };
        if (!createResult.rows[0]) {
          throw new Error('Failed to create user');
        }
        return createResponse({ 
          success: true, 
          user: createResult.rows[0] 
        });
      }
    } catch (error: any) {
      throw new Error(`Database operation failed: ${error.message}`);
    }
  } catch (error: any) {
    return createResponse(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      500
    );
  }
}
