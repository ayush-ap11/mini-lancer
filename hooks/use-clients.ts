import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

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

export type CreateClientInput = {
  name: string;
  email: string;
  companyName?: string;
};

export type UpdateClientInput = {
  name?: string;
  email?: string;
  companyName?: string;
};

type MagicLinkResponse = {
  message: string;
  expiresAt: string;
};

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const FREE_PLAN_LIMIT_MESSAGE =
  "Free plan limit reached. Upgrade to Pro to add more clients.";

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

async function fetchClients(): Promise<Client[]> {
  const response = await fetch("/api/clients", {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw await parseApiError(response, "Failed to fetch clients");
  }

  return (await response.json()) as Client[];
}

async function fetchClient(clientId: string): Promise<Client> {
  const response = await fetch(`/api/clients/${clientId}`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw await parseApiError(response, "Failed to fetch client");
  }

  return (await response.json()) as Client;
}

async function createClient(payload: CreateClientInput): Promise<Client> {
  const response = await fetch("/api/clients", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseApiError(response, "Failed to create client");
  }

  return (await response.json()) as Client;
}

async function updateClient(
  clientId: string,
  payload: UpdateClientInput,
): Promise<Client> {
  const response = await fetch(`/api/clients/${clientId}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseApiError(response, "Failed to update client");
  }

  return (await response.json()) as Client;
}

async function deleteClient(clientId: string): Promise<{ message: string }> {
  const response = await fetch(`/api/clients/${clientId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    throw await parseApiError(response, "Failed to delete client");
  }

  return (await response.json()) as { message: string };
}

async function sendMagicLink(clientId: string): Promise<MagicLinkResponse> {
  const response = await fetch(`/api/clients/${clientId}/magic-link`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw await parseApiError(response, "Failed to send magic link");
  }

  return (await response.json()) as MagicLinkResponse;
}

type UseClientsOptions = {
  onError?: (error: Error) => void;
};

type UseCreateClientOptions = {
  onSuccess?: (client: Client) => void;
  onError?: (error: Error) => void;
  suppressDefaultErrorToast?: boolean;
};

type UseSendMagicLinkOptions = {
  onSuccess?: (result: MagicLinkResponse) => void;
  onError?: (error: Error) => void;
  suppressDefaultToasts?: boolean;
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

export function useClient(clientId: string) {
  return useQuery({
    queryKey: ["clients", clientId],
    queryFn: () => fetchClient(clientId),
    enabled: !!clientId,
  });
}

export function useCreateClient(options: UseCreateClientOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createClient,
    onSuccess: async (client) => {
      await queryClient.invalidateQueries({ queryKey: ["clients"] });
      options.onSuccess?.(client);
    },
    onError: (error) => {
      options.onError?.(
        error instanceof Error ? error : new Error("Unknown error"),
      );

      if (options.suppressDefaultErrorToast) {
        return;
      }

      const message =
        error instanceof ApiError &&
        (error.status === 403 || error.message === FREE_PLAN_LIMIT_MESSAGE)
          ? FREE_PLAN_LIMIT_MESSAGE
          : error instanceof Error
            ? error.message
            : "Failed to create client";

      toast.error(message);
    },
  });
}

export function useUpdateClient(clientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateClientInput) => updateClient(clientId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["clients"] }),
        queryClient.invalidateQueries({ queryKey: ["clients", clientId] }),
      ]);
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  return useMutation({
    mutationFn: (clientId: string) => deleteClient(clientId),
    onSuccess: async (_result, clientId) => {
      await queryClient.invalidateQueries({ queryKey: ["clients"] });

      const isClientDetailPage = pathname === `/dashboard/clients/${clientId}`;

      if (isClientDetailPage) {
        router.push("/dashboard/clients");
      }
    },
  });
}

export function useSendMagicLink(
  clientId: string,
  options: UseSendMagicLinkOptions = {},
) {
  return useMutation({
    mutationFn: () => sendMagicLink(clientId),
    onSuccess: (data) => {
      options.onSuccess?.(data);

      if (options.suppressDefaultToasts) {
        return;
      }

      const formattedExpiryDate = new Date(data.expiresAt).toLocaleDateString(
        "en-IN",
        {
          year: "numeric",
          month: "short",
          day: "numeric",
        },
      );

      toast.success(`Magic link sent! Expires on ${formattedExpiryDate}.`);
    },
    onError: (error) => {
      const normalizedError =
        error instanceof Error ? error : new Error("Failed to send magic link");

      options.onError?.(normalizedError);

      if (options.suppressDefaultToasts) {
        return;
      }

      const message = normalizedError.message || "Failed to send magic link";
      toast.error(message);
    },
  });
}
