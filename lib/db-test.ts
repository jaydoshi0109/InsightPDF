import { neon } from "@neondatabase/serverless";
async function testDbConnection() {
  if (!process.env.DATABASE_URL) {
    ;
    return false;
  }
  try {
    const sql = neon(process.env.DATABASE_URL);
    // Test connection by querying the version
    const result = await sql`SELECT version()`;
    ;
    return true;
  } catch (error) {
    ;
    return false;
  }
}
export default testDbConnection;
