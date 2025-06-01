"use client";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect } from "react";
import { FileText, Upload, Zap, Check, Crown, ChevronRight, RotateCw } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
interface Summary {
  id: string;
  title: string;
  created_at: string;
  summary_text: string;
  file_name: string;
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
export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const {
    userPlan,
    usage,
    summaries,
    isLoading,
    error: contextError,
    fetchUserPlan,
    fetchUsage,
    fetchSummaries
  } = useAppContext();
  const handleRefresh = async () => {
    try {
      await Promise.all([
        fetchUserPlan(),
        fetchUsage(),
        fetchSummaries()
      ]);
    } catch (error) {
      ;
    }
  };
  // Show loading state until Clerk and initial data is loaded
  if (typeof window === 'undefined' || !isLoaded || (isLoading && !userPlan.planName)) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }
  // Function to refresh all data
  const refreshAllData = async () => {
    try {
      await Promise.all([
        fetchUserPlan(),
        fetchUsage(),
        fetchSummaries()
      ]);
    } catch (error) {
      ;
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {}
        <div className="mb-10 text-center relative">
          <button 
            onClick={refreshAllData}
            className="absolute top-0 right-0 p-2 text-gray-500 hover:text-indigo-600 transition-colors"
            title="Refresh data"
          >
            <RotateCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Welcome back, {user?.firstName || 'User'}
          </h1>
          <p className="mt-3 text-lg text-gray-600">Here's what's happening with your documents</p>
        </div>
        {}
        <div className={`bg-white rounded-2xl shadow-xl overflow-hidden mb-8 transition-all duration-300 hover:shadow-2xl ${
          userPlan.isPro ? 'border-2 border-purple-200' : 
          userPlan.isBasic ? 'border-2 border-blue-200' : 
          'border border-gray-200'
        }`}>
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Your Plan: {userPlan.planName}
                  </h2>
                  {userPlan.isPro ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800">
                      <Crown className="h-3.5 w-3.5 mr-1" />
                      Pro Member
                    </span>
                  ) : userPlan.isBasic ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Basic Plan
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Free Plan
                    </span>
                  )}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    userPlan.isActive ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></div>
                  {userPlan.isActive ? 'Active' : 'Inactive'}
                  {userPlan.status && userPlan.status !== 'active' && (
                    <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {userPlan.status}
                    </span>
                  )}
                </div>
              </div>
              {!userPlan.isPro && (
                <Link 
                  href="/pricing"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                >
                  Upgrade Plan
                </Link>
              )}
            </div>
            <div className="mt-8">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium text-gray-900">Monthly Usage</h3>
                <span className="text-sm font-medium text-gray-600">
                  {usage.isLoading ? (
                    <span className="inline-block h-4 w-16 bg-gray-200 rounded animate-pulse"></span>
                  ) : usage.error ? (
                    <span className="text-red-500 text-xs">Error loading usage</span>
                  ) : (
                    <>
                      {usage.used} of {userPlan.isPro ? '25' : usage.total} documents
                      <span className="block text-xs text-gray-500 mt-1">
                        Resets on {new Date(usage.resetDate).toLocaleDateString()}
                      </span>
                    </>
                  )}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                {usage.isLoading ? (
                  <div className="h-full bg-gray-200 animate-pulse"></div>
                ) : usage.error ? (
                  <div className="h-full bg-red-100"></div>
                ) : userPlan.isPro ? (
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-600"
                    style={{
                      width: '100%',
                      backgroundImage: 'linear-gradient(90deg, #8b5cf6 0%, #6366f1 100%)',
                      boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)'
                    }}
                  ></div>
                ) : (
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                    style={{
                      width: `${Math.min(100, (usage.used / usage.total) * 100)}%`,
                      transition: 'width 0.5s ease-in-out'
                    }}
                  ></div>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {usage.remaining} documents remaining this month
              </p>
            </div>
            <div className="space-y-2 mt-4">
              <div className="flex items-center text-sm text-gray-700">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                {userPlan.features[0]}
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                {userPlan.features[1]}
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                {userPlan.features[2]}
              </div>
            </div>
            <Link 
              href="/pricing" 
              className="mt-6 inline-flex items-center justify-center w-full px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <Zap className="h-4 w-4 mr-2" />
              {userPlan.isPro ? 'Manage Subscription' : 'Upgrade to Pro'}
            </Link>
          </div>
        </div>
        {}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link 
            href="/upload" 
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow flex items-center"
          >
            <div className="bg-indigo-100 p-3 rounded-lg mr-4">
              <Upload className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-medium">Upload PDF</h3>
              <p className="text-sm text-gray-500">Add a new document</p>
            </div>
          </Link>
          <Link 
            href="/summaries" 
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow flex items-center"
          >
            <div className="bg-indigo-100 p-3 rounded-lg mr-4">
              <FileText className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-medium">View Summaries</h3>
              <p className="text-sm text-gray-500">See all your documents</p>
            </div>
          </Link>
        </div>
        {}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Your Plan</h2>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center text-sm text-gray-600 hover:text-indigo-600 disabled:opacity-50 transition-colors bg-transparent hover:bg-transparent focus:outline-none focus:ring-0 p-2 rounded-md"
                title="Refresh data"
              >
                <RotateCw className={`h-4 w-4 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <Link
                href="/pricing"
                className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Manage plan <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
          {summaries.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {summaries.map((summary) => (
                <Link 
                  key={summary.id} 
                  href={`/summaries/${summary.id}`}
                  className="group block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-indigo-100"
                >
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {summary.title || 'Untitled Document'}
                    </h3>
                    <div className="ml-2 flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                        <FileText className="h-5 w-5 text-indigo-600" />
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-gray-600 line-clamp-3 text-sm leading-relaxed">
                    {summary.summary_text?.substring(0, 200) || 'No summary available'}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {summary.file_name?.split('.').pop()?.toUpperCase() || 'PDF'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(summary.created_at || new Date()).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-200 hover:border-indigo-300 transition-colors">
              <div className="mx-auto h-16 w-16 text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-full h-full">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No summaries yet</h3>
              <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">
                Upload a PDF to generate AI-powered summaries and insights.
              </p>
              <div className="mt-6">
                <Link
                  href="/upload"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:-translate-y-0.5"
                >
                  <Upload className="-ml-1 mr-2 h-5 w-5" />
                  Upload PDF
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
