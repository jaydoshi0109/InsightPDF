import Stripe from 'stripe';
import { query } from './db';
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-05-28.basil', // Using the version specified in the error message
  typescript: true,
});
interface CheckoutSessionParams {
  priceId: string;
  userId: string;
  customerEmail: string;
  customerName: string;
  metadata: {
    clerkUserId: string;
    userEmail: string;
    [key: string]: any;
  };
}
export const getOrCreateStripeCustomer = async (userId: string, email: string, name?: string): Promise<string> => {
  try {
    // Check if user already has a Stripe customer ID
    const existingUser = await query(
      'SELECT id, email, customer_id FROM users WHERE id = $1',
      [userId]
    );
    if (existingUser.rows[0]?.customer_id) {
      return existingUser.rows[0].customer_id;
    }
    // Create a new customer in Stripe
    const customer = await stripe.customers.create({
      email,
      name: name || 'User',
      metadata: {
        clerkUserId: userId,
      },
    });
    // Update the user with the new customer ID
    if (existingUser.rows.length > 0) {
      await query(
        `UPDATE users 
         SET customer_id = $1, email = $2, updated_at = NOW() 
         WHERE id = $3`,
        [customer.id, email, userId]
      );
    } else {
      await query(
        `INSERT INTO users (id, email, customer_id, status, created_at, updated_at)
         VALUES ($1, $2, $3, 'active', NOW(), NOW())`,
        [userId, email, customer.id]
      );
    }
    return customer.id;
  } catch (error) {
    ;
    throw new Error('Failed to create or retrieve Stripe customer');
  }
};
export const createCheckoutSession = async (params: CheckoutSessionParams) => {
  try {
    const { priceId, userId, customerEmail, customerName, metadata } = params;
    const customerId = await getOrCreateStripeCustomer(userId, customerEmail, customerName);
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerEmail,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?cancelled=true`,
      metadata: {
        ...metadata,
        clerkUserId: userId,
      },
      subscription_data: {
        metadata: {
          clerkUserId: userId,
          userEmail: customerEmail,
        },
      },
    });
    return { url: session.url, sessionId: session.id };
  } catch (error) {
    ;
    throw new Error('Failed to create checkout session');
  }
};
