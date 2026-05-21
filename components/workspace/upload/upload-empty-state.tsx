// components/workspace/upload/empty-state.tsx
"use client";

import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import UploadDropzone from "./upload-dropzone";

export default function EmptyState() {
  return (
    <div className="flex items-center justify-center h-full bg-background">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md px-6 text-center space-y-6"
      >
        <div className="flex justify-center">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="p-5 bg-primary/8 rounded-2xl"
          >
            <FileText className="h-12 w-12 text-primary/70" />
          </motion.div>
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl font-semibold tracking-tight">
            Chat with your PDFs
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Upload a PDF and start asking questions. Get instant answers,
            summaries, and insights.
          </p>
        </div>

        <UploadDropzone />
      </motion.div>
    </div>
  );
}