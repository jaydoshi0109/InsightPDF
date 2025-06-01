'use client';
import { cn } from "@/lib/utils";
import { ArrowRight, CheckIcon, CrownIcon, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { pricingPlans } from "@/utils/constants";
import { useAuth } from "@clerk/nextjs";
import type { PricingPlan } from "@/types/index";
import DebugEnv from "@/components/DebugEnv";
type PriceType = {
  name: string;
  price: number;
  description: string;
  items: string[];
  id: string;
  paymentLink: string;
  priceId: string;
  mostPopular?: boolean;
  cta?: string;
};
const PricingCard = ({
  name,
  price,
  description,
  items,
  id,
  priceId,
  mostPopular = false,
  cta = 'Get Started'
}: PriceType) => {
  const [isLoading, setIsLoading] = useState(false);
  const { isLoaded, userId } = useAuth();
  const isPro = id === "pro";
  const handleSubscribe = async () => {
    ;
    ;
    if (!isLoaded) {
      ;
      return;
    }
    if (!userId) {
      ;
      const currentUrl = encodeURIComponent(window.location.href);
      const signInUrl = `/sign-in?redirect_url=${currentUrl}`;
      ;
      window.location.href = signInUrl;
      return;
    }
    try {
      setIsLoading(true);
      ;
      // Log all available plans for debugging
      ;
      // Use the payment link directly from the pricing plan
      const plan = pricingPlans.find(p => p.id === id);
      ;
      if (!plan) {
        throw new Error(`Plan with ID '${id}' not found`);
      }
      if (!plan.paymentLink) {
        ;
        throw new Error('Payment link not found for this plan');
      }
      ;
      window.location.href = plan.paymentLink;
    } catch (error: any) {
      ;
      // Show a more user-friendly error message
      let errorMessage = 'Failed to start checkout. Please try again.';
      if (error.message) {
        errorMessage = error.message;
      }
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="relative w-full max-w-md group transition-all duration-300">
      {}
      {mostPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-900 text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
          MOST POPULAR
        </div>
      )}
      {}
      {isPro && (
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
      )}
      <div className={cn(
        "relative flex flex-col h-full z-10 p-8 rounded-xl backdrop-blur-sm overflow-hidden",
        isPro 
          ? "bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 border border-indigo-500/30" 
          : "bg-white/95 border border-slate-200 dark:bg-slate-800/95 dark:border-slate-700/50"
      )}>
        {mostPopular && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/10 to-transparent rounded-full -mr-16 -mt-16"></div>
        )}
        {}
        <div className="relative z-10 flex items-center gap-3 mb-6">
          <div className={cn(
            "p-2.5 rounded-xl",
            isPro 
              ? "bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/20" 
              : "bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20"
          )}>
            {isPro ? (
              <CrownIcon className="w-6 h-6 text-amber-300" />
            ) : (
              <Sparkles className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <h3 className={cn(
              "text-2xl font-bold tracking-tight",
              isPro ? "text-white" : "text-slate-900 dark:text-white"
            )}>
              {name}
            </h3>
            <p className={cn(
              "text-sm mt-1",
              isPro ? "text-indigo-200" : "text-slate-600 dark:text-slate-300"
            )}>
              {description}
            </p>
          </div>
        </div>
        {}
        <div className={cn(
          "relative z-10 flex items-baseline mb-8",
          isPro ? "text-white" : "text-slate-900 dark:text-white"
        )}>
          <span className="text-5xl font-bold">${price}</span>
          <span className={cn(
            "text-base ml-2 font-medium",
            isPro ? "text-indigo-200" : "text-slate-600 dark:text-slate-300"
          )}>/month</span>
          {isPro && (
            <span className="ml-auto px-3 py-1 text-xs font-medium bg-indigo-900/50 text-indigo-100 rounded-full">
              Save 35%
            </span>
          )}
        </div>
        {}
        <ul className="space-y-3 mb-8 relative z-10">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3 group">
              <div className={cn(
                "flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center",
                isPro 
                  ? "bg-indigo-900/50 text-indigo-300 group-hover:bg-indigo-800/70 transition-colors"
                  : "bg-blue-100 text-blue-600 dark:bg-slate-700/50 dark:text-blue-400"
              )}>
                <CheckIcon className="w-3 h-3" />
              </div>
              <span className={cn(
                "text-sm leading-relaxed",
                isPro 
                  ? "text-indigo-100 group-hover:text-white transition-colors" 
                  : "text-slate-700 dark:text-slate-300"
              )}>
                {item}
              </span>
            </li>
          ))}
        </ul>
        {}
        <div className="mt-auto relative z-10">
          <button
            onClick={handleSubscribe}
            disabled={isLoading || !isLoaded}
            className={cn(
              "w-full py-3.5 px-6 rounded-xl font-semibold transition-all transform hover:-translate-y-0.5",
              isPro 
                ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40"
                : "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40",
              "flex items-center justify-center gap-2",
              (isLoading || !isLoaded) && "opacity-70 cursor-not-allowed"
            )}
          >
            {isLoading ? (
              'Processing...'
            ) : (
              <>
                {cta || 'Get Started'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
          {isPro && (
            <p className="mt-3 text-center text-xs text-indigo-200/80">
              No credit card required. Cancel anytime.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
export default function PricingSection() {
  const { isLoaded, isSignedIn } = useAuth();
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  if (!isClient) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  return (
    <>
      <DebugEnv />
      <section
        id="pricing"
        className="relative py-20 sm:py-24 lg:py-32 overflow-hidden min-h-[80vh]"
      >
      {}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-30" />
      </div>
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        {}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl mb-4">
            Choose Your Perfect Plan
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Unlock the full potential of InsightPDF with our flexible pricing options designed to fit your needs.
          </p>
        </div>
        {}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan) => (
            <PricingCard key={plan.id} {...plan} />
          ))}
        </div>
        {}
        <div className="mt-12 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            All plans include a 14-day money-back guarantee. No questions asked.
          </p>
        </div>
      </div>
    </section>
    </>
  );
}
