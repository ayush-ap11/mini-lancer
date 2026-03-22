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
