// inngest/client.ts
import { Inngest } from "inngest";

// Create Inngest client — this is used everywhere to send events and define functions
export const inngest = new Inngest({
  id: "pdf-chat", // unique app id shown in Inngest dashboard
});