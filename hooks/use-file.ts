"use client";

import { useEffect, useState } from "react";

export function usePdf(fileId: string | null) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loadingPdf, setLoadingPdf] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fileId) return;

    async function loadPdf() {
      try {
        setLoadingPdf(true);
        setError(null);

        const res = await fetch(`/api/file?fileId=${fileId}`);
        if (!res.ok) throw new Error("Failed to load PDF");

        const data = await res.json();
        setPdfUrl(data.url);
      } catch (err) {
        console.error(err);
        setError("Unable to load PDF");
        setPdfUrl(null);
      } finally {
        setLoadingPdf(false);
      }
    }

    loadPdf();
  }, [fileId]);

  function downloadPdf() {
    if (!pdfUrl || !fileId) return;

    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `document-${fileId}.pdf`;
    link.click();
  }

  return {
    pdfUrl,
    loadingPdf,
    error,
    downloadPdf,
  };
}
