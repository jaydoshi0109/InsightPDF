import { ReactNode } from 'react';
import { currentUser } from '@clerk/nextjs/server';
import { getUserPlan } from '@/lib/user';
import { pricingPlans } from '@/utils/constants';
import { redirect } from 'next/navigation';
interface SubscriptionGuardProps {
  children: ReactNode;
}
/**
 * A server component that restricts access to paid subscribers only
 * Redirects to pricing page if user doesn't have a paid plan
 */
export default async function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const user = await currentUser();
  // If not logged in, redirect to sign-in
  if (!user?.id) {
    redirect('/sign-in');
  }
  // Check user's subscription status
  let priceId: string | null = null;
  const email = user.emailAddresses[0].emailAddress;
  if (email) {
    priceId = await getUserPlan(email);
  }
  const plan = pricingPlans.find((plan) => plan.priceId === priceId);
  const hasPaidPlan = !!plan; // User has either Basic or Pro plan
  // Redirect users without a paid plan to pricing page
  if (!hasPaidPlan) {
    redirect('/#pricing');
  }
  // User has a paid plan, render the children
  return <>{children}</>;
}
