import { auth } from "@clerk/nextjs/server";
import Razorpay from "razorpay";
import { NextRequest, NextResponse } from "next/server";
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

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.plan !== "PRO") {
      return NextResponse.json(
        { error: "You are not on the Pro plan" },
        { status: 400 },
      );
    }

    if (!user.razorpaySubscriptionId) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 400 },
      );
    }

    await razorpay.subscriptions.cancel(user.razorpaySubscriptionId);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        plan: "FREE",
        razorpaySubscriptionId: null,
      },
    });

    return NextResponse.json(
      { message: "Subscription cancelled successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Subscription cancel error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
