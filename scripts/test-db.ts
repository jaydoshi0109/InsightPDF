require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const { query, testConnection, closePool } = require('../lib/db');
const { getOrCreateUser, updateUserSubscription } = require('../lib/user-utils');
async function testDatabase() {
  try {
    ;
    const isConnected = await testConnection();
    if (!isConnected) {
      ;
      return;
    }
    ;
    // Test a simple query
    ;
    const result = await query('SELECT NOW() as current_time');
    ;
    // Test user creation
    ;
    const testEmail = `testuser-${Date.now()}@example.com`;
    const testClerkId = `test-clerk-${Date.now()}`;
    const newUser = await getOrCreateUser(testClerkId, testEmail, 'Test User');
    if (!newUser) {
      ;
      return;
    }
    ;
    ;
    ;
    // Test subscription update
    ;
    const testCustomerId = `cus_test_${Date.now()}`;
    const testPriceId = 'price_test_123';
    const updatedUser = await updateUserSubscription(
      testClerkId,
      testCustomerId,
      testPriceId
    );
    if (!updatedUser) {
      ;
      return;
    }
    ;
    ;
    ;
    // List all users
    ;
    const users = await query('SELECT * FROM users');
    ;
    users.rows.forEach((user: any, index: number) => {
      `);
    });
    ;
  } catch (error) {
    ;
  } finally {
    // Close the database connection pool
    await closePool();
    process.exit(0);
  }
}
testDatabase();
