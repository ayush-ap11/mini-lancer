import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { ensureUserExists } from "@/lib/ensure-user";
import prisma from "@/lib/prisma";

const createProjectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  clientId: z.string(),
  status: z
    .enum(["NOT_STARTED", "IN_PROGRESS", "IN_REVIEW", "COMPLETED"])
    .optional(),
});

export async function GET(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientId = request.nextUrl.searchParams.get("clientId");

  const projects = await prisma.project.findMany({
    where: clientId ? { userId, clientId } : { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(projects, { status: 200 });
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureUserExists(userId);

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createProjectSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const client = await prisma.client.findUnique({
    where: { id: parsed.data.clientId },
  });

  if (!client || client.userId !== userId) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const project = await prisma.project.create({
    data: {
      userId,
      name: parsed.data.name,
      clientId: parsed.data.clientId,
      ...(parsed.data.status ? { status: parsed.data.status } : {}),
    },
  });

  return NextResponse.json(project, { status: 201 });
}
