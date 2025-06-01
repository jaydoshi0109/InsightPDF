"use server";
import { getDbConnection } from "@/lib/db";
import { generateSummaryFromGemini } from "@/lib/gemini";
import { fetchANdExtractPdfText } from "@/lib/langchain";
import { generateSummaryFromOpenAI } from "@/lib/openai";
import { formatFileNameAsTitle } from "@/utils/format-utils";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
interface PdfSummary {
  userId?: string;
  fileUrl: string;
  summary: string;
  title: string;
  fileName: string;
}
export async function generatePdfSummary(
  uploadResponse: [
    {
      serverData: {
        userId: string;
        file: {
          url: string;
          name: string;
        };
      };
    },
  ]
) {
  if (!uploadResponse) {
    return {
      success: false,
      message: "File Upload failed",
      data: null,
    };
  }
  const {
    serverData: {
      userId,
      file: { url: pdfUrl, name: fileName },
    },
  } = uploadResponse[0];
  if (!pdfUrl) {
    return {
      success: false,
      message: "File Upload failed",
      data: null,
    };
  }
  try {
    const pdfText = await fetchANdExtractPdfText(pdfUrl);
    ;
    let summary;
    let errorMessage = '';
    // First try OpenAI
    try {
      summary = await generateSummaryFromOpenAI(pdfText);
      ;
    } catch (openAIError: any) {
      ;
      errorMessage = 'OpenAI API: ' + (openAIError.message || 'Service unavailable');
      // If OpenAI rate limited, wait a moment before trying Gemini
      if (openAIError.message === 'RATE_LIMIT_EXCEEDED') {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second cooldown
      }
      // Fallback to Gemini if OpenAI fails
      try {
        summary = await generateSummaryFromGemini(pdfText);
      } catch (geminiError: any) {
        ;
        errorMessage += '\nGemini API: ' + (geminiError.message || 'Service unavailable');
        // Provide more detailed error information
        if (geminiError.status === 429) {
          errorMessage += ' (Rate limit exceeded)';
        }
        throw new Error(
          `Failed to generate summary. Please try again later.\n\n${errorMessage}`
        );
      }
    }
    if (!summary) {
      return {
        success: false,
        message: "File to generate summary",
        data: null,
      };
    }
    const formattedFileName = formatFileNameAsTitle(fileName);
    return {
      success: true,
      message: "Summary generated successfully",
      data: {
        title: formattedFileName,
        summary,
      },
    };
  } catch (err) {
    return {
      success: false,
      message: "File Upload failed",
      data: null,
    };
  }
}
async function savePdfSummary({
  userId,
  fileUrl,
  summary,
  title,
  fileName,
}: PdfSummary) {
  // Log the summary length for debugging
  console.log('Saving PDF summary:', {
    title,
    fileName,
    summaryLength: summary?.length || 0
  });

  // Validate required parameters
  if (!userId || !fileUrl || !summary || !title || !fileName) {
    console.error('Missing required parameters:', { userId: !!userId, fileUrl: !!fileUrl, summary: !!summary, title: !!title, fileName: !!fileName });
    throw new Error('Missing required parameters');
  }
  let client;
  try {
    const pool = await getDbConnection();
    client = await pool.connect();
    // First, find the user by their Clerk ID to get the database UUID
    const userResult = await client.query(
      'SELECT id FROM users WHERE clerk_id = $1 LIMIT 1',
      [userId]
    );
    let dbUserId: string;
    if (!userResult.rows || userResult.rows.length === 0) {
      // If user doesn't exist, create a new user record
      console.log('Creating new user record for clerk ID:', userId);
      // Use a temporary email that can be updated later when user completes profile
      const newUser = await client.query(
        'INSERT INTO users (clerk_id, email, status) VALUES ($1, $2, $3) RETURNING id',
        [userId, `${userId}@temp.user`, 'active']
      );
      if (!newUser.rows || newUser.rows.length === 0) {
        throw new Error('Failed to create user record');
      }
      dbUserId = newUser.rows[0].id;
    } else {
      dbUserId = userResult.rows[0].id;
    }
    // Ensure the table exists with correct schema
    console.log('Ensuring pdf_summaries table exists');
    await client.query(`
      CREATE TABLE IF NOT EXISTS pdf_summaries (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        original_file_url TEXT NOT NULL,
        summary_text TEXT NOT NULL,
        title TEXT NOT NULL,
        file_name TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'completed'
      )
    `);
    // Check if a summary with this file URL already exists
    ;
    const existingSummary = await client.query(
      'SELECT id FROM pdf_summaries WHERE original_file_url = $1 AND user_id = $2',
      [fileUrl, dbUserId]
    );
    let result;
    if (existingSummary.rows && existingSummary.rows.length > 0) {
      // Update existing summary
      console.log('Updating existing summary for file:', fileUrl);
      result = await client.query(
        `UPDATE pdf_summaries 
         SET summary_text = $1, 
             title = $2, 
             file_name = $3,
             status = 'completed',
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4
         RETURNING id, summary_text, status`,
        [summary, title, fileName, existingSummary.rows[0].id]
      );
    } else {
      // Insert new summary
      console.log('Creating new summary for file:', fileUrl);
      result = await client.query(
        `INSERT INTO pdf_summaries (
          user_id,
          original_file_url,
          summary_text,
          title,
          file_name,
          status
        ) VALUES ($1, $2, $3, $4, $5, 'completed')
        RETURNING id, summary_text, status`,
        [dbUserId, fileUrl, summary, title, fileName]
      );
    }
    if (!result.rows || result.rows.length === 0) {
      throw new Error('No data returned from insert operation');
    }
    const savedSummary = result.rows[0];
    return { 
      success: true, 
      id: savedSummary.id,
      status: savedSummary.status
    };
  } catch (error: any) {
    console.error('Error saving PDF summary:', {
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 3).join('\n') + '...'
    });
    throw new Error(`Failed to save PDF summary: ${error.message || 'Unknown error'}`);
  } finally {
    // Release the client back to the pool
    if (client) {
      try {
        await client.release();
      } catch (releaseError) {
        ;
      }
    }
  }
}
export async function storePdfSummaryAction({
  fileUrl,
  summary,
  title,
  fileName,
}: Omit<PdfSummary, 'userId'>) {
  try {
    // Verify user is logged in - auth() returns a Promise
    console.log('Starting storePdfSummaryAction for file:', fileName);
    const authResult = await auth();
    const userId = authResult.userId;
    
    if (!userId) {
      console.warn('Unauthorized attempt to save summary - no user ID');
      return {
        success: false,
        message: "You must be logged in to save a summary",
        data: null,
      };
    }
    
    console.log('Saving PDF summary for user:', userId);
    const savedSummary = await savePdfSummary({
      userId,
      fileUrl,
      summary,
      title,
      fileName,
    });
    
    // Invalidate cache for dashboard to show updated summary list
    revalidatePath("/dashboard");
    
    console.log('Successfully saved PDF summary:', { title, fileName, userId });
    return {
      success: true,
      message: "PDF Summary saved successfully",
      data: savedSummary,
    };
  } catch (error: any) {
    // Handle any errors that occurred during the process
    const errorMessage = error.message || 'An unknown error occurred';
    const errorStack = error.stack ? error.stack.split('\n').slice(0, 3).join('\n') + '...' : 'No stack trace';
    const errorUserId = (error.userId || 'unknown').substring(0, 8) + '...';
    
    console.error('Error in storePdfSummaryAction:', {
      error: errorMessage,
      stack: errorStack,
      userId: errorUserId,
      file: fileName
    });
    
    return {
      success: false,
      message: errorMessage,
      data: null,
    };
  }
}
