// lib/qdrant/storeChunks.ts
import { qdrant } from "./qdrant";
import { config } from "@/lib/config";
import { v5 as uuidv5 } from "uuid";

const NAMESPACE = "b6b8c9f0-1234-4abc-9def-123456789abc";

type ChunkPayload = {
  text: string;
  page: number;
  chunkIndex: number;
};

export async function storePdfChunks({
  fileId,
  chunks,
  vectors,
}: {
  fileId: string;
  chunks: ChunkPayload[];
  vectors: number[][];
}): Promise<void> {
  if (chunks.length !== vectors.length) {
    throw new Error(
      `Chunks and vectors length mismatch: ${chunks.length} chunks, ${vectors.length} vectors`
    );
  }

  // Validate all vectors before attempting upsert
  for (let i = 0; i < vectors.length; i++) {
    const vector = vectors[i];
    if (!vector || vector.length !== config.qdrant.vectorSize) {
      throw new Error(
        `Invalid vector at index ${i}: expected ${config.qdrant.vectorSize} dimensions, got ${vector?.length ?? 0}`
      );
    }
  }

  const points = chunks.map((chunk, i) => ({
    id: uuidv5(`${fileId}_${chunk.page}_${chunk.chunkIndex}`, NAMESPACE),
    vector: vectors[i],
    payload: {
      fileId,
      page: chunk.page,
      chunkIndex: chunk.chunkIndex,
      text: chunk.text,
      source: "pdf",
    },
  }));

  // Upsert in batches to avoid hitting request size limits on large PDFs
  const BATCH_SIZE = 100;

  for (let i = 0; i < points.length; i += BATCH_SIZE) {
    const batch = points.slice(i, i + BATCH_SIZE);
    await qdrant.upsert(config.qdrant.collectionName, {
      points: batch,
      wait: true,
    });
    console.log(
      `Stored batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(points.length / BATCH_SIZE)}`
    );
  }
}