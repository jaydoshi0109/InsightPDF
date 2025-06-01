import Link from "next/link";
import { BookOpen, Github, Twitter } from "lucide-react";
export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-indigo-900/50 rounded-lg">
                <BookOpen className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                InsightPDF
              </span>
            </div>
            <p className="text-slate-400 text-sm max-w-md">
              Extract key insights, generate concise summaries, and unlock the knowledge in your PDF documents with our AI-powered platform.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="https://twitter.com" className="text-slate-400 hover:text-indigo-400 transition-colors" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://github.com" className="text-slate-400 hover:text-indigo-400 transition-colors" aria-label="GitHub">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
          {}
          <div>
            <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-4">Product</h3>
            <ul className="space-y-3">
              <li><Link href="/#features" className="text-slate-400 hover:text-white transition-colors text-sm">Features</Link></li>
              <li><Link href="/#pricing" className="text-slate-400 hover:text-white transition-colors text-sm">Pricing</Link></li>
              <li><Link href="/#faq" className="text-slate-400 hover:text-white transition-colors text-sm">FAQ</Link></li>
            </ul>
          </div>
          {}
          <div>
            <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><Link href="/privacy" className="text-slate-400 hover:text-white transition-colors text-sm">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-slate-400 hover:text-white transition-colors text-sm">Terms of Service</Link></li>
              <li><Link href="/contact" className="text-slate-400 hover:text-white transition-colors text-sm">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-800">
          <p className="text-center text-slate-500 text-sm">
            © {new Date().getFullYear()} InsightPDF. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
