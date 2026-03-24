import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";

export type Client = {
  id: string;
  userId: string;
  name: string;
  email: string;
  companyName: string | null;
  magicLinkToken: string | null;
  tokenExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

async function fetchClients(): Promise<Client[]> {
  const response = await fetch("/api/clients", {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    let message = "Failed to fetch clients";

    try {
      const body = (await response.json()) as { error?: string };
      if (body?.error) {
        message = body.error;
      }
    } catch {
      // no-op
    }

    throw new Error(message);
  }

  return (await response.json()) as Client[];
}

type UseClientsOptions = {
  onError?: (error: Error) => void;
};

export function useClients(options: UseClientsOptions = {}) {
  const query = useQuery({
    queryKey: ["clients"],
    queryFn: fetchClients,
  });

  const lastErrorMessageRef = useRef<string | null>(null);

  useEffect(() => {
    if (!query.isError) {
      lastErrorMessageRef.current = null;
      return;
    }

    const error =
      query.error instanceof Error
        ? query.error
        : new Error("Failed to load clients");

    if (lastErrorMessageRef.current === error.message) {
      return;
    }

    lastErrorMessageRef.current = error.message;
    options.onError?.(error);
  }, [query.isError, query.error, options.onError]);

  return query;
}
