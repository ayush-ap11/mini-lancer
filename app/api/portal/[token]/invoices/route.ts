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

  const invoices = await prisma.invoice.findMany({
    where: { clientId: client.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(invoices, { status: 200 });
}
