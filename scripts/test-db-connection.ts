import { Pool } from 'pg';
async function testConnection() {
  if (!process.env.DATABASE_URL) {
    ;
    return;
  }
  ;
  @/, ':***@'));
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  try {
    const client = await pool.connect();
    ;
    // Test query
    const result = await client.query('SELECT NOW()');
    ;
    // Check if users table exists
    try {
      const tables = await client.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
      );
      ;
      .join('\n') || 'No tables found');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      ;
    }
    client.release();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    ;
  } finally {
    await pool.end();
  }
}
testConnection().catch();
