import { db } from "@/lib/db";
import { searchPdfChunks } from "@/lib/qdrant/search";
// import { searchPdfChunks } from "@/lib/qdrant/searchPdfChunks";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    /* -------------------- Auth -------------------- */

    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    /* -------------------- Input -------------------- */

    const { fileId, question } = await req.json();
    if (!fileId || !question) {
      return new NextResponse("fileId or question missing", { status: 400 });
    }

    /* -------------------- Save user message -------------------- */

    await db.message.create({
      data: {
        text: question,
        isUserMessage: true,
        fileId,
        userId,
      },
    });

    /* -------------------- Embed question -------------------- */

    const ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_API_KEY!,
    });

    const embeddingResult = await ai.models.embedContent({
      model: "models/text-embedding-004",
      contents: question,
    });

    if (!embeddingResult.embeddings || !embeddingResult.embeddings[0]?.values) {
      throw new Error("Failed to embed question");
    }

    const queryVector = embeddingResult.embeddings[0].values;

    /* -------------------- Search Qdrant -------------------- */

    const contextChunks = await searchPdfChunks({
      fileId,
      queryEmbedding: queryVector,
    });

    if (!contextChunks.length) {
      return NextResponse.json({
        answer: "The PDF does not contain this information.",
      });
    }

    const context = contextChunks.join("\n\n");

    /* -------------------- Ask Gemini -------------------- */

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
You are a strict PDF question-answering assistant.

Use ONLY the information from the context below.
If the answer is not explicitly present, say:
"The PDF does not contain this information."

Context:
${context}

Question:
${question}

Answer concisely and accurately.
              `.trim(),
            },
          ],
        },
      ],
    });

    const answer = response.text || "No answer generated";

    /* -------------------- Save AI message -------------------- */

    await db.message.create({
      data: {
        text: answer,
        isUserMessage: false,
        fileId,
        userId,
      },
    });

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("PDF CHAT ERROR:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}



export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const fileId = searchParams.get("fileId");

  if (!fileId) {
    return new NextResponse("fileId is required", { status: 400 });
  }

  const messages = await db.message.findMany({
    where: {
      fileId,
      userId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return NextResponse.json(messages);
}