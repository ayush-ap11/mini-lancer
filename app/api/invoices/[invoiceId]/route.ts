import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import prisma from "@/lib/prisma";

const invoiceStatusSchema = z.enum(["DRAFT", "PENDING", "PAID", "OVERDUE"]);

const updateInvoiceSchema = z.object({
  invoiceNumber: z.string().optional(),
  dueDate: z.string().optional(),
  status: invoiceStatusSchema.optional(),
  lineItems: z
    .array(
      z.object({
        description: z.string(),
        qty: z.number(),
        rate: z.number(),
      }),
    )
    .optional(),
});

type RouteContext = {
  params: Promise<{
    invoiceId: string;
  }>;
};

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { invoiceId } = await params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  if (invoice.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(invoice, { status: 200 });
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { invoiceId } = await params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  if (invoice.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (invoice.status === "PAID") {
    return NextResponse.json(
      { error: "Cannot edit a paid invoice" },
      { status: 400 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = updateInvoiceSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data: {
    invoiceNumber?: string;
    dueDate?: Date;
    status?: "DRAFT" | "PENDING" | "PAID" | "OVERDUE";
    lineItems?: Array<{ description: string; qty: number; rate: number }>;
    totalAmount?: number;
  } = {
    ...(parsed.data.invoiceNumber
      ? { invoiceNumber: parsed.data.invoiceNumber }
      : {}),
    ...(parsed.data.dueDate ? { dueDate: new Date(parsed.data.dueDate) } : {}),
    ...(parsed.data.status ? { status: parsed.data.status } : {}),
    ...(parsed.data.lineItems ? { lineItems: parsed.data.lineItems } : {}),
  };

  if (parsed.data.lineItems) {
    const total = parsed.data.lineItems.reduce(
      (sum, item) => sum + item.qty * item.rate,
      0,
    );
    data.totalAmount = Math.round(total * 100);
  }

  const updatedInvoice = await prisma.invoice.update({
    where: { id: invoiceId },
    data,
  });

  return NextResponse.json(updatedInvoice, { status: 200 });
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const { invoiceId } = await params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  if (invoice.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (invoice.status !== "DRAFT") {
    return NextResponse.json(
      { error: "Only draft invoices can be deleted" },
      { status: 400 },
    );
  }

  await prisma.invoice.delete({
    where: { id: invoiceId },
  });

  return NextResponse.json(
    { message: "Invoice deleted successfully" },
    { status: 200 },
  );
}
