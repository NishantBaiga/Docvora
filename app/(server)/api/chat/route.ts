import { db } from "@/lib/db";
import { searchPdfChunks } from "@/lib/qdrant/search";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { genAI, embedSingleText } from "@/lib/gemini";
import { buildChatPrompt } from "@/lib/prompts/chat-prompts";
import { withErrorHandler } from "@/lib/api-handler";
import { Errors } from "@/lib/errors";
import { ChatPostSchema, GetFileQuerySchema } from "@/lib/schemas/api-schemas";
import { chatRatelimit } from "@/lib/rate-limit";

const MESSAGE_PAGE_SIZE = 20;
const HISTORY_LIMIT = 10;

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

  // Rate limit check — prevent Gemini API abuse
  const { success, reset } = await chatRatelimit.limit(userId);
  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000);
    throw Errors.tooManyRequests(retryAfter);
  }

  const body = await req.json();
  const { fileId, question } = ChatPostSchema.parse(body);

  const file = await db.file.findUnique({ where: { id: fileId } });
  if (!file) throw Errors.notFound("File");
  if (file.userId !== userId) throw Errors.forbidden();

  await db.message.create({
    data: { text: question, isUserMessage: true, fileId, userId },
  });

  // Fetch recent conversation history for this file
  // Ordered desc to get latest first, then reversed below for chronological order
  const recentMessages = await db.message.findMany({
    where: { fileId, userId },
    orderBy: { createdAt: "desc" },
    // Add 1 to account for the user message we just saved above
    // We exclude it from history since it is the current question
    take: HISTORY_LIMIT + 1,
    select: {
      text: true,
      isUserMessage: true,
    },
  });

  // Reverse to chronological order and exclude the message we just saved
  // which is always at index 0 after desc sort
  const history = recentMessages
    .slice(1) // remove the current question we just saved
    .reverse(); // oldest first for correct conversation order

  // Embed question for semantic search
  const queryVector = await embedSingleText(question);

  // Search Qdrant for relevant PDF chunks
  const contextChunks = await searchPdfChunks({
    fileId,
    queryEmbedding: queryVector,
  });

  // No relevant context found in document - return early with fallback message
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

  // Build system prompt with document context and rules
  const systemPrompt = buildChatPrompt({ context });

  // Format conversation history into Gemini multi-turn format
  // Gemini uses "model" for assistant role, not "assistant"
  const conversationHistory = history.map((m) => ({
    role: m.isUserMessage ? "user" : ("model" as "user" | "model"),
    parts: [{ text: m.text }],
  }));

  const geminiStream = await genAI.models.generateContentStream({
    model: "gemini-2.5-flash",
    config: { systemInstruction: systemPrompt },
    contents: [
      // Inject previous messages for short term memory
      ...conversationHistory,
      // Current question as the final user turn
      { role: "user", parts: [{ text: question }] },
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
      "X-RateLimit-Reset": reset.toString(),
    },
  });
});
