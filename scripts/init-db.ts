import { query } from '../lib/db';
import fs from 'fs';
import path from 'path';
async function initDatabase() {
  try {
    ;
    // Read the SQL file
    const sqlFilePath = path.resolve(process.cwd(), 'schema.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    ;
    // Execute the SQL script
    await query(sql);
    ;
    // Verify the tables were created
    const tables = await query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    ;
    tables.rows.forEach((row: any) => {
      ;
    });
  } catch (error: any) {
    ;
  } finally {
    process.exit(0);
  }
}
initDatabase();
