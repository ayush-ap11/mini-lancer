import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";

export type ProjectStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "IN_REVIEW"
  | "COMPLETED";

export type Project = {
  id: string;
  userId: string;
  clientId: string;
  name: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
};

async function fetchProjects(clientId?: string): Promise<Project[]> {
  const params = new URLSearchParams();

  if (clientId) {
    params.set("clientId", clientId);
  }

  const query = params.toString();
  const url = query ? `/api/projects?${query}` : "/api/projects";

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    let message = "Failed to fetch projects";

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

  return (await response.json()) as Project[];
}

type UseProjectsOptions = {
  onError?: (error: Error) => void;
};

export function useProjects(
  clientId?: string,
  options: UseProjectsOptions = {},
) {
  const query = useQuery({
    queryKey: clientId ? ["projects", clientId] : ["projects"],
    queryFn: () => fetchProjects(clientId),
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
        : new Error("Failed to load projects");

    if (lastErrorMessageRef.current === error.message) {
      return;
    }

    lastErrorMessageRef.current = error.message;
    options.onError?.(error);
  }, [query.isError, query.error, options.onError]);

  return query;
}
