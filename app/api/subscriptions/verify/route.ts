import crypto from "node:crypto";
import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ensureUserExists } from "@/lib/ensure-user";
import prisma from "@/lib/prisma";

const verifySubscriptionSchema = z.object({
  razorpay_payment_id: z.string().min(1),
  razorpay_subscription_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: "Missing Razorpay key secret" },
        { status: 500 },
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = verifySubscriptionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid verification payload" },
        { status: 400 },
      );
    }

    const {
      razorpay_payment_id,
      razorpay_signature,
      razorpay_subscription_id,
    } = parsed.data;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const user = await ensureUserExists(userId);

    if (
      user.razorpaySubscriptionId &&
      user.razorpaySubscriptionId !== razorpay_subscription_id
    ) {
      return NextResponse.json(
        { error: "Subscription mismatch" },
        { status: 403 },
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        plan: "PRO",
        razorpaySubscriptionId: razorpay_subscription_id,
      },
    });

    return NextResponse.json(
      { message: "Subscription verified" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Subscription verify error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
