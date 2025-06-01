import { Pool } from 'pg';
async function checkSchema() {
  const dbUrl = 'postgresql://neondb_owner:npg_JqO3i6XBtcMZ@ep-hidden-unit-a1fm5vgs-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });
  try {
    const client = await pool.connect();
    ;
    // Check users table structure
    const usersColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users';
    `);
    ;
    ;
    // Check for required columns
    const requiredColumns = ['id', 'clerk_id', 'email', 'full_name', 'created_at', 'updated_at'];
    const missingColumns = requiredColumns.filter(col => 
      !usersColumns.rows.some((r: any) => r.column_name === col)
    );
    if (missingColumns.length > 0) {
      ;
      ;
       ? 'ADD COLUMN IF NOT EXISTS clerk_id VARCHAR(255) UNIQUE,\n      ' : ''}
      ${missingColumns.includes('email') ? 'ADD COLUMN IF NOT EXISTS email VARCHAR(255) NOT NULL,\n      ' : ''}
      ${missingColumns.includes('full_name') ? 'ADD COLUMN IF NOT EXISTS full_name VARCHAR(255),\n      ' : ''}
      ${missingColumns.includes('created_at') ? 'ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,\n      ' : ''}
      ${missingColumns.includes('updated_at') ? 'ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;' : ''}
      `);
    } else {
      ;
    }
    // Check if the users table is empty
    const userCount = await client.query('SELECT COUNT(*) as count FROM users');
    ;
    client.release();
  } catch (error) {
    ;
  } finally {
    await pool.end();
  }
}
checkSchema().catch();
