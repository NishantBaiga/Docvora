// lib/qdrant/setup.ts
import { qdrant } from "./qdrant";
import { config } from "@/lib/config";

export async function ensureCollection(): Promise<void> {
  try {
    const collections = await qdrant.getCollections();
    const exists = collections.collections.some(
      (c: { name: string }) => c.name === config.qdrant.collectionName
    );

    if (exists) {
      console.log(`Collection ${config.qdrant.collectionName} already exists`);
      return;
    }

    await qdrant.createCollection(config.qdrant.collectionName, {
      vectors: {
        size: config.qdrant.vectorSize,
        distance: "Cosine",
      },
    });

    console.log(`Collection ${config.qdrant.collectionName} created`);
  } catch (error) {
    console.error("Failed to ensure Qdrant collection:", error);
    throw error;
  }
}