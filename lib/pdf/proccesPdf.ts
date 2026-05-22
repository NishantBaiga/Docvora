// lib/pdf/processPdf.ts
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export type PdfChunk = {
  text: string;
  page: number;
  chunkIndex: number;
};

export async function extractAndChunkPdf(url: string): Promise<PdfChunk[]> {
  // Fetch PDF from UploadThing
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download PDF from URL: ${response.statusText}`);
  }

  const blob = await response.blob();

  // Load with LangChain PDFLoader
  const loader = new PDFLoader(blob);
  const docs = await loader.load();

  if (!docs.length) {
    throw new Error("PDF loaded but contains no pages");
  }

  console.log(`PDF loaded: ${docs.length} pages`);

  const pages = docs.map((doc, index) => ({
    page: index + 1,
    text: doc.pageContent,
  }));

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 100,
  });

  const allChunks: PdfChunk[] = [];

  for (const page of pages) {
    // Skip empty pages
    if (!page.text.trim()) continue;

    const chunks = await splitter.splitText(page.text);

    chunks.forEach((chunkText, index) => {
      // Skip empty chunks
      if (!chunkText.trim()) return;

      allChunks.push({
        text: chunkText,
        page: page.page,
        chunkIndex: index,
      });
    });
  }

  if (!allChunks.length) {
    throw new Error("No chunks generated from PDF — document may be empty or image-only");
  }

  console.log(`Generated ${allChunks.length} chunks`);

  return allChunks;
}