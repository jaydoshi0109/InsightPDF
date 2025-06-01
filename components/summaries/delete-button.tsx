"use client";
import { Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useState, useTransition } from "react";
import { deleteSummaryAction } from "@/actions/summary-action";
import { toast } from "sonner";
interface DeleteButtonProps {
  summaryId: string;
}
export default function DeleteButton({ summaryId }: DeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const handleDelete = async () => {
    startTransition(async () => {
      const result = await deleteSummaryAction({ summaryId });
      if (result?.success) {
        toast.success("Summary deleted successfully");
      } else {
        toast.error("Error", {
          description: "Failed to delete summary",
        });
      }
      setOpen(false);
    });
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={"ghost"}
          size="icon"
          className="text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full p-2 h-auto w-auto transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md border-slate-200 dark:border-slate-700 dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle className="text-center text-slate-900 dark:text-white">Delete Summary</DialogTitle>
          <DialogDescription className="text-center text-slate-600 dark:text-slate-400 mt-2">
            This action cannot be undone. This will permanently delete the summary from your account.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center my-4">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
            <Trash2 className="w-6 h-6 text-red-500 dark:text-red-400" />
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-2 mt-4">
          <Button
            variant={"outline"}
            onClick={() => setOpen(false)}
            disabled={isPending}
            className="w-full sm:w-auto border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isPending}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
          >
            {isPending ? "Deleting..." : "Delete Summary"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
