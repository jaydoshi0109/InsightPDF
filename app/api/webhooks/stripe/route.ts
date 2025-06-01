import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { stripe } from '../../../../lib/stripe';
import Stripe from 'stripe';
// Helper function to safely parse timestamps
const toTimestamp = (seconds: number) => new Date(seconds * 1000);
// Extend the Stripe namespace to include the subscription property
// on the checkout.session.completed event
declare module 'stripe' {
  namespace Stripe {
    interface CheckoutSession {
      subscription: string | Stripe.Subscription;
      metadata?: {
        userId?: string;
      };
      client_reference_id?: string | null;
    }
  }
}
// Define a type for the subscription with the correct properties
type SubscriptionWithItems = Omit<Stripe.Subscription, 'items' | 'current_period_end' | 'customer' | 'status'> & {
  items: {
    data: Array<{
      price: {
        id: string;
      };
    }>;
  };
  current_period_end: number;
  customer: string | Stripe.Customer | Stripe.DeletedCustomer;
  status: string;
};
export async function POST(req: Request) {
  try {
    const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not set');
    }
    const body = await req.text();
    const signature = headers().get('stripe-signature');
    if (!signature) {
      return new NextResponse('No signature provided', { status: 400 });
    }
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        WEBHOOK_SECRET
      ) as Stripe.Event;
    } catch (err) {
      const error = err as Error;
      ;
      return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }
    const eventType = event.type;
    ;
    // Handle the event
    switch (eventType) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session & {
          subscription: string | Stripe.Subscription;
          metadata?: {
            userId?: string;
          };
          client_reference_id?: string | null;
        };
        if (!session.subscription) {
          ;
          return new NextResponse('No subscription ID', { status: 400 });
        }
        try {
          // Get the subscription ID
          const subscriptionId = typeof session.subscription === 'string' 
            ? session.subscription 
            : session.subscription.id;
          // Get the subscription details
          const subscription = await stripe.subscriptions.retrieve(subscriptionId) as unknown as SubscriptionWithItems;
          // Get the user ID from the metadata or client_reference_id
          const userId = session.metadata?.userId || session.client_reference_id;
          if (!userId) {
            ;
            return new NextResponse('User ID is required', { status: 400 });
          }
          // Get the price ID from the subscription
          const priceItem = subscription.items?.data?.[0]?.price;
          if (!priceItem?.id) {
            ;
            return new NextResponse('No price ID found in subscription', { status: 400 });
          }
          // Get the customer email from the subscription or session
          const customer = await stripe.customers.retrieve(subscription.customer as string);
          const customerEmail = 'email' in customer ? customer.email : session.customer_email;
          if (!customerEmail) {
            ;
            return new NextResponse('No email found for customer', { status: 400 });
          }
          // Get the customer ID
          const customerId = typeof subscription.customer === 'string' 
            ? subscription.customer 
            : 'deleted' in subscription.customer 
              ? null 
              : subscription.customer.id;
          if (!customerId) {
            ;
            return new NextResponse('No customer ID found', { status: 400 });
          }
          // Get the price ID from the subscription
          const priceId = priceItem.id;
          // Determine if this is a Pro plan based on the price ID
          const isPro = priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;
          const plan = isPro ? 'pro' : 'basic';
          ;
          // Update or create user in database with subscription details
          await query(
            `INSERT INTO users (clerk_id, email, customer_id, price_id, status, updated_at)
             VALUES ($1, $2, $3, $4, 'active', NOW())
             ON CONFLICT (clerk_id) 
             DO UPDATE SET 
               email = EXCLUDED.email,
               customer_id = EXCLUDED.customer_id,
               price_id = EXCLUDED.price_id,
               status = 'active',
               updated_at = NOW()`,
            [userId, customerEmail, customerId, priceId]
          );
          // Record the payment if payment_intent exists
          if (session.payment_intent) {
            try {
              const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string);
              await query(
                `INSERT INTO payments (
                  user_email, amount, status, stripe_payment_id, price_id, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
                [
                  customerEmail,
                  paymentIntent.amount,
                  paymentIntent.status,
                  paymentIntent.id,
                  priceId
                ]
              );
              ;
            } catch (error) {
              ;
              // Continue even if payment recording fails
            }
          }
          ;
          return new NextResponse(JSON.stringify({ received: true }), { status: 200 });
        } catch (error) {
          ;
          return new NextResponse(
            JSON.stringify({ error: 'Failed to process checkout session' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as unknown as SubscriptionWithItems;
        try {
          // Find the user with this subscription ID
          const userResult = await query(
            'SELECT * FROM users WHERE subscription_id = $1',
            [subscription.id]
          );
          if (userResult.rows.length === 0) {
            ;
            return new NextResponse('User not found', { status: 404 });
          }
          const user = userResult.rows[0];
          // Update the subscription in the database
          await query(
            `UPDATE subscriptions 
             SET 
               status = $1,
               current_period_end = to_timestamp($2),
               updated_at = NOW()
             WHERE id = $3`,
            [subscription.status, subscription.current_period_end, subscription.id]
          );
          // If subscription was canceled or deleted, update user status
          if (eventType === 'customer.subscription.deleted' || 
              subscription.status === 'canceled' || 
              subscription.status === 'unpaid') {
            await query(
              `UPDATE users 
               SET status = 'inactive', updated_at = NOW() 
               WHERE id = $1`,
              [user.id]
            );
          }
          if (user) {
            const priceItem = subscription.items?.data?.[0]?.price;
            if (!priceItem?.id) {
              ;
              return new NextResponse('No price ID found', { status: 400 });
            }
            const priceId = priceItem.id;
            // Get the customer ID, handling both string and object cases
            const customerId = typeof subscription.customer === 'string' 
          }
        } catch (error) {
          ;
          return new NextResponse(
            JSON.stringify({ 
              error: 'Failed to process subscription update',
              details: error instanceof Error ? error.message : 'Unknown error'
            }),
            { 
              status: 500, 
              headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
              } 
            }
          );
        }
        break;
      }
      default:
        ;
    }
    return new NextResponse(JSON.stringify({ received: true }), { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    ;
    return new NextResponse(
      JSON.stringify({ 
        error: `Webhook Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }),
      { 
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
