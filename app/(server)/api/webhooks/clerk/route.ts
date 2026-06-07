import { headers } from "next/headers";
import { Webhook } from "svix";
import { db } from "@/lib/db";
import type { WebhookEvent } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  console.log("🔥 WEBHOOK HIT");

  const payload = await req.text();
  const headerPayload = await headers();

  const svixHeaders = {
    "svix-id": headerPayload.get("svix-id")!,
    "svix-timestamp": headerPayload.get("svix-timestamp")!,
    "svix-signature": headerPayload.get("svix-signature")!,
  };

  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return new Response("Missing webhook secret", { status: 500 });
  }

  let event: WebhookEvent;

  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(payload, svixHeaders) as WebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed", err);
    return new Response("Invalid signature", { status: 400 });
  }

  console.log(event.type);
  console.log(event.data.id);

  // ✅ Handle user.created event
  if (event.type === "user.created") {
    const user = event.data;
    // const email = user.email_addresses?.[0]?.email_address;
    const email = user.email_addresses.find(
      (e) => e.id === user.primary_email_address_id,
    )?.email_address;

    if (!email) {
      return new Response("No email found", { status: 400 });
    }

     await db.user.upsert({
      where: {
        clerkId: user.id,
      },
      create: {
        clerkId: user.id,
        email,
        fullName:
          `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim(),
      },
      update: {
        email,
        fullName:
          `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim(),
      },
    });
  }

  

  if (event.type === "user.updated") {
    const user = event.data;

    const email = user.email_addresses.find(
      (email) => email.id === user.primary_email_address_id,
    )?.email_address;

    await db.user.update({
      where: {
        clerkId: user.id,
      },
      data: {
        email,
        fullName: `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim(),
      },
    });
  }



  if (event.type === "user.deleted") {
    if (!event.data.id) {
      return new Response("Missing user id", { status: 400 });
    }
    await db.user.delete({
      where: {
        clerkId: event.data.id,
      },
    });
  }

  return new Response("Webhook received", { status: 200 });
}
