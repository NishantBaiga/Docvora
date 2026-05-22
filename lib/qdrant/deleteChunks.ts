// lib/qdrant/deleteChunks.ts
import { qdrant } from "./qdrant";
import { config } from "@/lib/config";

export async function deletePdfChunks(fileId: string): Promise<void> {
  await qdrant.delete(config.qdrant.collectionName, {
    filter: {
      must: [
        {
          key: "fileId",
          match: {
            value: fileId,
          },
        },
      ],
    },
    wait: true,
  });

  console.log(`Deleted all chunks for fileId: ${fileId}`);
}