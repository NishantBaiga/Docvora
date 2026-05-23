"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function updateDocumentName(
  fileId: string,
  newName: string
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  if (!newName.trim()) {
    throw new Error("File name cannot be empty");
  }

  const doc = await db.file.findUnique({
    where: { id: fileId },
  });

  if (!doc || doc.userId !== userId) {
    throw new Error("Forbidden");
  }

  await db.file.update({
    where: { id: fileId },
    data: { name: newName },
  });
}
