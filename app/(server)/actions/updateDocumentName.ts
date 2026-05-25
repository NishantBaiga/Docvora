"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { Errors } from "@/lib/errors";
import { z } from "zod";
import { UpdateDocumentNameSchema } from "@/lib/schemas/api-schemas";



export async function updateDocumentName(
  fileId: string,
  newName: string
): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw Errors.unauthorized();

  const { fileId: validatedFileId, newName: validatedName } =
    UpdateDocumentNameSchema.parse({ fileId, newName });

  const doc = await db.file.findUnique({
    where: { id: validatedFileId },
  });

  if (!doc) throw Errors.notFound("Document");
  if (doc.userId !== userId) throw Errors.forbidden();

  await db.file.update({
    where: { id: validatedFileId },
    data: { name: validatedName },
  });
}