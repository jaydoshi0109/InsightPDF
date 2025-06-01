import { NextResponse } from 'next/server';
import { getOne } from '@/lib/db';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};
export async function OPTIONS() {
  return createResponse({ success: true });
}
export async function GET(request: Request) {
  ;
  try {
    // Get the user ID from the URL query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    // Validate user ID
    if (!userId) {
      ;
      return createResponse(
        { error: 'User ID is required' },
        400
      );
    }
    ;
    // Set a timeout for the database query
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database query timeout')), 5000)
    );
    // Check if user exists in the database
    const userPromise = getOne(
      'SELECT id, email, status FROM users WHERE clerk_id = $1',
      [userId]
    );
    const user = await Promise.race([userPromise, timeoutPromise])
      .catch(error => {
        ;
        throw new Error('Database operation failed');
      });
    ;
    return createResponse({
      exists: !!user,
      userId,
      status: user?.status || 'not_found'
    });
  } catch (error) {
    ;
    return createResponse(
      { 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      500
    );
  }
}
