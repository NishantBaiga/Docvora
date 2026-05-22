// components/workspace/upload/upload-dropzone.tsx
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { useUploadThing } from "@/utils/uploadThing";
// import { useQueryClient } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { FileUp, File as FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onSuccess?: () => void;
}

type UploadStage =
  | "idle" // nothing happening
  | "uploading" // file going to UploadThing
  | "processing" // workspace/init running (chunking + embedding)
  | "done"; // redirecting

export default function UploadDropzone({ onSuccess }: Props) {
  const router = useRouter();
  //   const qc = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [stage, setStage] = useState<UploadStage>("idle");

  const { startUpload, isUploading } = useUploadThing("pdfUploader", {
    onUploadProgress: setProgress,
    onClientUploadComplete: async (res) => {
      const fileId = res?.[0]?.serverData?.fileId;
      // if (!fileId) return;
      //   qc.invalidateQueries({ queryKey: ["files"] });

      if (!fileId) {
        setError("Upload finished but no file ID returned.");
        setStage("idle");
        return;
      }

      setStage("processing");
      try {
        const initRes = await fetch("/api/workspace/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileId }),
        });

        if (!initRes.ok) {
          const msg = await initRes.text();
          throw new Error(msg || "Workspace init failed");
        }

        setStage("done");
        onSuccess?.();
        router.push(`/workspace/${fileId}`);
      } catch (error) {
        console.error("workspace init failed:", error);
        setError("PDF was uploaded but processing failed. Please try again.");
        setStage("idle");
      }

      // onSuccess?.();
      // router.push(`/workspace/${fileId}`);
    },
    onUploadError: (err) => setError(err.message),
  });

  const onDrop = useCallback((accepted: File[]) => {
    setFile(accepted[0] ?? null);
    setError(null);
    setStage("idle");
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
    maxSize: 32 * 1024 * 1024,
    disabled: isUploading,
  });

  async function handleUpload() {
    if (!file) return;
    setError(null);
    await startUpload([file]);
  }

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30",
          isUploading && "pointer-events-none opacity-60",
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          {file ? (
            <>
              <div className="p-3 bg-primary/10 rounded-full">
                <FileIcon className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-medium truncate max-w-[220px]">
                {file.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(1)} MB
              </p>
            </>
          ) : (
            <>
              <div className="p-3 bg-muted rounded-full">
                <FileUp className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm">
                <span className="font-medium text-primary">
                  Click to upload
                </span>{" "}
                or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">PDF up to 32 MB</p>
            </>
          )}
        </div>
      </div>

      {isUploading && (
        <div className="space-y-1.5">
          <Progress value={progress} className="h-1.5" />
          <p className="text-xs text-center text-muted-foreground">
            Uploading… {progress}%
          </p>
        </div>
      )}

      {error && <p className="text-xs text-destructive text-center">{error}</p>}

      {file && !isUploading && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setFile(null)}
          >
            Remove
          </Button>
          <Button size="sm" className="flex-1" onClick={handleUpload}>
            Upload
          </Button>
        </div>
      )}
    </div>
  );
}
