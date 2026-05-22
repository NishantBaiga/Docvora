import { qdrant } from "@/lib/qdrant/qdrant";

export async function GET() {
  const vector = new Array(768).fill(0);

  const res = await qdrant.search("pdf_chunks", {
    vector,
    limit: 1,
  });

  return Response.json(res);
}
