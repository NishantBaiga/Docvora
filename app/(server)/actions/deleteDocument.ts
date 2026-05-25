"use server";

import { db } from "@/lib/db";
import { deletePdfChunks } from "@/lib/qdrant/deleteChunks";
import { utapi } from "@/lib/uploadThing";
import { auth } from "@clerk/nextjs/server";
import { Errors } from "@/lib/errors";
import { DeleteDocumentSchema } from "@/lib/schemas/api-schemas";

export async function DeleteDocument(fileId: string): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw Errors.unauthorized();

  // Validate input
  const { fileId: validatedFileId } = DeleteDocumentSchema.parse({ fileId });

  const document = await db.file.findUnique({
    where: { id: validatedFileId },
  });

  if (!document) throw Errors.notFound("Document");
  if (document.userId !== userId) throw Errors.forbidden();

  await utapi.deleteFiles(document.key);
  await deletePdfChunks(validatedFileId);
  await db.file.delete({ where: { id: validatedFileId } });
}