"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { verifyAndUpdateSubscription } from "@/lib/subscription";
export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const [isUpdating, setIsUpdating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    status: string;
    priceId: string | null;
    isActive: boolean;
  } | null>(null);
  useEffect(() => {
    const updateUserPlan = async () => {
      try {
        if (!user || !user.id || !user.emailAddresses[0]) {
          setError("User information not available");
          setIsUpdating(false);
          return;
        }
        const sessionId = searchParams.get("session_id");
        if (!sessionId) {
          setError("Session ID not found");
          setIsUpdating(false);
          return;
        }
        // 1. First verify the session with Stripe
        const response = await fetch("/api/payments/verify-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to verify payment");
        }
        // 2. Update our database with the subscription info
        const updateResponse = await fetch("/api/admin/update-plan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.emailAddresses[0].emailAddress,
            clerkId: user.id,
            priceId: data.priceId,
            status: "active",
            subscriptionId: data.subscriptionId,
            customerId: data.customerId
          }),
        });
        const updateData = await updateResponse.json();
        if (!updateResponse.ok) {
          throw new Error(updateData.error || "Failed to update subscription");
        }
        // 3. Double-check the subscription status with Stripe
        const subscription = await verifyAndUpdateSubscription(user.id);
        setSubscriptionStatus({
          status: subscription?.status || 'active',
          priceId: subscription?.priceId || data.priceId,
          isActive: subscription?.isActive || true
        });
        setIsUpdating(false);
      } catch (error) {
        ;
        setError(error instanceof Error ? error.message : "An unknown error occurred");
        setIsUpdating(false);
      }
    };
    if (user) {
      updateUserPlan();
    }
  }, [user, searchParams]);
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-slate-800/50 rounded-xl p-8 backdrop-blur-sm border border-slate-700/50">
          {isUpdating ? (
            <div className="text-center">
              <div className="animate-pulse flex justify-center mb-4">
                <div className="p-4 bg-indigo-900/30 rounded-full">
                  <div className="w-10 h-10 bg-indigo-500/50 rounded-full" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Activating Your Subscription</h2>
              <p className="text-indigo-200 mb-6">
                Please wait while we activate your subscription...
              </p>
            </div>
          ) : error ? (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-red-900/30 rounded-full">
                  <div className="w-10 h-10 text-red-400">❌</div>
                </div>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Something Went Wrong</h2>
              <p className="text-indigo-200 mb-6">
                {error}
              </p>
              <Link 
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-green-900/30 rounded-full">
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Payment Successful!</h2>
              <p className="text-indigo-200 mb-6">
                Your subscription has been activated successfully. You can now access all the features of your plan.
              </p>
              <Link 
                href="/upload"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
              >
                <span>Upload Your First PDF</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
