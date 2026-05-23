"use server";

import { db } from "@/lib/db";
import { deletePdfChunks } from "@/lib/qdrant/deleteChunks";
import { utapi } from "@/lib/uploadThing";
import { auth } from "@clerk/nextjs/server";

export async function DeleteDocument(fileId: string): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const document = await db.file.findUnique({
    where: { id: fileId },
  });

  if (!document) throw new Error("Document not found");
  if (document.userId !== userId) throw new Error("Forbidden");

  // Delete from UploadThing
  await utapi.deleteFiles(document.key);

  // Delete vectors from Qdrant
  await deletePdfChunks(fileId);

  // Delete from Neon DB last — source of truth
  await db.file.delete({
    where: { id: fileId },
  });
}