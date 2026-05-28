import { inngest } from "@/inngest/client";

export async function GET() {
  await inngest.send({
    name: "test/hello",
    data: {
      name: "Nishant",
    },
  });

  return Response.json({
    success: true,
  });
}