import type { Client } from "@/hooks/use-clients";

type ClientPortalFields = Pick<Client, "magicLinkToken" | "tokenExpiresAt">;

export function getClientPortalPath(token: string) {
  return `/portal/${token}`;
}

export function getClientPortalState(client: ClientPortalFields) {
  if (!client.magicLinkToken || !client.tokenExpiresAt) {
    return {
      isActive: false,
      portalPath: null,
      expiresAt: null,
    };
  }

  const expiresAt = new Date(client.tokenExpiresAt);

  if (Number.isNaN(expiresAt.getTime())) {
    return {
      isActive: false,
      portalPath: null,
      expiresAt: null,
    };
  }

  const isActive = expiresAt.getTime() > Date.now();

  return {
    isActive,
    portalPath: isActive ? getClientPortalPath(client.magicLinkToken) : null,
    expiresAt,
  };
}
