import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [user, clientCount] = await prisma.$transaction([
    prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, name: true },
    }),
    prisma.client.count({
      where: { userId },
    }),
  ]);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const isFreePlan = user.plan === "FREE";

  return NextResponse.json(
    {
      plan: user.plan,
      name: user.name,
      clientCount,
      clientLimit: isFreePlan ? 3 : null,
      canAddClient: isFreePlan ? clientCount < 3 : true,
    },
    { status: 200 },
  );
}
