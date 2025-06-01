'use client';
import { ArrowRight, Sparkles, BookOpen } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
export default function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-indigo-950 text-white">
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      <div className="relative px-6 py-24 sm:py-32 lg:px-8 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-900/50 rounded-full mb-6">
          <BookOpen className="w-8 h-8 text-indigo-400" />
        </div>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl mb-6">
            Transform PDFs with{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">InsightPDF</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-indigo-200 max-w-2xl mx-auto">
            Extract key insights, generate concise summaries, and unlock the knowledge in your PDF documents with our AI-powered platform.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
            <SignedOut>
              <Link 
                href="/sign-up"
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg text-base font-medium transition-all duration-300 hover:scale-105"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </SignedOut>
            <SignedIn>
              <Link 
                href="/dashboard"
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg text-base font-medium transition-all duration-300 hover:scale-105"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </SignedIn>
            <Link
              href="#how-it-works"
              className="text-base font-medium text-indigo-300 hover:text-white transition-colors"
            >
              Learn more <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
