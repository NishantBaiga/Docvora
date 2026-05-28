// app/api/inngest/route.ts
import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { helloWorld } from "@/inngest/functions";
// import { processPdf } from "@/inngest/functions/process-pdf";
// import { helloWorld } from "@/inngest/functions/hello";


export const runtime = "nodejs";
// Serve all registered Inngest functions
// Inngest calls this endpoint to trigger and manage functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    // processPdf, // register all functions here
    helloWorld,
  ],
});