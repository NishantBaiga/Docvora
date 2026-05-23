// lib/qdrant/search.ts
import { qdrant } from "./qdrant";
import { config } from "@/lib/config";

export async function searchPdfChunks({
  fileId,
  queryEmbedding,
  limit = 5,
}: {
  fileId: string;
  queryEmbedding: number[];
  limit?: number;
}): Promise<string[]> {
  const results = await qdrant.search(config.qdrant.collectionName, {
    vector: queryEmbedding,
    limit,
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
    with_payload: true,
  });

  return results
    .filter((r) => r.payload?.text)
    .map((r) => r.payload!.text as string);
}