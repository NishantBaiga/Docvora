import { inngest } from "@/inngest/client";
import { db } from "@/lib/db";
// import { syncUser } from "@/lib/sync-user";
import { currentUser } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();
export const ourFileRouter = {
  pdfUploader: f({ pdf: { maxFileSize: "32MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const user = await currentUser();
      if (!user) throw new UploadThingError("Unauthorized");
      return {
        userId: user.id,
        userEmail: user?.emailAddresses[0]?.emailAddress || "unknown",
        userName: user?.firstName || "user",
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Save file meta data info to neonDB
      const userFile = await db.file.create({
        data: {
          userId: metadata.userId,
          name: file.name,
          size: file.size,
          key: file.key,
          url: file.ufsUrl,
          uploadStatus: "PENDING",
        },
      });

      // Trigger Inngest background job immediately after DB save
      // This is fire-and-forget — does not block the upload response
      await inngest.send({
        name: "pdf/process",
        data: {
          fileId: userFile.id,
          userId: metadata.userId,
          fileUrl: file.ufsUrl, // pass URL so Inngest can fetch the PDF
        },
      });

      return {
        uploadedBy: metadata.userId,
        fileId: userFile.id,
        key: file.key,
        url: file.ufsUrl,
        name: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
