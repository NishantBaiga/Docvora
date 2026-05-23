"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DeleteDocument } from "@/app/(server)/actions/deleteDocument";

type DeleteError = "unauthorized" | "not_found" | "unknown";

export function useDeleteDocument(onRefetch?: () => void) {
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
        // Navigate away if user deleted the currently open file
        if (currentFileId === fileId) {
          router.push("/workspace");
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
