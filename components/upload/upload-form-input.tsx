"use client";
import { forwardRef, useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { FileText, Upload, X } from "lucide-react";
interface UploadFormInputProps {
  isLoading: boolean;
  disabled?: boolean;
  selectedFile?: File | null;
  onFileChange?: (file: File | null) => void;
}
export const UploadFormInput = forwardRef<HTMLInputElement, UploadFormInputProps>(
  ({ isLoading, disabled = false, selectedFile, onFileChange }, ref) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    // Update fileName when selectedFile changes
    useEffect(() => {
      if (selectedFile) {
        setFileName(selectedFile.name);
      } else {
        setFileName(null);
      }
    }, [selectedFile]);
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      onFileChange?.(file);
    };
    const handleRemoveFile = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onFileChange?.(null);
    };
    const handleClick = () => {
      if (!disabled && !isLoading) {
        fileInputRef.current?.click();
      }
    };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled && !isLoading) {
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
      if (disabled || isLoading) return;
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file.type === 'application/pdf') {
          onFileChange?.(file);
        } else {
          ;
        }
      }
    };
    return (
      <div
        className="w-full"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col gap-4">
          <div className="w-full">
            <div
              onClick={handleClick}
              className={cn(
                "relative flex flex-col items-center justify-center w-full h-32 px-4 transition-colors border-2 border-dashed rounded-lg cursor-pointer",
                isDragging
                  ? "border-indigo-400 bg-indigo-900/30"
                  : "border-slate-600 hover:border-indigo-500/50 hover:bg-indigo-900/20",
                (isLoading || disabled) && "opacity-50 cursor-not-allowed"
              )}
            >
              {fileName ? (
                <div className="flex flex-col items-center justify-center p-4 text-center">
                  <FileText className="w-8 h-8 mb-2 text-indigo-400" />
                  <p className="text-sm font-medium text-indigo-100 truncate max-w-xs">
                    {fileName}
                  </p>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="mt-2 p-1 rounded-full hover:bg-slate-700/50 text-slate-300 hover:text-white transition-colors"
                    disabled={isLoading || disabled}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-3 text-indigo-400" />
                  <p className="mb-2 text-sm text-indigo-100">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-indigo-300">PDF (MAX. 20MB)</p>
                </div>
              )}
              <input
                ref={(node) => {
                  if (node) {
                    if (typeof ref === 'function') {
                      ref(node);
                    } else if (ref) {
                      ref.current = node;
                    }
                    fileInputRef.current = node;
                  }
                }}
                id="file"
                type="file"
                name="file"
                accept="application/pdf"
                required
                className="hidden"
                disabled={isLoading || disabled}
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
);
UploadFormInput.displayName = 'UploadFormInput';
export default UploadFormInput;
