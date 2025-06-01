import { getDbConnection } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await auth();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Get user email from session
    const userEmail = session.sessionClaims?.email;
    if (!userEmail) {
      return NextResponse.json(
        { error: "Email not found in session" },
        { status: 400 }
      );
    }
    // Get price ID from environment variables
    const priceId = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;
    if (!priceId) {
      return NextResponse.json(
        { error: "Pro price ID not found in environment variables" },
        { status: 500 }
      );
    }
    // Connect to database
    const sql = await getDbConnection();
    // Simple upsert approach - update if exists, insert if not
    const result = await sql`
      INSERT INTO users (email, price_id, status)
      VALUES (${userEmail}, ${priceId}, 'active')
      ON CONFLICT (email) 
      DO UPDATE SET price_id = ${priceId}, status = 'active'
      RETURNING id, email, price_id, status
    `;
    if (result.length > 0) {
      return NextResponse.json({
        success: true,
        message: "User upgraded to Pro successfully",
        user: result[0]
      });
    }
    // return NextResponse.json({
    //   success: true,
    //   message: "User upgraded to Pro successfully",
    //   user: result[0]
    // });
  } catch (error) {
    ;
    return NextResponse.json(
      { error: "Failed to upgrade user" },
      { status: 500 }
    );
  }
}
