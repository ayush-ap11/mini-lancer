import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ensureUserExists } from "@/lib/ensure-user";
import prisma from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await ensureUserExists(userId);

  const clientCount = await prisma.client.count({
    where: { userId },
  });

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
