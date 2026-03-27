import crypto from "node:crypto";
import Razorpay from "razorpay";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import verifyPortalToken from "@/lib/verify-portal-token";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

type RouteContext = {
  params: Promise<{
    token: string;
    invoiceId: string;
  }>;
};

export async function POST(_request: NextRequest, { params }: RouteContext) {
  try {
    const { token, invoiceId } = await params;

    const { client, error } = await verifyPortalToken(token);

    if (error !== null) {
      return NextResponse.json({ error }, { status: 401 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (invoice.clientId !== client.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (invoice.status === "PAID") {
      return NextResponse.json(
        { error: "Invoice is already paid" },
        { status: 400 },
      );
    }

    const order = await razorpay.orders.create({
      amount: invoice.totalAmount,
      currency: "INR",
      receipt: invoice.invoiceNumber,
    });

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        razorpayOrderId: order.id,
      },
    });

    return NextResponse.json(
      {
        orderId: order.id,
        amount: invoice.totalAmount,
        currency: "INR",
        invoiceNumber: invoice.invoiceNumber,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Pay route error:", JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: "Internal server error", details: JSON.stringify(error) },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { token, invoiceId } = await params;

    const { client, error } = await verifyPortalToken(token);

    if (error !== null) {
      return NextResponse.json({ error }, { status: 401 });
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

    const payload = body as {
      razorpay_payment_id?: string;
      razorpay_order_id?: string;
      razorpay_signature?: string;
    };

    if (
      !payload.razorpay_payment_id ||
      !payload.razorpay_order_id ||
      !payload.razorpay_signature
    ) {
      return NextResponse.json(
        { error: "Invalid payment verification payload" },
        { status: 400 },
      );
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (invoice.clientId !== client.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (invoice.status === "PAID") {
      return NextResponse.json(
        { message: "Invoice already paid" },
        { status: 200 },
      );
    }

    if (
      invoice.razorpayOrderId &&
      invoice.razorpayOrderId !== payload.razorpay_order_id
    ) {
      return NextResponse.json({ error: "Order mismatch" }, { status: 403 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${payload.razorpay_order_id}|${payload.razorpay_payment_id}`)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "utf8");
    const providedBuffer = Buffer.from(payload.razorpay_signature, "utf8");

    if (
      expectedBuffer.length !== providedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, providedBuffer)
    ) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        status: "PAID",
        razorpayOrderId: payload.razorpay_order_id,
      },
    });

    return NextResponse.json({ message: "Payment verified" }, { status: 200 });
  } catch (error) {
    console.error("Portal pay confirm route error:", JSON.stringify(error));
    return NextResponse.json(
      { error: "Internal server error", details: JSON.stringify(error) },
      { status: 500 },
    );
  }
}
