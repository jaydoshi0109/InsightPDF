const { Pool } = require('pg');
async function checkSummaries() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  try {
    // Get all users
    const users = await pool.query('SELECT id, email, clerk_id, price_id FROM users');
    ;
    ;
    // Get all summaries
    const summaries = await pool.query(`
      SELECT ps.id, u.email, ps.title, ps.file_name, ps.created_at, ps.status 
      FROM pdf_summaries ps
      JOIN users u ON ps.user_id = u.id
      ORDER BY ps.created_at DESC
    `);
    ;
    ;
    // Get recent uploads from the uploads directory
    const fs = require('fs');
    const path = require('path');
    const uploadsDir = path.join(process.cwd(), 'uploads');
    try {
      const files = fs.readdirSync(uploadsDir);
      ;
      ;
    } catch (error) {
      ;
    }
  } catch (error) {
    ;
  } finally {
    await pool.end();
    process.exit(0);
  }
}
// Load environment variables
require('dotenv').config();
// Run the check
checkSummaries();
