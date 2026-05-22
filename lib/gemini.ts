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

  const result = await genAI.models.embedContent({
    // model: "models/gemini-embedding-exp-03-07",
    model: "models/gemini-embedding-001",
    contents: texts,
    config: {
      outputDimensionality: config.qdrant.vectorSize,
    },
  });

  if (!result.embeddings || result.embeddings.length === 0) {
    throw new Error("Embedding generation returned no results");
  }

  const vectors = result.embeddings
    .map((e) => e.values)
    .filter((v): v is number[] => Array.isArray(v));

  if (vectors.length !== texts.length) {
    throw new Error(
      `Embedding count mismatch: expected ${texts.length}, got ${vectors.length}`
    );
  }

  return vectors;
}

export async function embedSingleText(text: string): Promise<number[]> {
  const vectors = await embedTexts([text]);
  return vectors[0];
}