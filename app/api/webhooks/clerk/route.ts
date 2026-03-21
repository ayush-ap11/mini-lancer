import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type ClerkUserData = {
  id?: string;
  email_addresses?: Array<{ email_address?: string | null }>;
  first_name?: string | null;
  last_name?: string | null;
};

function resolveName(data: ClerkUserData, email: string): string {
  const fullName = `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim();
  return fullName || email;
}

export async function POST(req: NextRequest) {
  try {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error("Missing CLERK_WEBHOOK_SECRET");
    }

    let evt: { type?: string; data?: ClerkUserData };

    try {
      evt = (await verifyWebhook(req, {
        signingSecret: webhookSecret,
      })) as { type?: string; data?: ClerkUserData };
    } catch {
      return NextResponse.json(
        { message: "Invalid webhook signature" },
        { status: 400 },
      );
    }

    const data = evt.data ?? {};
    const clerkUserId = data.id;
    const primaryEmail = data.email_addresses?.[0]?.email_address ?? undefined;

    if (!clerkUserId || !primaryEmail) {
      throw new Error("Invalid webhook payload");
    }

    const name = resolveName(data, primaryEmail);

    if (evt.type === "user.created") {
      await prisma.user.upsert({
        where: { id: clerkUserId },
        update: {
          email: primaryEmail,
          name,
        },
        create: {
          id: clerkUserId,
          email: primaryEmail,
          name,
          plan: "FREE",
        },
      });
    }

    if (evt.type === "user.updated") {
      await prisma.user.upsert({
        where: { id: clerkUserId },
        update: {
          email: primaryEmail,
          name,
        },
        create: {
          id: clerkUserId,
          email: primaryEmail,
          name,
          plan: "FREE",
        },
      });
    }

    return NextResponse.json({ message: "Webhook processed" }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Bad Request" }, { status: 400 });
  }
}
