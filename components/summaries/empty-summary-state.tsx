import { FileUp, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
export default function EmptySummaryState() {
  return (
    <div className="flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="flex justify-center">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
              <FileText className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <h2 className="mt-6 text-xl font-bold text-center text-slate-900 dark:text-white">
            No Summaries Yet
          </h2>
          <p className="mt-3 text-center text-slate-600 dark:text-slate-300">
            Upload your first PDF to get started with AI-powered insights and summaries.
          </p>
          <div className="mt-8">
            <Link href="/upload" className="block w-full">
              <Button
                className="w-full py-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02]"
              >
                <FileUp className="w-5 h-5" />
                <span>Upload Your First PDF</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-xs text-center text-slate-500 dark:text-slate-400">
            Transform your documents into actionable insights with InsightPDF.
          </p>
        </div>
      </div>
    </div>
  );
}