"use server"
import { auth } from "@clerk/nextjs/server"
import { getDbConnection } from "@/lib/db"
// This function is now called server-side in the upload page
export async function syncUser() {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: "Not authenticated" }
    // Get user data from Clerk
    const clerkUser = await fetch(
      `https://api.clerk.dev/v1/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        },
      }
    ).then((res) => res.json())
    if (!clerkUser) {
      return { success: false, error: "User not found in Clerk" }
    }
    // Get database connection
    const sql = await getDbConnection()
    // Check if user exists in database
    const existingUser = await sql`
      SELECT * FROM users 
      WHERE clerk_id = ${userId}
      LIMIT 1;
    `
    // If user doesn't exist, create them
    if (!existingUser || existingUser.length === 0) {
      await sql`
        INSERT INTO users (clerk_id, email, created_at, updated_at)
        VALUES (${userId}, ${clerkUser.email_addresses[0].email_address}, NOW(), NOW())
        RETURNING *;
      `
    }
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
