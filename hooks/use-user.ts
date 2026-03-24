import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

export type UserMe = {
  name: string;
  plan: "FREE" | "PRO";
  clientCount: number;
  clientLimit: number | null;
  canAddClient: boolean;
};

async function fetchUserMe(): Promise<UserMe> {
  const response = await fetch("/api/users/me", {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    let message = "Failed to fetch user profile";

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

  return (await response.json()) as UserMe;
}

type UseUserMeOptions = {
  onError?: (error: Error) => void;
};

export function useUserMe(options: UseUserMeOptions = {}) {
  const query = useQuery({
    queryKey: ["user-me"],
    queryFn: fetchUserMe,
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
        : new Error("Failed to load user");

    if (lastErrorMessageRef.current === error.message) {
      return;
    }

    lastErrorMessageRef.current = error.message;
    options.onError?.(error);
  }, [query.isError, query.error, options.onError]);

  return query;
}
