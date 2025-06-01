"use client";
import { z } from "zod";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Crown, Sparkles, Lock, FileUp, Loader2, X, Upload } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import UploadFormInput from "./upload-form-input";
import { useUploadThing } from "@/utils/uploadthing";
import { generatePdfSummary, storePdfSummaryAction } from "@/actions/upload-actions";
// Define the UserPlan interface
export interface UserPlan {
  isPro: boolean;
  isBasic: boolean;
  isActive: boolean;
  planName: string;
}
const schema = z.object({
  file: z
    .instanceof(File, { message: "Invalid file" })
    .refine(
      (file: File) => file.size <= 20 * 1024 * 1024,
      "File size must be less than 20MB"
    )
    .refine(
      (file: File) => file.type.startsWith("application/pdf"),
      "File must be a PDF"
    ),
});
interface UploadFormProps {
  userPlan: UserPlan;
}
export default function UploadForm({ userPlan }: UploadFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { startUpload } = useUploadThing("pdfUploader");
  // Check if user is authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
    }
  }, [user, isLoaded, router]);
  // Show loading state while auth is being checked
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      router.push("/sign-in");
      return;
    }
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }
    // Check subscription status
    if (!userPlan.isActive) {
      toast.error("Your subscription is not active. Please check your subscription status.");
      return;
    }
    // Check if user has a paid plan
    if (!userPlan.isPro && !userPlan.isBasic) {
      toast.error("Please upgrade to a paid plan to upload PDFs");
      return;
    }
    // Validate file
    const validation = schema.safeParse({ file: selectedFile });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }
    setIsLoading(true);
    try {
      // Upload file
      const uploadedFiles = await startUpload([selectedFile]);
      if (!uploadedFiles || uploadedFiles.length === 0) {
        throw new Error("Failed to upload file. Please try again.");
      }
      const fileUrl = uploadedFiles[0].url;
      const fileName = uploadedFiles[0].name;
      // Show uploading toast
      const toastId = toast.loading("Processing your PDF...");
      try {
        // Generate summary
        const summaryResponse = await generatePdfSummary([{
          serverData: {
            userId: user.id,
            file: {
              url: fileUrl,
              name: fileName
            }
          }
        }]);
        if (!summaryResponse.success || !summaryResponse.data) {
          throw new Error(summaryResponse.message || "Failed to generate summary");
        }
        // Store summary in database
        await storePdfSummaryAction({
          fileUrl,
          fileName,
          summary: summaryResponse.data.summary,
          title: summaryResponse.data.title || fileName.replace(/\.[^/.]+$/, ""),
        });
        toast.success("PDF processed successfully!");
        router.push("/dashboard");
      } catch (error) {
        ;
        throw error; // Re-throw to be caught by outer catch
      } finally {
        toast.dismiss(toastId);
      }
    } catch (error) {
      ;
      const errorMessage = error instanceof Error ? error.message : "Failed to process file";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading && !isDragging) {
      setIsDragging(true);
    }
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isLoading || !e.dataTransfer.files || e.dataTransfer.files.length === 0) {
      return;
    }
    const file = e.dataTransfer.files[0];
    if (file.type === 'application/pdf') {
      handleFileChange(file);
    } else {
      toast.error("Please upload a valid PDF file");
    }
  };
  return (
    <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto">
      {}
      <div className="w-full flex justify-center mb-2">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${userPlan.isPro ? 'bg-violet-900/50' : userPlan.isBasic ? 'bg-blue-900/50' : 'bg-slate-800/50'}`}>
          {userPlan.isPro && <Crown className="w-5 h-5 text-amber-300" />}
          {userPlan.isBasic && <Sparkles className="w-5 h-5 text-sky-300" />}
          {!userPlan.isPro && !userPlan.isBasic && <Lock className="w-5 h-5 text-slate-400" />}
          <span className={`text-sm font-medium ${userPlan.isPro ? 'text-amber-300' : userPlan.isBasic ? 'text-sky-300' : 'text-slate-400'}`}>
            {userPlan.planName} Plan
          </span>
        </div>
      </div>
      {}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-xl p-6 transition-colors relative",
          isDragging 
            ? "border-indigo-500 bg-indigo-900/10" 
            : "border-slate-700 bg-slate-800/30",
          (isLoading || (!userPlan.isPro && !userPlan.isBasic)) && "opacity-70"
        )}
      >
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          <UploadFormInput 
            isLoading={isLoading} 
            disabled={!userPlan.isActive || (!userPlan.isPro && !userPlan.isBasic)}
            selectedFile={selectedFile}
            onFileChange={handleFileChange}
          />
          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              className={cn(
                "w-full bg-indigo-600 hover:bg-indigo-700 text-white",
                "transition-colors duration-200 flex items-center justify-center gap-2",
                (isLoading || !userPlan.isActive || (!userPlan.isPro && !userPlan.isBasic)) && "opacity-50 cursor-not-allowed"
              )}
              disabled={isLoading || !userPlan.isActive || (!userPlan.isPro && !userPlan.isBasic)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <FileUp className="w-5 h-5" />
                  <span>Generate Summary</span>
                </>
              )}
            </Button>
            {!userPlan.isActive ? (
              <div className="w-full px-4 py-2 bg-amber-900/20 border border-amber-800/50 rounded-lg text-center">
                <p className="text-sm text-amber-300">
                  <Lock className="inline w-3.5 h-3.5 mr-1.5 -mt-1" />
                  Your {userPlan.planName} plan is not active
                </p>
              </div>
            ) : !userPlan.isPro && !userPlan.isBasic ? (
              <div className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-center">
                <p className="text-sm text-amber-300">
                  <Lock className="inline w-3.5 h-3.5 mr-1.5 -mt-1" />
                  Upgrade to a paid plan to upload PDFs
                </p>
              </div>
            ) : null}
          </div>
        </form>
        {isDragging && (
          <div className="absolute inset-0 bg-indigo-900/20 backdrop-blur-sm rounded-xl flex items-center justify-center pointer-events-none">
            <div className="bg-white/90 dark:bg-slate-900/90 p-6 rounded-lg shadow-xl border border-indigo-300 dark:border-indigo-500">
              <div className="flex flex-col items-center">
                <Upload className="w-12 h-12 text-indigo-500 mb-2" />
                <p className="text-lg font-medium text-slate-800 dark:text-white">Drop your PDF here</p>
                <p className="text-sm text-slate-500 dark:text-slate-300">We'll take care of the rest</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
