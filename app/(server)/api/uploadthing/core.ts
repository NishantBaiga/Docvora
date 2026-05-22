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
      // console.log("username :", user?.username,"user id :",user?.id,"user email :",user?.emailAddresses[0]?.emailAddress);

      if (!user) throw new UploadThingError("Unauthorized");
      return {
        userId: user.id,
        userEmail: user?.emailAddresses[0]?.emailAddress || "unknown",
        userName: user?.firstName || "user",
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // console.log("Uploadthing onUpload complete meta data:", metadata,"file url", file);

      // Save file info to DB
    const userFile =  await db.file.create({
        data: {
          userId: metadata.userId,
          name: file.name,
          size: file.size,
          key: file.key,
          url: file.ufsUrl,
          uploadStatus: "PENDING",
        },
      });

      return {
        uploadedBy: metadata.userId,
        fileId : userFile.id,
        key: file.key,
        url: file.ufsUrl,
        name: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
