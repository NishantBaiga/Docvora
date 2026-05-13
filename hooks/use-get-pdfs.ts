import { GetPdfsResponse, PdfFile } from "@/types/type.pdf";
import { useEffect, useState } from "react";

export function usePdfs() {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPdfs() {
      try {
        // const res = await fetch("/api/get-pdfs?page=1");
        const res = await fetch("/api/get-pdfs?&page=1&sort=date&order=desc");

        if (!res.ok) {
          throw new Error("Failed to fetch PDFs");
        }

        const data : GetPdfsResponse = await res.json();

        setFiles(data.pdfs || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchPdfs();
  }, []);

  return {
    files,
    loading,
  };
}
