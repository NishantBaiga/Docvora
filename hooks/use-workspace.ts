"use client";

import { useEffect, useRef, useState } from "react";

type ProcessingStatus = "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";
type HookStatus = "idle" | "loading" | "ready" | "error";

type UseWorkspaceReturn = {
  status: HookStatus;
  processingStatus: ProcessingStatus | null;
  loading: boolean;
  error: string | null;
};

// Poll every 3 seconds while processing
const POLL_INTERVAL = 3000;

export function useWorkspace(fileId: string | null): UseWorkspaceReturn {
  const [status, setStatus] = useState<HookStatus>("idle");
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Store interval ref so we can clear it
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  function clearPolling() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  async function checkStatus() {
    if (!fileId) return;

    try {
      const res = await fetch(`/api/file/status?fileId=${fileId}`);
      if (!res.ok) throw new Error("Failed to check status");

      const data = await res.json();
      const dbStatus: ProcessingStatus = data.status;

      setProcessingStatus(dbStatus);

      if (dbStatus === "SUCCESS") {
        // Processing complete — stop polling and unlock chat
        setStatus("ready");
        clearPolling();
        return;
      }

      if (dbStatus === "FAILED") {
        // Processing failed — stop polling and show error
        setStatus("error");
        setError("Document processing failed. Please try deleting and re-uploading.");
        clearPolling();
        return;
      }

      // PENDING or PROCESSING — keep polling
      setStatus("loading");

    } catch (err) {
      console.error("Status check failed:", err);
      setStatus("error");
      setError("Failed to check processing status.");
      clearPolling();
    }
  }

  useEffect(() => {
    if (!fileId) {
      setStatus("idle");
      setProcessingStatus(null);
      setError(null);
      clearPolling();
      return;
    }

    // Check immediately on mount
    checkStatus();

    // Start polling — stops automatically when SUCCESS or FAILED
    intervalRef.current = setInterval(checkStatus, POLL_INTERVAL);

    // Clean up interval on unmount or fileId change
    return () => clearPolling();
  }, [fileId]);

  return {
    status,
    processingStatus,
    loading: status === "loading",
    error,
  };
}