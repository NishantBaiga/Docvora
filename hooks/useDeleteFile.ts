"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DeleteDocument } from "@/app/(server)/actions/deleteDocument";

export function useDeleteDocument() {
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  function handleDelete(fileId: string) {
    startTransition(async () => {
      try {
        setError(null);
        setDeletingId(fileId);

        await DeleteDocument(fileId);

        router.refresh();
      } catch (err) {
        setError("Something went wrong");
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