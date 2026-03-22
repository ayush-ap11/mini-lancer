import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import verifyPortalToken from "@/lib/verify-portal-token";

type RouteContext = {
  params: Promise<{
    token: string;
  }>;
};

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { token } = await params;

  const { client, error } = await verifyPortalToken(token);

  if (error !== null) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: { clientId: client.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(projects, { status: 200 });
}
