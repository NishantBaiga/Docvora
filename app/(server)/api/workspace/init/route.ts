// import { db } from "@/lib/db";
// import { GoogleGenAI } from "@google/genai";
// import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
// import { NextResponse } from "next/server";
// import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
// import { storePdfChunks } from "@/lib/qdrant/storeChunks";
// import { auth } from "@clerk/nextjs/server";

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

// printAvailableModels();
// export async function POST(req: Request) {
//   try {
//     const { userId } = await auth();
//     if (!userId) return new NextResponse("Unauthorized", { status: 401 });
//     const { fileId } = await req.json();

//     let file = await db.file.findUnique({
//       where: { id: fileId },
//     });
//     if (!file) {
//       return new NextResponse("File not found in db", { status: 404 });
//     }

//     // Fetch the PDF file from the URL (UploadThing)
//     const response = await fetch(file.url);
//     if (!response.ok) throw new Error("Failed to download PDF");
//     const blob = await response.blob();

//     // Load the PDF using LangChain
//     const loader = new PDFLoader(blob);
//     const docs = await loader.load();

//     const fullText = docs.map((doc) => doc.pageContent).join("\n");
//     const pageCount = docs.length;
//     const pages = docs.map((doc, index) => ({
//       page: index + 1,
//       text: doc.pageContent,
//     }));

//     const splitter = new RecursiveCharacterTextSplitter({
//       chunkSize: 500, // 1000,
//       chunkOverlap: 100, // 150,
//     });

//     const allChunks: {
//       text: string;
//       page: number;
//       chunkIndex: number;
//     }[] = [];

//     for (const page of pages) {
//       const chunks = await splitter.splitText(page.text);

//       chunks.forEach((chunkText, index) => {
//         allChunks.push({
//           text: chunkText,
//           page: page.page,
//           chunkIndex: index,
//         });
//       });
//     }

//     if (!allChunks.length) {
//       throw new Error("No chunks generated from PDF");
//     }
//     const ai = new GoogleGenAI({
//       apiKey: process.env.GOOGLE_API_KEY!,
//     });

//     const texts = allChunks.map((c) => c.text);
//     const embeddingResult = await ai.models.embedContent({
//       model: "models/gemini-embedding-001",
//       contents: texts, // ✅ BATCH
//       config: {
//         outputDimensionality: 768, // ✅ Forces Gemini to output exactly 768 dimensions because Qdrant is configured for that. Adjust if you change Qdrant config.and by default Gemini outputs 1024 dimensions which would cause an error.
//       },
//     });

//     if (!embeddingResult.embeddings) {
//       throw new Error("Embedding generation failed");
//     }

//     const rawVectors = embeddingResult.embeddings.map((e) => e.values);

//     const vectors: number[][] = rawVectors.filter((v): v is number[] =>
//       Array.isArray(v),
//     );
//     if (vectors.length !== allChunks.length) {
//       throw new Error("Embedding count mismatch");
//     }

//     await storePdfChunks({
//       fileId,
//       chunks: allChunks,
//       vectors: vectors,
//     });

//     return NextResponse.json({
//       extractedText: file.extractedText || "",
//       summary: file.summary || "",
//     });
//   } catch (err) {
//     console.error(err);
//     return new NextResponse("Internal Error", { status: 500 });
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