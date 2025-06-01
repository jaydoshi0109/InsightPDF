import { NextResponse } from 'next/server';
import { getDbConnection } from '@/lib/db';
export async function GET() {
  try {
    const pool = await getDbConnection();
    const client = await pool.connect();
    try {
      // Check if users table exists
      const usersTable = await client.query(
        "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')"
      );
      // Check if pdf_summaries table exists
      const summariesTable = await client.query(
        "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'pdf_summaries')"
      );
      // Get row counts
      const userCount = await client.query('SELECT COUNT(*) FROM users');
      const summaryCount = await client.query('SELECT COUNT(*) FROM pdf_summaries');
      // Get sample data (first 5 records from each table)
      const sampleUsers = await client.query('SELECT id, clerk_id, email, status FROM users LIMIT 5');
      const sampleSummaries = await client.query('SELECT id, user_id, title, created_at FROM pdf_summaries LIMIT 5');
      return NextResponse.json({
        success: true,
        tables: {
          users: usersTable.rows[0].exists,
          pdf_summaries: summariesTable.rows[0].exists,
        },
        counts: {
          users: parseInt(userCount.rows[0].count),
          pdf_summaries: parseInt(summaryCount.rows[0].count)
        },
        sampleData: {
          users: sampleUsers.rows,
          summaries: sampleSummaries.rows
        }
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    ;
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        stack: error.stack 
      },
      { status: 500 }
    );
  }
}
