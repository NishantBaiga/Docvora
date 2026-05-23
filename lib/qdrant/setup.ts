// lib/qdrant/setup.ts
import { qdrant } from "./qdrant";
import { config } from "@/lib/config";

export async function ensureCollection(): Promise<void> {
  try {
    const response = await qdrant.getCollections();

    const exists = response.collections.some(
      (c: { name: string }) => c.name === config.qdrant.collectionName
    );

    if (!exists) {
      await qdrant.createCollection(config.qdrant.collectionName, {
        vectors: {
          size: config.qdrant.vectorSize,
          distance: "Cosine",
        },
      });
      console.log(`Collection ${config.qdrant.collectionName} created`);
    } else {
      console.log(`Collection ${config.qdrant.collectionName} already exists`);
    }

    // Create payload index on fileId — required for filtering on Qdrant cloud
    await qdrant.createPayloadIndex(config.qdrant.collectionName, {
      field_name: "fileId",
      field_schema: "keyword",
    });

    console.log("Payload index on fileId ensured");

  } catch (error) {
    console.error("Failed to ensure Qdrant collection:", error);
    throw error;
  }
}