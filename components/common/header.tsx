"use client";
import { FileText, BookOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton, useAuth } from "@clerk/nextjs";
import ClientPlanBadge from "./client-plan-badge";
const AuthButtons = () => {
  const pathname = usePathname();
  // Only set redirect URL if we're not already on an auth page
  const redirectUrl = pathname && !pathname.startsWith('/sign-') ? pathname : '/';
  return (
    <div className="flex items-center gap-3">
      <Link 
        href={`/sign-in${redirectUrl ? `?redirect_url=${encodeURIComponent(redirectUrl)}` : ''}`}
        className="text-slate-300 hover:text-white transition-colors text-sm font-medium"
      >
        Sign In
      </Link>
      <Link 
        href={`/sign-up${redirectUrl ? `?redirect_url=${encodeURIComponent(redirectUrl)}` : ''}`}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        Get Started
      </Link>
    </div>
  );
};
const UserMenu = () => {
  const { isSignedIn } = useAuth();
  if (!isSignedIn) return null;
  return (
    <div className="flex items-center gap-3">
      <Link 
        href="/upload"
        className="hidden md:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        <FileText className="w-4 h-4" />
        <span>Upload PDF</span>
      </Link>
      <ClientPlanBadge />
      <UserButton afterSignOutUrl="/" />
    </div>
  );
};
const Navigation = () => {
  const { isSignedIn } = useAuth();
  const pathname = usePathname();
  // Don't show navigation on auth pages
  if (pathname.startsWith('/sign-')) {
    return null;
  }
  return (
    <div className="hidden md:flex items-center gap-8">
      <Link href="/#features" className="text-slate-300 hover:text-white transition-colors">
        Features
      </Link>
      <Link href="/pricing" className="text-slate-300 hover:text-white transition-colors">
        Pricing
      </Link>
      {isSignedIn && (
        <Link href="/dashboard" className="text-slate-300 hover:text-white transition-colors">
          Dashboard
        </Link>
      )}
    </div>
  );
};
export default function Header() {
  const pathname = usePathname();
  // Don't show header on auth pages
  if (pathname.startsWith('/sign-')) {
    return null;
  }
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        {}
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-2 rounded-lg">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-white hidden sm:inline">
            InsightPDF
          </span>
        </Link>
        {}
        <Navigation />
        {}
        <div className="flex items-center gap-4">
          <SignedIn>
            <UserMenu />
          </SignedIn>
          <SignedOut>
            <AuthButtons />
          </SignedOut>
        </div>
      </nav>
    </header>
  );
}
