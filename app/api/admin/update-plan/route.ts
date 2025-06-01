import { getDbConnection } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
// This POST endpoint is intended to be called after a successful payment 
// (e.g., from a payment success page or a Stripe webhook) 
// to update the user's plan in the database.
export async function POST(request: NextRequest) {
  try {
    // It's good practice to ensure this sensitive endpoint is called legitimately.
    // For a simple setup where a client-side success page calls this,
    // relying on the user's active Clerk session for the email is a basic check.
    // A more secure setup would involve unguessable tokens or webhook verification.
    const { userId, sessionClaims } = await auth();
    const requestBody = await request.json();
    const { 
      email, 
      clerkId,
      priceId, 
      status, 
      subscriptionId,
      customerId 
    } = requestBody;
    if (!email && !clerkId) {
      return NextResponse.json(
        { error: "Email or clerkId is required" },
        { status: 400 }
      );
    }
    // Validate that the email from the request body matches the authenticated user's email if available.
    // This prevents a logged-in user from updating someone else's plan via this simple endpoint.
    if (sessionClaims?.email && email && email !== sessionClaims.email) {
        ;
        return NextResponse.json({ error: "Mismatch between authenticated user and target email" }, { status: 403 });
    }
    if (!priceId) {
      return NextResponse.json(
        { error: "priceId is required in the request body" },
        { status: 400 }
      );
    }
    const sql = await getDbConnection();
    // First, check if we have a customer ID from Stripe
    let customerToUse = customerId;
    if (!customerId && email) {
      try {
        // Try to find existing customer by email
        const customers = await stripe.customers.list({ email, limit: 1 });
        if (customers.data.length > 0) {
          customerToUse = customers.data[0].id;
        }
      } catch (error) {
        ;
      }
    }
    // Update user plan or create user if they don't exist
    const result = await sql`
      INSERT INTO users (
        email, 
        clerk_id,
        price_id, 
        status, 
        customer_id,
        subscription_id
      )
      VALUES (
        ${email || null}, 
        ${clerkId || null},
        ${priceId}, 
        ${status || 'active'}, 
        ${customerToUse || null},
        ${subscriptionId || null}
      )
      ON CONFLICT (email) 
      DO UPDATE SET 
        price_id = EXCLUDED.price_id, 
        status = EXCLUDED.status,
        customer_id = COALESCE(EXCLUDED.customer_id, users.customer_id),
        subscription_id = COALESCE(EXCLUDED.subscription_id, users.subscription_id),
        updated_at = NOW()
      RETURNING id, email, clerk_id, price_id, status, customer_id, subscription_id
    `;
    if (result.length === 0) {
      ;
      return NextResponse.json(
        { error: "Database operation failed to update or insert user plan" },
        { status: 500 }
      );
    }
    // If we have a customer ID but no subscription ID, try to find the most recent subscription
    if (result[0].customer_id && !result[0].subscription_id) {
      try {
        const subscriptions = await stripe.subscriptions.list({
          customer: result[0].customer_id,
          status: 'active',
          limit: 1
        });
        if (subscriptions.data.length > 0) {
          const subscription = subscriptions.data[0];
          // Update the user with the subscription ID
          await sql`
            UPDATE users 
            SET 
              subscription_id = ${subscription.id},
              price_id = ${subscription.items.data[0]?.price.id || priceId},
              status = ${subscription.status},
              updated_at = NOW()
            WHERE id = ${result[0].id}
            RETURNING *;
          `;
        }
      } catch (error) {
        ;
      }
    }
    ;
    return NextResponse.json({
      success: true,
      message: "User plan updated successfully",
      user: result[0]
    });
  } catch (error) {
    ;
    return NextResponse.json(
      { error: "Internal server error while updating user plan" },
      { status: 500 }
    );
  }
}
