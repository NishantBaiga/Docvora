"use server";

import { db } from "@/lib/db";
import { utapi } from "@/lib/uploadThing";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


export async function DeleteDocument(fileId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const document = await db.file.findUnique({
    where: { id: fileId },
  });

  if (!document) {
    throw new Error("Document not found");
  }

  //   Ownership check
  if (document.userId !== userId) {
    throw new Error("Forbidden");
  }

  await utapi.deleteFiles(document.key);

  await db.file.delete({
    where: { id: fileId },
  });
  
  return new NextResponse(null, { status: 204 });
}
