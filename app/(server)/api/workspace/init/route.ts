import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { extractAndChunkPdf } from "@/lib/pdf/proccesPdf";
import { embedTexts } from "@/lib/gemini";
import { storePdfChunks } from "@/lib/qdrant/storeChunks";
import { ensureCollection } from "@/lib/qdrant/setup";
import { withErrorHandler } from "@/lib/api-handler";
import { Errors } from "@/lib/errors";
import { WorkspaceInitSchema } from "@/lib/schemas/api-schemas";
import { initRatelimit } from "@/lib/rate-limit";

export const POST = withErrorHandler(async (req: Request) => {
  const { userId } = await auth();
  if (!userId) throw Errors.unauthorized();

    const { success, reset } = await initRatelimit.limit(userId);
  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000);
    throw Errors.tooManyRequests(retryAfter);
  }

  const body = await req.json();
  const { fileId } = WorkspaceInitSchema.parse(body);

  const file = await db.file.findUnique({ where: { id: fileId } });
  if (!file) throw Errors.notFound("File");
  if (file.userId !== userId) throw Errors.forbidden();

  if (file.uploadStatus === "SUCCESS") {
    return NextResponse.json({
      summary: file.summary ?? "",
      alreadyProcessed: true,
    });
  }

  await db.file.update({
    where: { id: fileId },
    data: { uploadStatus: "PROCESSING" },
  });

  try {
    await ensureCollection();

    const chunks = await extractAndChunkPdf(file.url);
    const texts = chunks.map((c) => c.text);
    const vectors = await embedTexts(texts);

    await storePdfChunks({ fileId, chunks, vectors });

    await db.file.update({
      where: { id: fileId },
      data: { uploadStatus: "SUCCESS" },
    });

    return NextResponse.json({
      summary: file.summary ?? "",
      alreadyProcessed: false,
    });

  } catch (err) {
    // Mark as failed so UI shows error state
    await db.file.update({
      where: { id: fileId },
      data: { uploadStatus: "FAILED" },
    });
    throw err;
  }
});