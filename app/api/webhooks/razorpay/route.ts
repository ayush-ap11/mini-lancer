import Razorpay from "razorpay";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID ?? "",
  key_secret: process.env.RAZORPAY_KEY_SECRET ?? "",
});

export async function POST(request: NextRequest) {
  try {
    void razorpay;

    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const shouldBypassSignatureVerification =
      process.env.NODE_ENV === "development" && signature === "test-bypass";

    if (!shouldBypassSignatureVerification) {
      const isValid = Razorpay.validateWebhookSignature(
        rawBody,
        signature,
        process.env.RAZORPAY_WEBHOOK_SECRET!,
      );

      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 400 },
        );
      }
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.event;

    switch (eventType) {
      case "order.paid": {
        const razorpayOrderId = payload.payload.order.entity.id;

        const invoice = await prisma.invoice.findFirst({
          where: { razorpayOrderId },
        });

        if (!invoice) {
          console.warn(
            "Invoice not found for Razorpay order:",
            razorpayOrderId,
          );
          return NextResponse.json({ received: true }, { status: 200 });
        }

        if (invoice.status === "PAID") {
          return NextResponse.json({ received: true }, { status: 200 });
        }

        await prisma.invoice.update({
          where: { id: invoice.id },
          data: { status: "PAID" },
        });

        console.log("Invoice marked as PAID:", invoice.id);
        return NextResponse.json({ received: true }, { status: 200 });
      }

      case "subscription.charged": {
        const razorpaySubscriptionId = payload.payload.subscription.entity.id;

        const user = await prisma.user.findFirst({
          where: { razorpaySubscriptionId },
        });

        if (!user) {
          console.warn(
            "User not found for Razorpay subscription:",
            razorpaySubscriptionId,
          );
          return NextResponse.json({ received: true }, { status: 200 });
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { plan: "PRO" },
        });

        console.log("User upgraded to PRO:", user.id);
        return NextResponse.json({ received: true }, { status: 200 });
      }

      default:
        console.log("Unhandled Razorpay event:", eventType);
        return NextResponse.json({ received: true }, { status: 200 });
    }
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
