// app/api/qdrant/init/route.ts
import { ensureCollection } from "@/lib/qdrant/setup";

export async function GET() {
  await ensureCollection();
  return Response.json({ success: true });
}