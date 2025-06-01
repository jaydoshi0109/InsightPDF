import { currentUser } from "@clerk/nextjs/server";
import { getUserPlan } from "@/lib/user";
import { pricingPlans } from "@/utils/constants";
import { CheckIcon, CrownIcon, StarIcon } from "lucide-react";
export type PlanType = 'pro' | 'basic' | 'none';
export default async function PlanBadge() {
  const user = await currentUser();
  if (!user?.id) return null;
  let priceId: string | null = null;
  const email = user.emailAddresses[0].emailAddress;
  if (email) {
    priceId = await getUserPlan(email);
  }
  const plan = pricingPlans.find((plan) => plan.priceId === priceId);
  let planName = "Free";
  let planType: PlanType = 'none';
  if (plan) {
    planName = plan.name;
    planType = plan.id as PlanType;
  }
  // Return different styles based on plan type
  return (
    <div className={`flex items-center gap-2 rounded-full px-3 py-1 ${
      planType === 'pro' 
        ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white' 
        : planType === 'basic' 
          ? 'bg-blue-100 text-blue-800' 
          : 'bg-gray-100 text-gray-800'
    }`}>
      {planType === 'pro' && <CrownIcon size={14} className="text-yellow-300" />}
      {planType === 'basic' && <StarIcon size={14} />}
      {planType === 'none' && <CheckIcon size={14} />}
      <span className="text-xs font-semibold">{planName}</span>
    </div>
  );
}
// Helper function to check if a user has access to a specific feature based on their plan
export async function hasAccess(requiredPlan: PlanType = 'basic'): Promise<boolean> {
  const user = await currentUser();
  if (!user?.id) return false;
  let priceId: string | null = null;
  const email = user.emailAddresses[0].emailAddress;
  if (email) {
    priceId = await getUserPlan(email);
  }
  const plan = pricingPlans.find((plan) => plan.priceId === priceId);
  const userPlanType: PlanType = plan ? (plan.id as PlanType) : 'none';
  // Access rules:
  // - 'none' can only access free features
  // - 'basic' can access basic and free features
  // - 'pro' can access everything
  if (requiredPlan === 'none') return true; // Everyone has access to free features
  if (requiredPlan === 'basic') return userPlanType === 'basic' || userPlanType === 'pro';
  if (requiredPlan === 'pro') return userPlanType === 'pro';
  return false;
}