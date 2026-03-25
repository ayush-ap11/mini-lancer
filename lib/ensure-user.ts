import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

function getPrimaryEmail(user: Awaited<ReturnType<typeof currentUser>>) {
  if (!user) {
    return null;
  }

  const emailFromPrimaryId = user.emailAddresses.find(
    (emailAddress) => emailAddress.id === user.primaryEmailAddressId,
  )?.emailAddress;

  return emailFromPrimaryId ?? user.emailAddresses[0]?.emailAddress ?? null;
}

export async function ensureUserExists(userId: string) {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (existingUser) {
    return existingUser;
  }

  const clerkUser = await currentUser();
  const email = getPrimaryEmail(clerkUser);

  if (!email) {
    throw new Error("Unable to resolve authenticated user email");
  }

  const fullName =
    `${clerkUser?.firstName ?? ""} ${clerkUser?.lastName ?? ""}`.trim();
  const name = fullName || clerkUser?.username || email;

  return prisma.user.create({
    data: {
      id: userId,
      email,
      name,
      plan: "FREE",
    },
  });
}
