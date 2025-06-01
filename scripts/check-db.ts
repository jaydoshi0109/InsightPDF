import { Pool } from 'pg';
// Database connection configuration
const dbConfig = {
  connectionString: 'postgresql://aipdfsum_owner:npg_FklP05YgQpqo@ep-white-tooth-a7ec6mol-pooler.ap-southeast-2.aws.neon.tech/aipdfsum?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
};
async function checkDatabase() {
  const pool = new Pool(dbConfig);
  try {
    ;
    const client = await pool.connect();
    try {
      // Test the connection
      ;
      // List all tables in the database
      ;
      const result = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      if (result.rows.length === 0) {
        ;
      } else {
        ;
        result.rows.forEach((row, i) => {
          ;
        });
      }
    } finally {
      client.release();
    }
  } catch (error: any) {
    ;
  } finally {
    await pool.end();
  }
}
checkDatabase().catch();
