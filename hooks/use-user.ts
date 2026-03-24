import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export type UserMe = {
  name: string;
  plan: "FREE" | "PRO";
  clientCount: number;
  clientLimit: number | null;
  canAddClient: boolean;
};

export type CreateSubscriptionResponse = {
  subscriptionId: string;
  razorpayKeyId: string;
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

async function createSubscription(): Promise<CreateSubscriptionResponse> {
  const response = await fetch("/api/subscriptions/create", {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw await parseApiError(response, "Failed to create subscription");
  }

  return (await response.json()) as CreateSubscriptionResponse;
}

async function cancelSubscription(): Promise<{ message?: string }> {
  const response = await fetch("/api/subscriptions/cancel", {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw await parseApiError(response, "Failed to cancel subscription");
  }

  return (await response.json()) as { message?: string };
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

export function useCreateSubscription() {
  return useMutation({
    mutationFn: createSubscription,
    onError: (error) => {
      if (
        error instanceof ApiError &&
        error.status === 400 &&
        error.message === "You are already on the Pro plan"
      ) {
        toast.error(error.message);
        return;
      }

      toast.error("Failed to initiate subscription. Please try again.");
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelSubscription,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["user-me"] });
      toast.success(
        "Subscription cancelled. You'll retain Pro access until the end of your billing period.",
      );
    },
    onError: (error) => {
      if (
        error instanceof ApiError &&
        error.status === 400 &&
        (error.message === "You are not on the Pro plan" ||
          error.message === "No active subscription found")
      ) {
        toast.error(error.message);
        return;
      }

      toast.error("Failed to cancel subscription. Please try again.");
    },
  });
}
