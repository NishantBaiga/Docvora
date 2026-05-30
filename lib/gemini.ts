// lib/gemini.ts
import { GoogleGenAI } from "@google/genai";
import { config } from "@/lib/config";

export const genAI = new GoogleGenAI({
  apiKey: config.google.apiKey,
});

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) {
    throw new Error("No texts provided for embedding");
  }

  const BATCH_SIZE = 100;
  const allVectors: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);

    console.log(
      `Embedding batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(texts.length / BATCH_SIZE)} — ${batch.length} chunks`,
    );

    const result = await genAI.models.embedContent({
      // model: "models/gemini-embedding-exp-03-07",
      model: "models/gemini-embedding-001",
      contents: batch,
      config: {
        outputDimensionality: config.qdrant.vectorSize,
      },
    });

    if (!result.embeddings || result.embeddings.length === 0) {
      throw new Error(
        `Embedding generation failed for batch starting at index ${i}`,
      );
    }

    const vectors = result.embeddings
      .map((e) => e.values)
      .filter((v): v is number[] => Array.isArray(v));

    if (vectors.length !== batch.length) {
      throw new Error(
        `Embedding count mismatch in batch: expected ${batch.length}, got ${vectors.length}`,
      );
    }

    allVectors.push(...vectors);
  }

  if (allVectors.length !== texts.length) {
    throw new Error(
      `Total embedding count mismatch: expected ${texts.length}, got ${allVectors.length}`,
    );
  }

  return allVectors;
}

export async function embedSingleText(text: string): Promise<number[]> {
  const vectors = await embedTexts([text]);
  return vectors[0];
}
