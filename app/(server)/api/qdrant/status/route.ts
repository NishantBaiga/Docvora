import { qdrant } from "@/lib/qdrant/qdrant";

export async function GET() {
  const collections = await qdrant.getCollections();
  return Response.json(collections);
}
