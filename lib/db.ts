import type { Pool } from 'pg';
// Database connection - will be initialized on the server side only
let pool: Pool | null = null;
// Create a no-op pool for client-side
class NoopPool {
  async query() {
    ;
    return { rows: [], rowCount: 0 };
  }
  async end() {}
  on() {}
  once() {}
  removeListener() {}
  removeAllListeners() {}
  emit() { return false; }
  off() { return this; }
  addListener() { return this; }
  getMaxListeners() { return 0; }
  setMaxListeners() { return this; }
  listeners() { return []; }
  rawListeners() { return []; }
  listenerCount() { return 0; }
  eventNames() { return []; }
  prependListener() { return this; }
  prependOnceListener() { return this; }
}
// Initialize the database connection
async function initializePool() {
  if (typeof window !== 'undefined') {
    ;
    return null;
  }
  if (pool) return pool;
  try {
    if (!process.env.DATABASE_URL) {
      ;
      return null;
    }
    // Dynamic import for server-side only
    const { Pool: PgPool } = await import('pg');
    pool = new PgPool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    // Test the connection
    await pool.query('SELECT NOW()');
    ;
    return pool;
  } catch (error) {
    ;
    pool = null;
    return null;
  }
}
// Initialize the pool when this module is imported
initializePool().catch();
// Export a no-op pool for client-side
const noopPool = new NoopPool();
// Helper function to get a database connection
export const getDbConnection = async () => {
  // Return no-op pool in browser
  if (typeof window !== 'undefined') {
    return noopPool as unknown as Pool;
  }
  if (!pool) {
    // Try to initialize the pool if it's not already initialized
    await initializePool();
    if (!pool) {
      throw new Error('Database connection is not available');
    }
  }
  return pool;
};
// Helper function to execute queries
export const query = async (sql: string, params: any[] = []) => {
  // Return empty result in browser
  if (typeof window !== 'undefined') {
    ;
    return { rows: [], rowCount: 0 };
  }
  try {
    const db = await getDbConnection();
    if (!db) {
      ;
      return { rows: [], rowCount: 0 };
    }
    const result = await db.query(sql, params);
    return { rows: result.rows, rowCount: result.rowCount };
  } catch (error) {
    ;
    throw error;
  }
};
// Helper function to get a single row
export const getOne = async (sql: string, params: any[] = []) => {
  const result = await query(sql, params);
  return result.rows[0] || null;
};
// Helper function to get all rows
export const getAll = async (sql: string, params: any[] = []) => {
  const result = await query(sql, params);
  return result.rows;
};
// Test the connection
export const testConnection = async () => {
  try {
    await query('SELECT NOW()');
    ;
    return true;
  } catch (error) {
    ;
    return false;
  }
};
// Close the database connection pool
export const closePool = async () => {
  if (pool) {
    await pool.end();
    pool = null;
    ;
  }
};
// Test connection on startup if pool is initialized
if (pool) {
  (async () => {
    ;
    try {
      const isConnected = await testConnection();
      if (isConnected) {
        ;
      } else {
        ;
      }
    } catch (error) {
      ;
    }
  })();
} else {
  ;
}
export { pool };
