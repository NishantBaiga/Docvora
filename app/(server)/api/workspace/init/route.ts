// const ai = new GoogleGenAI({
//   apiKey: process.env.GEMINI_API_KEY,
// });

// async function printAvailableModels() {
//   try {
//     // Fetch the list of models
//     const models = await ai.models.list({ config: { pageSize: 50 } });

//     // Iterate and print the model names
//     for await (const model of models) {
//       console.log(model.name);
//     }
//   } catch (error) {
//     console.error("Failed to fetch models:", error);
//   }
// }
// app/api/workspace/init/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { extractAndChunkPdf } from "@/lib/pdf/proccesPdf";
import { embedTexts } from "@/lib/gemini";
import { storePdfChunks } from "@/lib/qdrant/storeChunks";
import { ensureCollection } from "@/lib/qdrant/setup";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { fileId } = await req.json();
    if (!fileId) {
      return new NextResponse("fileId is required", { status: 400 });
    }

    // Verify file exists and belongs to this user
    const file = await db.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return new NextResponse("File not found", { status: 404 });
    }

    if (file.userId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Skip if already processed — prevents re-embedding on every workspace visit
    if (file.uploadStatus === "SUCCESS") {
      return NextResponse.json({
        summary: file.summary ?? "",
        alreadyProcessed: true,
      });
    }

    // Mark as processing
    await db.file.update({
      where: { id: fileId },
      data: { uploadStatus: "PROCESSING" },
    });

    // Ensure Qdrant collection exists
    await ensureCollection();

    // Step 1: Extract text and chunk
    const chunks = await extractAndChunkPdf(file.url);

    // Step 2: Embed all chunks in one batch
    const texts = chunks.map((c) => c.text);
    const vectors = await embedTexts(texts);

    // Step 3: Store in Qdrant
    await storePdfChunks({ fileId, chunks, vectors });

    // Step 4: Mark as ready
    await db.file.update({
      where: { id: fileId },
      data: { uploadStatus: "SUCCESS" },
    });

    return NextResponse.json({
      summary: file.summary ?? "",
      alreadyProcessed: false,
    });

  } catch (error) {
    console.error("Workspace init error:", error);

    // Mark as failed so UI can show error state instead of infinite spinner
    try {
      const { fileId } = await req.json().catch(() => ({ fileId: null }));
      if (fileId) {
        await db.file.update({
          where: { id: fileId },
          data: { uploadStatus: "FAILED" },
        });
      }
    } catch {
      // ignore secondary error
    }

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}