import Stripe from 'stripe';
import { query } from '../lib/db';
// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});
async function testWebhook() {
  try {
    // Get your test customer ID from Stripe dashboard or create one
    const customers = await stripe.customers.list({ limit: 1 });
    const customer = customers.data[0];
    if (!customer) {
      ;
      return;
    }
    ;
    // Get the Pro price ID from environment variables
    const proPriceId = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;
    if (!proPriceId) {
      ;
      return;
    }
    // Create a test checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: proPriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: 'http://localhost:3000/dashboard?success=true',
      cancel_url: 'http://localhost:3000/pricing?cancelled=true',
      customer: customer.id,
      metadata: {
        userId: 'test_user_id'  // Replace with a real user ID for testing
      }
    });
    ;
    ;
  } catch (error) {
    ;
  } finally {
    process.exit(0);
  }
}
testWebhook();
