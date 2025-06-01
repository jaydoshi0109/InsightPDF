import { ReactNode } from 'react';
import { hasAccess, PlanType } from './plan-badge';
import Link from 'next/link';
interface PlanAccessProps {
  children: ReactNode;
  requiredPlan?: PlanType;
  fallback?: ReactNode;
}
/**
 * Component to conditionally render content based on user's subscription plan
 * 
 * @param children - Content to show if user has access
 * @param requiredPlan - Minimum plan required to access content ('none', 'basic', or 'pro')
 * @param fallback - Optional content to show if user doesn't have access
 */
export default async function PlanAccess({ 
  children, 
  requiredPlan = 'basic', 
  fallback 
}: PlanAccessProps) {
  const userHasAccess = await hasAccess(requiredPlan);
  if (userHasAccess) {
    return <>{children}</>;
  }
  // If no fallback is provided, show a default upgrade message
  if (!fallback) {
    return (
      <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
        <h3 className="text-amber-800 font-semibold mb-2">
          {requiredPlan === 'pro' ? 'Pro Plan Required' : 'Subscription Required'}
        </h3>
        <p className="text-amber-700 mb-3">
          {requiredPlan === 'pro'
            ? 'This feature is only available on the Pro plan.'
            : 'You need a subscription to access this feature.'}
        </p>
        <Link 
          href="/#pricing" 
          className="text-sm px-3 py-1 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
        >
          Upgrade Now
        </Link>
      </div>
    );
  }
  return <>{fallback}</>;
}
