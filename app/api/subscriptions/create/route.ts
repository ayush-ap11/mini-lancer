import { auth } from "@clerk/nextjs/server";
import Razorpay from "razorpay";
import { NextRequest, NextResponse } from "next/server";
import { ensureUserExists } from "@/lib/ensure-user";
import prisma from "@/lib/prisma";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(_request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await ensureUserExists(userId);

    if (user.plan === "PRO") {
      return NextResponse.json(
        { error: "You are already on the Pro plan" },
        { status: 400 },
      );
    }

    let razorpayCustomerId = user.razorpayCustomerId;

    if (!razorpayCustomerId) {
      const customer = await razorpay.customers.create({
        name: user.name,
        email: user.email,
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { razorpayCustomerId: customer.id },
      });

      razorpayCustomerId = customer.id;
    }

    const subscription = await razorpay.subscriptions.create({
      plan_id: process.env.RAZORPAY_PLAN_ID!,
      customer_notify: 1,
      total_count: 12,
      quantity: 1,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { razorpaySubscriptionId: subscription.id },
    });

    return NextResponse.json(
      {
        subscriptionId: subscription.id,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Subscription create error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
