import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

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

export type CreateProjectInput = {
  name: string;
  clientId: string;
  status?: ProjectStatus;
};

export type UpdateProjectInput = {
  name?: string;
  status?: ProjectStatus;
};

type UpdateProjectMutationInput = {
  projectId: string;
  data: UpdateProjectInput;
};

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function parseApiError(
  response: Response,
  fallbackMessage: string,
): Promise<ApiError> {
  let message = fallbackMessage;

  try {
    const body = (await response.json()) as { error?: string };
    if (typeof body?.error === "string" && body.error.trim().length > 0) {
      message = body.error;
    }
  } catch {
    // no-op
  }

  return new ApiError(message, response.status);
}

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
    throw await parseApiError(response, "Failed to fetch projects");
  }

  return (await response.json()) as Project[];
}

async function createProject(payload: CreateProjectInput): Promise<Project> {
  const response = await fetch("/api/projects", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseApiError(response, "Failed to create project");
  }

  return (await response.json()) as Project;
}

async function updateProject({
  projectId,
  data,
}: UpdateProjectMutationInput): Promise<Project> {
  const response = await fetch(`/api/projects/${projectId}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw await parseApiError(response, "Failed to update project");
  }

  return (await response.json()) as Project;
}

async function deleteProject(projectId: string): Promise<{ message: string }> {
  const response = await fetch(`/api/projects/${projectId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    throw await parseApiError(response, "Failed to delete project");
  }

  return (await response.json()) as { message: string };
}

type UseProjectsOptions = {
  onError?: (error: Error) => void;
  enabled?: boolean;
};

type UseCreateProjectOptions = {
  onSuccess?: (project: Project) => void;
  onError?: (error: Error) => void;
  suppressDefaultToasts?: boolean;
};

export function useProjects(
  clientId?: string,
  options: UseProjectsOptions = {},
) {
  const query = useQuery({
    queryKey: clientId ? ["projects", { clientId }] : ["projects"],
    queryFn: () => fetchProjects(clientId),
    enabled: options.enabled ?? true,
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

export function useCreateProject(options: UseCreateProjectOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProject,
    onSuccess: async (project) => {
      await queryClient.invalidateQueries({ queryKey: ["projects"] });

      options.onSuccess?.(project);

      if (!options.suppressDefaultToasts) {
        toast.success("Project created successfully");
      }
    },
    onError: (error) => {
      const normalizedError =
        error instanceof Error ? error : new Error("Failed to create project");

      options.onError?.(normalizedError);

      if (options.suppressDefaultToasts) {
        return;
      }

      if (error instanceof ApiError && error.status === 404) {
        toast.error("Client not found");
        return;
      }

      const message =
        error instanceof Error ? error.message : "Failed to create project";
      toast.error(message);
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProject,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProject,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted");
    },
  });
}
