import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getDbConnection } from "@/lib/db";
import { QueryResult } from "pg";
interface Summary {
  id: string;
  title: string;
  fileName: string;
  summaryText: string;
  fileUrl: string;
  createdAt: string;
  updatedAt: string;
}
export async function GET(
  request: Request,
  { params }: { params: { id?: string } }
) {
  try {
    const { userId } = getAuth(request as any);
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    const sql = await getDbConnection();
    const url = new URL(request.url);
    const summaryId = url.pathname.split('/').pop();
    // Handle single summary request
    if (summaryId && summaryId !== 'summaries') {
      const result = await sql.query<Summary>(
        `SELECT 
          ps.id,
          ps.title,
          ps.file_name as "fileName",
          ps.summary_text as "summaryText",
          ps.original_file_url as "fileUrl",
          ps.created_at as "createdAt",
          ps.updated_at as "updatedAt"
        FROM pdf_summaries ps
        JOIN users u ON ps.user_id = u.id
        WHERE ps.id = $1 AND u.clerk_id = $2
        LIMIT 1`,
        [summaryId, userId]
      );
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: "Summary not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ summary: result.rows[0] });
    }
    // Handle list summaries request
    const result = await sql.query<Summary>(
      `SELECT 
        ps.id,
        ps.title,
        ps.file_name as "fileName",
        ps.summary_text as "summaryText",
        ps.original_file_url as "fileUrl",
        ps.created_at as "createdAt",
        ps.updated_at as "updatedAt"
      FROM pdf_summaries ps
      JOIN users u ON ps.user_id = u.id
      WHERE u.clerk_id = $1
      ORDER BY ps.created_at DESC
      LIMIT 50`,
      [userId]
    );
    return NextResponse.json({ summaries: result.rows });
  } catch (error) {
    ;
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
// Handle DELETE request to remove a summary
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = getAuth(request as any);
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    const sql = await getDbConnection();
    const { id } = params;
    // First verify the summary belongs to the user
    const result = await sql.query<{ id: string }>(
      `SELECT ps.id 
      FROM pdf_summaries ps
      JOIN users u ON ps.user_id = u.id
      WHERE ps.id = $1 AND u.clerk_id = $2
      LIMIT 1`,
      [id, userId]
    );
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Summary not found or access denied" },
        { status: 404 }
      );
    }
    // Delete the summary
    await sql.query(
      `DELETE FROM pdf_summaries 
      WHERE id = $1`,
      [id]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    ;
    return NextResponse.json(
      { error: "Failed to delete summary" },
      { status: 500 }
    );
  }
}
