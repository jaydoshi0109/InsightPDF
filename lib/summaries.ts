import { getDbConnection } from "./db";
import { getOrCreateUser } from "./user-utils";
export async function getSummaries(clerkUserId: string) {
  console.log('Getting summaries for user:', clerkUserId ? '***' + clerkUserId.slice(-4) : 'undefined');
  
  if (!clerkUserId) {
    console.warn('No clerkUserId provided to getSummaries');
    return [];
  }
  try {
    console.log('Connecting to database...');
    const pool = await getDbConnection();
    try {
      // First, check if clerk_id column exists
      console.log('Checking for clerk_id column in users table...');
      const columnCheck = await pool.query(
        `SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='users' AND column_name='clerk_id'`
      );
      const hasClerkIdColumn = columnCheck.rows && columnCheck.rows.length > 0;
      console.log('clerk_id column exists:', hasClerkIdColumn);
      
      // Get or create user using utility function
      const tempEmail = `${clerkUserId}@temp.user`;
      console.log('Getting or creating user with email:', tempEmail);
      const user = await getOrCreateUser(clerkUserId, tempEmail);
      if (!user || !user.id) {
        console.error('Failed to get or create user');
        return [];
      }
      const userId = user.id;
      // Now fetch summaries for this user
      try {
        const result = await pool.query(
          `SELECT 
            id, 
            user_id, 
            original_file_url, 
            summary_text, 
            COALESCE(status, 'completed') as status, 
            title, 
            file_name, 
            created_at, 
            updated_at
          FROM pdf_summaries
          WHERE user_id = $1
          ORDER BY created_at DESC
          LIMIT 100`,
          [userId]
        );
        console.log(`Found ${result.rows?.length || 0} summaries for user`);
        return result.rows || [];
      } catch (error: any) {
        console.error('Error fetching summaries:', {
          message: error.message,
          stack: error.stack?.split('\n').slice(0, 3).join('\n') + '...'
        });
        return [];
      }
    } catch (error: any) {
      console.error('Error in database operation:', {
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 3).join('\n') + '...'
      });
      return [];
    }
  } catch (error: any) {
    console.error('Error in getSummaries:', {
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 3).join('\n') + '...'
    });
    return [];
  }
}
export async function getSummaryById(id: string) {
  console.log('Getting summary by ID:', id);
  if (!id) {
    console.warn('No ID provided to getSummaryById');
    return null;
  }

  try {
    const pool = await getDbConnection();
    const result = await pool.query(
      `SELECT 
        id, 
        user_id, 
        title, 
        original_file_url,
        summary_text, 
        created_at, 
        updated_at, 
        status, 
        file_name, 
        LENGTH(summary_text)-LENGTH(REPLACE(summary_text,' ',' '))+1 as word_count 
      FROM pdf_summaries 
      WHERE id = $1`,
      [id]
    );
    
    const summary = result.rows[0] || null;
    console.log(`Summary ${summary ? 'found' : 'not found'} for ID:`, id);
    return summary;
  } catch (error: any) {
    console.error('Error in getSummaryById:', {
      id,
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 3).join('\n') + '...'
    });
    return null;
  }
}
