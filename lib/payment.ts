import Stripe from "stripe";
import { query } from "./db";
export async function handleSubscriptionDeleted({
  subscriptionIdDeleted,
  stripe,
}: {
  subscriptionIdDeleted: string;
  stripe: Stripe;
}) {
  ;
  try {
    // First verify the subscription exists
    const subscription = await stripe.subscriptions.retrieve(
      subscriptionIdDeleted
    );
    if (!subscription.customer) {
      throw new Error("No customer found for subscription");
    }
    try {
      // Log the customer ID we're updating
      ;
      await query(
        `UPDATE users
         SET status = 'cancelled',
             updated_at = NOW()
         WHERE customer_id = $1`,
        [subscription.customer]
      );
      ;
    } catch (error) {
      ;
      throw error;
    }
  } catch (error) {
    ;
    throw error;
  }
}
export async function handleSessionCompleted({
  session,
  stripe,
}: {
  session: Stripe.Checkout.Session;
  stripe: Stripe;
}) {
  ;
  const customerId = session.customer as string;
  const customer = await stripe.customers.retrieve(customerId);
  const priceId = session.line_items?.data[0]?.price?.id;
  if ("email" in customer && priceId) {
    const { email, name } = customer;
    await createOrUpdateUser({
      email: email as string,
      full_name: name as string || 'Unknown',
      customer_id: customerId,
      price_id: priceId as string,
      status: "active",
    });
    await createPayment({
      session,
      price_id: priceId as string,
      user_email: email as string,
    });
  }
}
async function createOrUpdateUser({
  email,
  full_name,
  customer_id,
  price_id,
  status,
}: {
  email: string;
  full_name: string;
  customer_id: string;
  price_id: string;
  status: string;
}) {
  try {
    // Check if user exists
    const existingUser = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    if (existingUser.rows.length === 0) {
      // Create new user
      await query(
        `INSERT INTO users (email, full_name, customer_id, price_id, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         RETURNING *`,
        [email, full_name, customer_id, price_id, status]
      );
    } else {
      // Update existing user
      await query(
        `UPDATE users
         SET full_name = $1,
             customer_id = $2,
             price_id = $3,
             status = $4,
             updated_at = NOW()
         WHERE email = $5
         RETURNING *`,
        [full_name, customer_id, price_id, status, email]
      );
    }
  } catch (error) {
    ;
    throw error;
  }
}
async function createPayment({
  session,
  price_id,
  user_email,
}: {
  session: Stripe.Checkout.Session;
  price_id: string;
  user_email: string;
}) {
  try {
    const { amount_total, status, id } = session;
    await query(
      `INSERT INTO payments (amount, status, stripe_payment_id, user_email, price_id)
        VALUES ($1, $2, $3, $4, $5)`,
      [amount_total, status, id, user_email, price_id]
    );
  } catch (error) {
    ;
  }
}
