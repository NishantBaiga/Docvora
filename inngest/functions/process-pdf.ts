import { inngest } from "../client";
import { db } from "@/lib/db";
import { extractAndChunkPdf } from "@/lib/pdf/proccesPdf";
import { embedTexts } from "@/lib/gemini";
import { storePdfChunks } from "@/lib/qdrant/storeChunks";
import { ensureCollection } from "@/lib/qdrant/setup";

export type ProcessPdfEvent = {
  name: "pdf/process";
  data: {
    fileId: string;
    userId: string;
    fileUrl: string;
  };
};

export const processPdf = inngest.createFunction(
  {
    id: "process-pdf",
    triggers: [{ event: "pdf/process" }],
    retries: 3,
    onFailure: async ({ event }) => {
        console.log("event onFailure inngest",event)
      const { fileId } = event.data.event.data as ProcessPdfEvent["data"];
      await db.file.update({
        where: { id: fileId },
        data: { uploadStatus: "FAILED" },
      });
      console.error(`PDF processing permanently failed for fileId: ${fileId}`);
    },
  },


  async ({ event, step }) => {
    const { fileId, fileUrl } = event.data as ProcessPdfEvent["data"];

    // Step 1: Mark file as PROCESSING
    await step.run("mark-processing", async () => {
      await db.file.update({
        where: { id: fileId },
        data: { uploadStatus: "PROCESSING" },
      });
    });

    // Step 2: Ensure Qdrant collection exists
    await step.run("ensure-collection", async () => {
      await ensureCollection();
    });

    // Step 3: Fetch PDF and extract chunks
    const chunks = await step.run("extract-chunks", async () => {
      return await extractAndChunkPdf(fileUrl);
    });

    // Step 4: Generate embeddings
    const vectors = await step.run("generate-embeddings", async () => {
      const texts = chunks.map((c) => c.text);
      return await embedTexts(texts);
    });

    // Step 5: Store vectors in Qdrant
    await step.run("store-vectors", async () => {
      await storePdfChunks({ fileId, chunks, vectors });
    });

    // Step 6: Mark file as SUCCESS
    await step.run("mark-success", async () => {
      await db.file.update({
        where: { id: fileId },
        data: { uploadStatus: "SUCCESS" },
      });
    });

    return {
      fileId,
      chunksProcessed: chunks.length,
      vectorsStored: vectors.length,
      status: "SUCCESS",
    };
  },
);
