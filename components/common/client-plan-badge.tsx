"use client";
import { useEffect, useState } from "react";
import { CheckIcon, CrownIcon, Loader2, StarIcon } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
export type PlanType = 'pro' | 'basic' | 'none';
export default function ClientPlanBadge() {
  const { userId } = useAuth();
  const [planType, setPlanType] = useState<PlanType>('none');
  const [planName, setPlanName] = useState<string>('Free');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let isMounted = true;
    async function fetchUserPlan() {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        setError(null);
        // Fetch the user's plan from our cached API endpoint
        const response = await fetch('/api/user-plan', {
          next: { revalidate: 300 }, // Revalidate every 5 minutes
          headers: {
            'Cache-Control': 'public, max-age=300, stale-while-revalidate=300'
          }
        });
        if (!isMounted) return;
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (isMounted) {
          setPlanType(data.planType || 'none');
          setPlanName(data.planName || 'Free');
        }
      } catch (err) {
        ;
        if (isMounted) {
          setError('Failed to load plan');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    fetchUserPlan();
    // Set up a refresh interval to update the badge periodically
    const refreshInterval = setInterval(fetchUserPlan, 5 * 60 * 1000); // 5 minutes
    return () => {
      isMounted = false;
      clearInterval(refreshInterval);
    };
  }, [userId]);
  if (!userId) return null;
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-full px-3 py-1 bg-gray-100 dark:bg-gray-800">
        <Loader2 className="w-3 h-3 animate-spin text-gray-500" />
        <span className="text-xs font-medium text-gray-500">Loading...</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-full px-3 py-1 bg-red-50 dark:bg-red-900/20">
        <span className="text-xs font-medium text-red-600 dark:text-red-400">Error</span>
      </div>
    );
  }
  // Return different styles based on plan type
  return (
    <div 
      className={`flex items-center gap-2 rounded-full px-3 py-1 transition-all duration-200 ${
        planType === 'pro' 
          ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40' 
          : planType === 'basic' 
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40' 
            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      {planType === 'pro' && <CrownIcon size={14} className="text-amber-300 flex-shrink-0" />}
      {planType === 'basic' && <StarIcon size={14} className="text-blue-200 flex-shrink-0" />}
      {planType === 'none' && <CheckIcon size={14} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />}
      <span className="text-xs font-semibold whitespace-nowrap">{planName}</span>
    </div>
  );
}
