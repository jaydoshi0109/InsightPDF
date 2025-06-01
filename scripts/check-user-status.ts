import { getDbConnection } from '../lib/db';
import 'dotenv/config';
async function query(sql: string, params: any[] = []) {
  const sqlModule = await getDbConnection();
  try {
    const result = await sqlModule.query(sql, params);
    return result;
  } finally {
    // Close the connection if needed
  }
}
async function checkUserStatus() {
  try {
    // Get the user's email from the command line arguments
    const userEmail = process.argv[2];
    if (!userEmail) {
      ;
      ;
      process.exit(1);
    }
    ;
    // Query the users table
    const userResult = await query(
      `SELECT id, email, status, price_id, customer_id, created_at, updated_at 
       FROM users 
       WHERE email = $1 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [userEmail]
    );
    if (userResult.rows.length === 0) {
      ;
      return;
    }
    const user = userResult.rows[0];
    ;
    ;
    ;
    ;
    ;
    ;
    .toLocaleString()}`);
    .toLocaleString()}`);
    // If there's a payment record, show that too
    if (user.email) {
      const paymentResult = await query(
        `SELECT id, amount, status, created_at 
         FROM payments 
         WHERE user_email = $1 
         ORDER BY created_at DESC 
         LIMIT 1`,
        [user.email]
      );
      if (paymentResult.rows.length > 0) {
        const payment = paymentResult.rows[0];
        ;
        ;
        .toFixed(2)}`);
        ;
        .toLocaleString()}`);
      } else {
        ;
      }
    }
  } catch (error) {
    ;
  } finally {
    process.exit(0);
  }
}
checkUserStatus();
