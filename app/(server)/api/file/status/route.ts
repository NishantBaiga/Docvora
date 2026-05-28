// app/api/file/status/route.ts
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { withErrorHandler } from "@/lib/api-handler";
import { Errors } from "@/lib/errors";
import { GetFileQuerySchema } from "@/lib/schemas/api-schemas";
import { NextResponse } from "next/server";

export const GET = withErrorHandler(async (req: Request) => {
  const { userId } = await auth();
  if (!userId) throw Errors.unauthorized();

  const { searchParams } = new URL(req.url);

  // Reuse existing schema — only needs fileId
  const { fileId } = GetFileQuerySchema.parse({
    fileId: searchParams.get("fileId"),
  });

  const file = await db.file.findFirst({
    where: { id: fileId, userId },
    select: {
      uploadStatus: true, // only fetch what the client needs
    },
  });

  if (!file) throw Errors.notFound("File");

  return NextResponse.json({
    status: file.uploadStatus, // PENDING | PROCESSING | SUCCESS | FAILED
  });
});