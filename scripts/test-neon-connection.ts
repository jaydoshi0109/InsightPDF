import { Pool } from 'pg';
async function testConnection() {
  const dbUrl = 'postgresql://neondb_owner:npg_JqO3i6XBtcMZ@ep-hidden-unit-a1fm5vgs-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
  ;
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false } // Required for Neon
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
      if (tables.rows.some(r => r.table_name === 'users')) {
        ;
        const users = await client.query('SELECT COUNT(*) as count FROM users');
        ;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      ;
    }
    client.release();
  } catch (error: unknown) {
    ;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    ;
  } finally {
    await pool.end();
  }
}
testConnection().catch();
