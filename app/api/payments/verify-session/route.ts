import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // Use the latest API version that matches the installed Stripe package
  apiVersion: '2025-05-28.basil' as const,
});
export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }
    // Retrieve the session from Stripe with expanded details
    const session = await stripe.checkout.sessions.retrieve(sessionId as string, {
      expand: [
        'line_items',
        'subscription',
        'customer',
        'payment_intent'
      ],
    });
    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }
    // Extract important details
    const priceId = session.line_items?.data?.[0]?.price?.id;
    const subscriptionId = typeof session.subscription === 'string' 
      ? session.subscription 
      : session.subscription?.id;
    const customerId = typeof session.customer === 'string'
      ? session.customer
      : session.customer?.id;
    if (!priceId) {
      ;
      return NextResponse.json(
        { error: "Price ID not found in session" },
        { status: 500 }
      );
    }
    // Verify the subscription status if this is a subscription
    let subscriptionStatus = 'active'; // Default to active for one-time payments
    if (subscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        subscriptionStatus = subscription.status;
      } catch (error) {
        ;
        // Continue with default status
      }
    }
    return NextResponse.json({ 
      priceId,
      subscriptionId,
      customerId,
      status: subscriptionStatus,
      paymentStatus: session.payment_status,
      amount: session.amount_total
    });
  } catch (error) {
    ;
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: "Failed to verify session", details: errorMessage },
      { status: 500 }
    );
  }
}
