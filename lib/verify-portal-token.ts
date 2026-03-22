import prisma from "@/lib/prisma";

export async function verifyPortalToken(token: string) {
  const client = await prisma.client.findFirst({
    where: { magicLinkToken: token },
  });

  if (!client) {
    return { client: null, error: "Invalid token" };
  }

  if (!client.tokenExpiresAt || new Date() > client.tokenExpiresAt) {
    return { client: null, error: "Token expired" };
  }

  return { client, error: null };
}

export default verifyPortalToken;
