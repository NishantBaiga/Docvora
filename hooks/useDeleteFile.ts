"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DeleteDocument } from "@/app/(server)/actions/deleteDocument";
import { FileRecord } from "@/types/type.pdf";

type DeleteError = "unauthorized" | "not_found" | "unknown";

export function useDeleteDocument(onRefetch?: () => void, files?: FileRecord[]) {
  const router = useRouter();
  const [error, setError] = useState<DeleteError | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete(fileId: string, currentFileId?: string) {
    startTransition(async () => {
      try {
        setError(null);
        setDeletingId(fileId);

        await DeleteDocument(fileId);
        // Re-fetch file list so sidebar updates immediately
        onRefetch?.();
         // Only navigate if user deleted the currently open file
        if (currentFileId === fileId) {
          // Find next file to navigate to — exclude deleted one
          const remaining = files?.filter((f) => f.id !== fileId) ?? [];

          if (remaining.length > 0) {
            // Navigate to most recent remaining file
            router.push(`/workspace/${remaining[0].id}`);
          } else {
            // No files left — go to empty state
            router.push("/workspace");
          }
        }
      } catch (err) {
        if (err instanceof Error) {
          if (err.message === "Unauthorized") setError("unauthorized");
          else if (err.message === "Document not found") setError("not_found");
          else setError("unknown");
        } else {
          setError("unknown");
        }
      } finally {
        setDeletingId(null);
      }
    });
  }

  return {
    handleDelete,
    deletingId,
    isPending,
    error,
  };
}
