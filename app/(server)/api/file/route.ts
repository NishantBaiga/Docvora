import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { withErrorHandler } from "@/lib/api-handler";
import { Errors } from "@/lib/errors";
import { GetFileQuerySchema } from "@/lib/schemas/api-schemas";

export const GET = withErrorHandler(async (req: Request) => {
const { userId } = await auth();
    if (!userId) throw Errors.unauthorized();

  const { searchParams } = new URL(req.url);
  const { fileId } = GetFileQuerySchema.parse({
    fileId: searchParams.get("fileId"),
  });

  if (!fileId) return new NextResponse("fileId required", { status: 400 });

  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId,
    },
    select: {
      url: true,
      name: true,
      uploadStatus: true,
    },
  });
  if (!file) throw Errors.notFound("File");
  return NextResponse.json(file);
});