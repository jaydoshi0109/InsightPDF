import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "DATABASE_URL is not configured" },
      { status: 500 }
    );
  }
  try {
    const sql = neon(process.env.DATABASE_URL);
    // Get table structure
    const tables = await sql`
      SELECT 
        table_name,
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position`;
    // Get table row counts
    const tableCounts = await sql`
      SELECT 
        table_name,
        (xpath('/row/cnt/text()', query_to_xml(format('SELECT COUNT(*) as cnt FROM %I', table_name), false, true, '')))[1]::text::int as row_count
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name`;
    // Get indexes
    const indexes = await sql`
      SELECT 
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname`;
    return NextResponse.json({
      success: true,
      tables: tables,
      tableCounts: tableCounts,
      indexes: indexes
    });
  } catch (error: any) {
    ;
    return NextResponse.json({
      success: false,
      error: error.message,
      message: "Failed to check database schema"
    }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
