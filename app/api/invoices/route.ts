import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import prisma from "@/lib/prisma";

const invoiceStatusSchema = z.enum(["DRAFT", "PENDING", "PAID", "OVERDUE"]);

const createInvoiceSchema = z.object({
  clientId: z.string(),
  projectId: z.string().optional(),
  invoiceNumber: z.string(),
  dueDate: z.string(),
  lineItems: z.array(
    z.object({
      description: z.string(),
      qty: z.number().min(1),
      rate: z.number().min(0),
    }),
  ),
  status: invoiceStatusSchema.optional(),
});

export async function GET(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientId = request.nextUrl.searchParams.get("clientId");
  const statusParam = request.nextUrl.searchParams.get("status");
  const parsedStatus = invoiceStatusSchema.safeParse(statusParam);
  const status = parsedStatus.success ? parsedStatus.data : undefined;

  const invoices = await prisma.invoice.findMany({
    where: {
      userId,
      ...(clientId ? { clientId } : {}),
      ...(status ? { status } : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(invoices, { status: 200 });
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createInvoiceSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const client = await prisma.client.findUnique({
    where: {
      id: parsed.data.clientId,
    },
  });

  if (!client || client.userId !== userId) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  if (parsed.data.projectId) {
    const project = await prisma.project.findUnique({
      where: {
        id: parsed.data.projectId,
      },
    });

    if (!project || project.userId !== userId) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
  }

  const total = parsed.data.lineItems.reduce(
    (sum, item) => sum + item.qty * item.rate,
    0,
  );
  const totalAmount = Math.round(total * 100);

  const invoice = await prisma.invoice.create({
    data: {
      userId,
      clientId: parsed.data.clientId,
      ...(parsed.data.projectId ? { projectId: parsed.data.projectId } : {}),
      invoiceNumber: parsed.data.invoiceNumber,
      dueDate: new Date(parsed.data.dueDate),
      lineItems: parsed.data.lineItems,
      totalAmount,
      ...(parsed.data.status ? { status: parsed.data.status } : {}),
    },
  });

  return NextResponse.json(invoice, { status: 201 });
}
