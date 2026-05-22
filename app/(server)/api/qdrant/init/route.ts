// import { qdrant } from "@/lib/qdrant/qdrant";

// export async function GET() {
//   await qdrant.createCollection("pdf_chunks", {
//     vectors: {
//       size: 768,
//       distance: "Cosine",
//     },
//   });

//   return Response.json({ success: true });
// }


// app/api/qdrant/init/route.ts
import { ensureCollection } from "@/lib/qdrant/setup";

export async function GET() {
  await ensureCollection();
  return Response.json({ success: true });
}