import { neon } from "@neondatabase/serverless";
// This script will check the structure of the pdf_summaries table
export async function checkDatabaseStructure() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not defined in environment variables");
    }
    const sql = neon(process.env.DATABASE_URL);
    // Check if table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'pdf_summaries'
      )`;
    if (!tableExists[0].exists) {
      ;
      return false;
    }
    // Get table structure
    const tableStructure = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'pdf_summaries'
      ORDER BY ordinal_position`;
    ;
    ;
    // Get some sample data
    const sampleData = await sql`
      SELECT id, user_id, title, created_at, status 
      FROM pdf_summaries 
      ORDER BY created_at DESC 
      LIMIT 5`;
    ;
    ;
    return true;
  } catch (error) {
    ;
    throw error;
  }
}
// Run the check if this file is executed directly
if (require.main === module) {
  checkDatabaseStructure()
    .then(() => )
    .catch();
}
