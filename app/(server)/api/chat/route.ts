// app/api/chat/route.ts
import { db } from "@/lib/db";
import { searchPdfChunks } from "@/lib/qdrant/search";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { genAI } from "@/lib/gemini";
import { embedSingleText } from "@/lib/gemini";
import { buildChatPrompt } from "@/lib/prompts/chat-prompts";

/* -------------------- GET — fetch messages -------------------- */

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("fileId");
    if (!fileId) return new NextResponse("fileId is required", { status: 400 });

    const messages = await db.message.findMany({
      where: { fileId, userId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("GET MESSAGES ERROR:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

/* -------------------- POST — send message -------------------- */

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { fileId, question } = await req.json();
    if (!fileId || !question) {
      return new NextResponse("fileId or question missing", { status: 400 });
    }

    // Verify file belongs to this user
    const file = await db.file.findUnique({ where: { id: fileId } });
    if (!file) return new NextResponse("File not found", { status: 404 });
    if (file.userId !== userId)
      return new NextResponse("Forbidden", { status: 403 });

    // Save user message
    await db.message.create({
      data: { text: question, isUserMessage: true, fileId, userId },
    });

    // Embed question
    const queryVector = await embedSingleText(question);
    // Search Qdrant
    const contextChunks = await searchPdfChunks({
      fileId,
      queryEmbedding: queryVector,
    });

    if (!contextChunks.length) {
      const fallback = "The PDF does not contain this information.";
      await db.message.create({
        data: { text: fallback, isUserMessage: false, fileId, userId },
      });
      return NextResponse.json({ answer: fallback });
    }

    const context = contextChunks.join("\n\n");

    // Build prompt from separate file
    const prompt = buildChatPrompt({ context, question });

    // Start Gemini stream
    const geminiStream = await genAI.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    let fullAnswer = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of geminiStream) {
            const text = chunk.text ?? "";
            if (text) {
              fullAnswer += text;
              controller.enqueue(new TextEncoder().encode(text));
            }
          }

          // Save complete answer after stream finishes
          await db.message.create({
            data: { text: fullAnswer, isUserMessage: false, fileId, userId },
          });
        } catch (err) {
          console.error("Stream error:", err);
        } finally {
          controller.close();
        }
      },
    });
    
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.log("Qdrant error data:", JSON.stringify(error, null, 2));
    console.error("CHAT ERROR:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
