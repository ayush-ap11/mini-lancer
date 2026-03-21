import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const updateClientSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  companyName: z.string().optional(),
});

type RouteContext = {
  params: Promise<{
    clientId: string;
  }>;
};

export async function GET(_req: NextRequest, { params }: RouteContext) {
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

  return NextResponse.json(client, { status: 200 });
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
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

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = updateClientSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const updatedClient = await prisma.client.update({
    where: { id: clientId },
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      companyName: parsed.data.companyName,
    },
  });

  return NextResponse.json(updatedClient, { status: 200 });
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
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

  await prisma.client.delete({
    where: { id: clientId },
  });

  return NextResponse.json(
    { message: "Client deleted successfully" },
    { status: 200 },
  );
}
