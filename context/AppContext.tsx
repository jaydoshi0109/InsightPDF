"use client";
import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
interface Summary {
  id: string;
  title: string;
  fileName: string;
  summaryText: string;
  fileUrl: string;
  createdAt: string;
  updatedAt: string;
  summary_text?: string;
  file_name?: string;
  created_at?: string;
  updated_at?: string;
  file_url?: string;
}
interface UserPlan {
  isPro: boolean;
  isBasic: boolean;
  planName: 'Free' | 'Basic' | 'Pro';
  isActive: boolean;
  status?: string;
  features: string[];
}
interface UsageData {
  used: number;
  total: number;
  remaining: number;
  resetDate: string;
  isLoading: boolean;
  error: string | null;
}
interface AppContextType {
  summaries: Summary[];
  userPlan: UserPlan;
  usage: UsageData;
  fetchSummaries: () => Promise<Summary[]>;
  fetchUserPlan: () => Promise<UserPlan>;
  fetchUsage: () => Promise<UsageData>;
  isLoading: boolean;
  error: string | null;
}
const defaultPlan: UserPlan = {
  isPro: false,
  isBasic: false,
  planName: 'Free',
  isActive: false,
  status: 'inactive',
  features: [
    '3 documents/month',
    'Basic document processing',
    'Community support'
  ]
};
// Default usage for Free plan
const defaultUsage: UsageData = {
  used: 0,
  total: 3,  // Free plan gets 3 PDFs/month
  remaining: 3,
  resetDate: new Date().toISOString(),
  isLoading: true,
  error: null
};
const AppContext = createContext<AppContextType | undefined>(undefined);
export function AppProvider({ children }: { children: ReactNode }) {
  const { user, isLoaded } = useUser();
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [userPlan, setUserPlan] = useState<UserPlan>(defaultPlan);
  const [usage, setUsage] = useState<UsageData>(defaultUsage);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchSummaries = async (): Promise<Summary[]> => {
    try {
      const response = await fetch('/api/summaries');
      if (!response.ok) throw new Error('Failed to fetch summaries');
      const data = await response.json();
      const formattedSummaries = (data.summaries || []).map((summary: any) => ({
        id: summary.id,
        title: summary.title || 'Untitled Document',
        summary_text: summary.summary_text || summary.summaryText || '',
        created_at: summary.created_at || summary.createdAt || new Date().toISOString(),
        file_name: summary.file_name || summary.fileName || 'document.pdf',
        file_url: summary.file_url || summary.fileUrl || ''
      }));
      setSummaries(formattedSummaries);
      return formattedSummaries;
    } catch (err) {
      ;
      setError('Failed to load summaries');
      throw err;
    }
  };
  const fetchUserPlan = async (): Promise<UserPlan> => {
    try {
      ;
      const response = await fetch('/api/user/plan', {
        cache: 'no-store', // Prevent caching
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      if (!response.ok) {
        const errorText = await response.text();
        ;
        throw new Error(`Failed to fetch user plan: ${response.status} ${errorText}`);
      }
      const planData = await response.json();
      ;
      // If subscription is cancelled, treat as Free plan
      const isActive = planData.isActive && planData.status !== 'cancelled';
      let isPro = false;
      let isBasic = false;
      let planName: 'Free' | 'Basic' | 'Pro' = 'Free';
      let features: string[] = [];
      if (isActive) {
        isPro = planData.plan === 'pro';
        isBasic = planData.plan === 'basic';
        planName = isPro ? 'Pro' : isBasic ? 'Basic' : 'Free';
      }
      // Define plan features based on the active plan
      if (isPro) {
        features = [
          '25 documents/month',
          'AI-powered summaries',
          'Priority support',
          'Advanced analytics',
          'Team collaboration'
        ];
      } else if (isBasic) {
        features = [
          '10 documents/month',
          'Basic summaries',
          'Email support',
          'Basic analytics'
        ];
      } else {
        // Free plan features (or inactive subscription)
        features = [
          '3 documents/month',
          'Basic features',
          'Community support'
        ];
      }
      const newPlan: UserPlan = {
        isPro,
        isBasic,
        planName,
        isActive,
        status: planData.status || 'inactive',
        features
      };
      ; // Debug log
      setUserPlan(newPlan);
      return newPlan;
    } catch (err) {
      ;
      setError('Failed to load user plan');
      throw err;
    }
  };
  const fetchUsage = async (): Promise<UsageData> => {
    try {
      setUsage(prev => ({ ...prev, isLoading: true }));
      // Always fetch the latest plan status to ensure we have the most up-to-date information
      const currentPlan = await fetchUserPlan();
      // For Pro users, show their usage against the 25 document limit
      if (currentPlan.isPro && currentPlan.isActive) {
        const response = await fetch('/api/user/usage', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch usage data');
        }
        const data = await response.json();
        const proUsage = {
          used: data.used || 0,
          total: 25,  // Pro plan has a 25 document limit
          remaining: Math.max(0, 25 - (data.used || 0)),
          resetDate: data.resetDate || new Date().toISOString(),
          isLoading: false,
          error: null
        };
        setUsage(proUsage);
        return proUsage;
      }
      const response = await fetch('/api/user/usage', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch usage data');
      }
      const data = await response.json();
      // Determine the correct limits based on the current plan
      const planLimits = {
        isPro: 25,
        isBasic: 10,
        isFree: 3
      };
      const totalLimit = currentPlan.isPro && currentPlan.isActive ? planLimits.isPro :
                        currentPlan.isBasic && currentPlan.isActive ? planLimits.isBasic :
                        planLimits.isFree;
      const newUsage = {
        used: Math.min(data.used, totalLimit), // Cap used at the plan limit
        total: totalLimit,
        remaining: Math.max(0, totalLimit - Math.min(data.used, totalLimit)),
        resetDate: data.resetDate,
        isLoading: false,
        error: null
      };
      setUsage(newUsage);
      return newUsage;
    } catch (err) {
      ;
      const errorState = {
        ...defaultUsage,
        isLoading: false,
        error: 'Failed to load usage data'
      };
      setUsage(errorState);
      throw err;
    }
  };
  // Initial data loading
  useEffect(() => {
    if (!isLoaded) return;
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchSummaries(),
          fetchUserPlan().then(plan => {
            if (plan && !plan.isPro) {
              return fetchUsage();
            }
            return null;
          })
        ]);
      } catch (err) {
        ;
        setError('Failed to load application data');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [isLoaded]);
  return (
    <AppContext.Provider 
      value={{
        summaries,
        userPlan,
        usage,
        fetchSummaries,
        fetchUserPlan,
        fetchUsage,
        isLoading,
        error
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
