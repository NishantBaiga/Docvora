// lib/qdrant/qdrant.ts
import { QdrantClient } from "@qdrant/js-client-rest";
import { config } from "@/lib/config";

export const qdrant = new QdrantClient({
  url: config.qdrant.url,
  apiKey: config.qdrant.apiKey,
});