import {
  handleSessionCompleted,
  handleSubscriptionDeleted,
} from "@/lib/payment";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
export async function POST(req: NextRequest) {
  const payload = await req.text();
  try {
    const sig = req.headers.get("Stripe-Signature");
    if (!sig) {
      return NextResponse.json(
        {
          error: "Missing Stripe signature",
        },
        { status: 400 }
      );
    }
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json(
        {
          error: "Missing Stripe webhook secret",
        },
        { status: 500 }
      );
    }
    const event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
    if (event.type === "checkout.session.completed") {
      const sessionId = event.data.object.id;
      ;
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["line_items"],
      });
      await handleSessionCompleted({ session, stripe });
      ;
    } else if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      ;
      const subscriptionIdDeleted = subscription.id;
      await handleSubscriptionDeleted({ subscriptionIdDeleted, stripe });
      ;
    } else {
      ;
    }
  } catch (error) {
    ;
    return NextResponse.json(
      {
        error: "Failed to process webhook",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
  return NextResponse.json({
    status: "success",
    message: "Payment successful",
  });
}
