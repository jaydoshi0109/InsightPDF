import { Pool } from 'pg';
async function testUserSync() {
  const dbUrl = 'postgresql://neondb_owner:npg_JqO3i6XBtcMZ@ep-hidden-unit-a1fm5vgs-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });
  try {
    const client = await pool.connect();
    // Test user data
    const testUser = {
      userId: 'test_user_123',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User'
    };
    ;
    // Call the sync-user API endpoint
    const response = await fetch('http://localhost:3001/api/sync-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    });
    const result = await response.json();
    ;
    if (!response.ok) {
      ;
      return;
    }
    // Check if user was created in the database
    const dbUser = await client.query(
      'SELECT * FROM users WHERE clerk_id = $1', 
      [testUser.userId]
    );
    ;
    ;
    // Clean up test user
    await client.query('DELETE FROM users WHERE clerk_id = $1', [testUser.userId]);
    ;
    client.release();
  } catch (error) {
    ;
  } finally {
    await pool.end();
  }
}
testUserSync().catch();
