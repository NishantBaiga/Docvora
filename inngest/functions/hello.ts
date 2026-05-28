
import { inngest } from "../client";
export const helloWorld = inngest.createFunction(
  {
    id: "hello-world",
    triggers: [
      {
        event: "test/hello",
      },
    ],
  },
  async ({ event, step }) => {
    await step.sleep("wait-a-bit", "2s");
    return {
      message: `Hello ${event.data.name}`,
    };
  }
);
