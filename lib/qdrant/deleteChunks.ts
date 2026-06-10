// lib/qdrant/deleteChunks.ts
import { qdrant } from "./qdrant";
import { config } from "@/lib/config";
export async function deletePdfChunks(fileId: string): Promise<void> {
  console.log(`Attempting to delete chunks for fileId: ${fileId}`);
  const result = await qdrant.delete(config.qdrant.collectionName, {
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
  console.log(`Qdrant delete result:`, JSON.stringify(result, null, 2));
}