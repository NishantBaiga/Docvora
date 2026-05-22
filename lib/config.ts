// lib/config.ts
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  google: {
    apiKey: requireEnv("GOOGLE_API_KEY"),
  },
  qdrant: {
    url: requireEnv("QDRANT_URL"),
    apiKey: requireEnv("QDRANT_API_KEY"),
    collectionName: "pdf_chunks",
    vectorSize: 768,
  },
  db: {
    url: requireEnv("DATABASE_URL"),
  },
} as const;