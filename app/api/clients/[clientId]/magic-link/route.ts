import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Resend } from "resend";
import prisma from "@/lib/prisma";
import { ensureUserExists } from "@/lib/ensure-user";
import { MagicLinkEmail } from "@/components/emails/magic-link-email";

const resend = new Resend(process.env.RESEND_API_KEY);

type RouteContext = {
  params: Promise<{
    clientId: string;
  }>;
};

export async function POST(_request: NextRequest, { params }: RouteContext) {
  const { clientId } = await params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId },
  });

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  if (client.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const user = await ensureUserExists(userId);

  const token = crypto.randomBytes(32).toString("hex");
  const tokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.client.update({
    where: { id: clientId },
    data: {
      magicLinkToken: token,
      tokenExpiresAt,
    },
  });

  const magicLinkUrl = `${process.env.NEXT_PUBLIC_APP_URL}/portal/${token}`;

  const { error } = await resend.emails.send({
    from: process.env.FROM_EMAIL as string,
    to: client.email,
    subject: "Your Project Portal is Ready",
    react: MagicLinkEmail({
      clientName: client.name,
      freelancerName: user.name,
      magicLinkUrl,
    }),
  });

  if (error) {
    console.error("Resend error:", JSON.stringify(error));
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      message: "Magic link sent successfully",
      expiresAt: tokenExpiresAt,
    },
    { status: 200 },
  );
}
