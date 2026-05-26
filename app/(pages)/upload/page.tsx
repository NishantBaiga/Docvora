// File: app/upload/page.tsx
"use client";
import  { useState } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { Progress } from "@/components/ui/progress";
import { useUploadThing } from "@/utils/uploadThing";

export default function UploadPage() {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);


  // DROPZONE
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      const f = acceptedFiles[0];
      if (!f) return;
      const objectUrl = URL.createObjectURL(f);
      setPreview(objectUrl);
      setFile(f);
      setUploadProgress(0);
    },
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  const { startUpload, isUploading } = useUploadThing("pdfUploader", {
    onUploadBegin: () => {
      setUploadProgress(0);
    },
    onClientUploadComplete: (res) => {
      console.log("UploadThing response:", res);
      if (res && res[0]) {
        router.push(`/workspace/${res[0].serverData.fileId}`);
      }
    },
    onUploadError: (err) => {
      console.error("upload error", err);
    },
    onUploadProgress: (p) => {
      setUploadProgress(p);
    },
  });

  const handleRemove = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFile(null);
  };

  const handleUploadAndAnalyze = async () => {
    if (!file) return;
    try {
      // start upload
      const uploadPromise = startUpload([file]);
      const res = await uploadPromise; // UploadThing response array   
      const uploadedUrl = res?.[0]?.ufsUrl;
      if (!uploadedUrl) throw new Error("Upload failed, no URL returned");
    } catch (err) {
      console.error(err);
    }
  };



  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 flex flex-col items-center">
      <div className="w-full max-w-2xl px-4">
        {/* Compact Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Upload PDF
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload to analyze in workspace
          </p>
        </div>

        {/* Compact Dropzone */}
        {!file && (
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
              transition-all duration-200 ease-in-out
              ${
                isDragActive
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              }
            `}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <div className="text-sm">
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  Click to upload
                </span>{" "}
                or drag and drop
              </div>
              <p className="text-xs text-gray-500">PDF (MAX. 32MB)</p>
            </div>
          </div>
        )}

        {/* Compact Preview Section */}
        {preview && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Preview Header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
              <div className="flex items-center space-x-2 truncate">
                <svg
                  className="w-4 h-4 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate max-w-[200px]">
                  {file?.name}
                </span>
              </div>
              <button
                onClick={handleRemove}
                disabled={isUploading}
                className="text-xs text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded transition-colors"
              >
                Remove
              </button>
            </div>

            {/* Small PDF Iframe */}
            <div className="h-[250px] bg-gray-100 dark:bg-gray-900 relative">
              <iframe
                src={`${preview}#toolbar=0&navpanes=0&scrollbar=0`}
                className="w-full h-full object-contain"
                title="Mini Preview"
              />
            </div>

            {/* Actions */}
            <div className="p-4 bg-white dark:bg-gray-800">
              {!isUploading ? (
                <button
                  onClick={handleUploadAndAnalyze}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors shadow-sm"
                >
                  Confirm Upload
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
