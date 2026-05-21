import { GetPdfsResponse, FileRecord } from "@/types/type.pdf";
import { useEffect, useState } from "react";





export function useFiles() {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFiles() {
      try {
        setLoadingFiles(true);
        setError(null);
        const res = await fetch("/api/files?&page=1&sort=date&order=desc");

        if (!res.ok) {
          throw new Error("Failed to fetch PDFs");
        }

        const data: GetPdfsResponse = await res.json();

        setFiles(data.pdfs || []);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Something went wrong",
        );
        console.error(error);
      } finally {
        setLoadingFiles(false);
      }
    }

    fetchFiles();
  }, []);

  return {
    files,
    setFiles,
    loadingFiles,
    error,
  };
}
