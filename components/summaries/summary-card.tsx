import Link from "next/link";
import { Card } from "../ui/card";
import DeleteButton from "./delete-button";
import { BookOpen, Clock, FileText } from "lucide-react";
import { cn, formatFileName } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
const StatusBadge = ({ status }: { status: string }) => {
  return (
    <span
      className={cn(
        "px-3 py-1.5 text-xs font-medium rounded-full capitalize flex items-center gap-1.5",
        status === "completed"
          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
          : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
      )}
    >
      <span className="relative flex h-2 w-2">
        <span className={cn(
          "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
          status === "completed" ? "bg-emerald-500" : "bg-amber-500"
        )}></span>
        <span className={cn(
          "relative inline-flex rounded-full h-2 w-2",
          status === "completed" ? "bg-emerald-500" : "bg-amber-500"
        )}></span>
      </span>
      {status}
    </span>
  );
};
export default function SummaryCard({ summary }: { summary: any }) {
  return (
    <Card className="group relative h-full overflow-hidden transition-all duration-300 hover:shadow-md dark:hover:shadow-indigo-900/20 border border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800/50">
      {}
      <div className="absolute top-3 right-3 z-10">
        <DeleteButton summaryId={summary.id} />
      </div>
      {}
      <Link href={`summaries/${summary.id}`} className="block p-5 h-full">
        <div className="flex flex-col h-full">
          {}
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white truncate">
                {summary.title || formatFileName(summary.original_file_url)}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formatDistanceToNow(new Date(summary.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          </div>
          {}
          <div className="flex-1">
            <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3 mb-4">
              {summary.summary_text}
            </p>
          </div>
          {}
          <div className="flex justify-between items-center mt-auto pt-3 border-t border-slate-100 dark:border-slate-800">
            <StatusBadge status={summary.status} />
            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform duration-300">
              View details →
            </span>
          </div>
        </div>
      </Link>
    </Card>
  );
}
