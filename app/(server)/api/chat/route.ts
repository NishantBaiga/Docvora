import { db } from "@/lib/db";
import { searchPdfChunks } from "@/lib/qdrant/search";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { genAI, embedSingleText } from "@/lib/gemini";
import { buildChatPrompt } from "@/lib/prompts/chat-prompts";
import { withErrorHandler } from "@/lib/api-handler";
import { Errors } from "@/lib/errors";
import { ChatPostSchema, GetFileQuerySchema } from "@/lib/schemas/api-schemas";

const MESSAGE_PAGE_SIZE = 20;

export const GET = withErrorHandler(async (req: Request) => {
  const { userId } = await auth();
  if (!userId) throw Errors.unauthorized();

  const { searchParams } = new URL(req.url);

  const { fileId } = GetFileQuerySchema.parse({
    fileId: searchParams.get("fileId"),
  });

  const page = Math.max(Number(searchParams.get("page") ?? "1"), 1);

  const totalCount = await db.message.count({
    where: { fileId, userId },
  });

  const totalPages = Math.ceil(totalCount / MESSAGE_PAGE_SIZE);

  const messages = await db.message.findMany({
    where: { fileId, userId },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * MESSAGE_PAGE_SIZE,
    take: MESSAGE_PAGE_SIZE,
  });

  return NextResponse.json({
    messages: messages.reverse(),
    pagination: {
      page,
      totalPages,
      totalCount,
      hasMore: page < totalPages,
    },
  });
});

export const POST = withErrorHandler(async (req: Request) => {
  const { userId } = await auth();
  if (!userId) throw Errors.unauthorized();

  const body = await req.json();
  const { fileId, question } = ChatPostSchema.parse(body);

  const file = await db.file.findUnique({ where: { id: fileId } });
  if (!file) throw Errors.notFound("File");
  if (file.userId !== userId) throw Errors.forbidden();

  await db.message.create({
    data: { text: question, isUserMessage: true, fileId, userId },
  });

  const queryVector = await embedSingleText(question);

  const contextChunks = await searchPdfChunks({
    fileId,
    queryEmbedding: queryVector,
  });

  if (!contextChunks.length) {
    const fallback = "This information is not available in the document.";
    await db.message.create({
      data: { text: fallback, isUserMessage: false, fileId, userId },
    });
    return new Response(fallback, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const context = contextChunks.join("\n\n");
  const prompt = buildChatPrompt({ context, question });

  const geminiStream = await genAI.models.generateContentStream({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
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
});