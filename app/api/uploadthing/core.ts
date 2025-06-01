import { currentUser } from "@clerk/nextjs/server";
import { UploadThingError } from "uploadthing/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getDbConnection } from "@/lib/db";
const f = createUploadthing();
async function saveFileToDatabase(userId: string, file: { name: string; url: string; key: string; size: number }) {
  try {
    const pool = await getDbConnection();
    // Get user ID from clerk_id
    const userResult = await pool.query(
      'SELECT id FROM users WHERE clerk_id = $1',
      [userId]
    );
    if (userResult.rows.length === 0) {
      ;
      return null;
    }
    const dbUserId = userResult.rows[0].id;
    // Save file info to database
    const result = await pool.query(
      `INSERT INTO pdf_summaries 
       (user_id, file_name, original_file_url, summary_text, status, title)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        dbUserId,
        file.name,
        file.url,
        'Processing...', // Initial summary text
        'processing',
        file.name.replace(/\.[^/.]+$/, '') // Use filename without extension as title
      ]
    );
    return result.rows[0].id;
  } catch (error) {
    ;
    return null;
  }
}
export const ourFileRouter = {
  pdfUploader: f({ pdf: { maxFileSize: "32MB" } })
    .middleware(async ({ req }) => {
      const user = await currentUser();
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      ;
      // First check if we already have an entry for this file
      const pool = await getDbConnection();
      const userResult = await pool.query(
        'SELECT id FROM users WHERE clerk_id = $1',
        [metadata.userId]
      );
      if (userResult.rows.length === 0) {
        ;
        throw new UploadThingError('User not found');
      }
      const dbUserId = userResult.rows[0].id;
      // Check if we already have an entry for this file
      const existingSummary = await pool.query(
        'SELECT id FROM pdf_summaries WHERE original_file_url = $1 AND user_id = $2',
        [file.url, dbUserId]
      );
      let summaryId;
      if (existingSummary.rows.length === 0) {
        // Only create a new entry if one doesn't exist
        summaryId = await saveFileToDatabase(metadata.userId, {
          name: file.name,
          size: file.size,
          url: file.url,
          key: file.key,
        });
        if (!summaryId) {
          ;
          throw new UploadThingError('Failed to save file information');
        }
      } else {
        summaryId = existingSummary.rows[0].id;
        ;
      }
      return {
        userId: metadata.userId,
        summaryId,
        file: {
          name: file.name,
          size: file.size,
          url: file.url,
          key: file.key,
        },
      };
    }),
} satisfies FileRouter;
export type OurFileRouter = typeof ourFileRouter;
