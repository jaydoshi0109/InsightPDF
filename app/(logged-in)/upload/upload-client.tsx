"use client";
import { FileText, Upload, Crown, Sparkles, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import UploadForm from "@/components/upload/upload-form";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
interface UploadClientProps {
  isPro: boolean;
  isBasic: boolean;
  isActive: boolean;
  planName: string;
}
export default function UploadClient({ isPro, isBasic, isActive, planName }: UploadClientProps) {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const userPlan = { isPro, isBasic, isActive, planName };
  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-3 bg-indigo-900/50 rounded-full mb-4">
              <Upload className="w-8 h-8 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">Upload Your PDF</h1>
            <p className="text-indigo-200 max-w-lg mx-auto">
              Transform your PDF documents into concise, actionable insights with our AI-powered analysis.
            </p>
            <div className="mt-3">
              {!userPlan.isActive ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-900/30 border border-amber-800/50 rounded-lg text-amber-300 text-sm">
                  <Lock className="w-4 h-4" />
                  <span>Your {planName} plan is not active. Please check your subscription status.</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-900/30 border border-green-800/50 rounded-lg text-green-300 text-sm">
                  <span>Active Plan: <span className="font-medium">{planName}</span></span>
                  {isPro && <Crown className="w-4 h-4 text-yellow-400" />}
                </div>
              )}
            </div>
          </div>
          {}
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-900/50 rounded-lg">
                <FileText className="w-5 h-5 text-indigo-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">Select PDF File</h2>
            </div>
            <UploadForm userPlan={userPlan} />
            <div className="mt-6 pt-6 border-t border-slate-700">
              <h3 className="text-sm font-medium text-white mb-3">Supported Features:</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <li className="flex items-center gap-2 text-indigo-200 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                  <span>AI-powered summarization</span>
                </li>
                <li className="flex items-center gap-2 text-indigo-200 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                  <span>Key insights extraction</span>
                </li>
                <li className="flex items-center gap-2 text-indigo-200 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                  <span>Multiple export formats</span>
                </li>
                <li className="flex items-center gap-2 text-indigo-200 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                  <span>Secure document handling</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
