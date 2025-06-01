import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    // Test database connection
    const result = await query('SELECT NOW() as time');
    return NextResponse.json({
      status: 'ok',
      database: {
        connected: true,
        time: result.rows[0]?.time
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    ;
    return NextResponse.json({
      status: 'error',
      database: {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
