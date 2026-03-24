"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export type PortalProjectStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "IN_REVIEW"
  | "COMPLETED";

export type PortalProject = {
  id: string;
  userId: string;
  clientId: string;
  name: string;
  status: PortalProjectStatus;
  createdAt: string;
  updatedAt: string;
};

export type PortalInvoiceStatus = "DRAFT" | "PENDING" | "PAID" | "OVERDUE";

export type PortalInvoiceLineItem = {
  description: string;
  qty: number;
  rate: number;
};

export type PortalInvoice = {
  id: string;
  userId: string;
  clientId: string;
  projectId: string | null;
  invoiceNumber: string;
  status: PortalInvoiceStatus;
  totalAmount: number;
  lineItems: PortalInvoiceLineItem[];
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  razorpayOrderId: string | null;
};

export type PortalPayResponse = {
  orderId: string;
  amount: number;
  currency: string;
  invoiceNumber: string;
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

async function fetchPortalProjects(token: string): Promise<PortalProject[]> {
  const response = await fetch(`/api/portal/${token}/projects`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw await parseApiError(response, "Failed to fetch portal projects");
  }

  return (await response.json()) as PortalProject[];
}

async function fetchPortalInvoices(token: string): Promise<PortalInvoice[]> {
  const response = await fetch(`/api/portal/${token}/invoices`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw await parseApiError(response, "Failed to fetch portal invoices");
  }

  return (await response.json()) as PortalInvoice[];
}

async function portalPay(
  token: string,
  invoiceId: string,
): Promise<PortalPayResponse> {
  const response = await fetch(`/api/portal/${token}/pay/${invoiceId}`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw await parseApiError(response, "Failed to initiate payment");
  }

  return (await response.json()) as PortalPayResponse;
}

function usePortalUnauthorizedRedirect(error: unknown) {
  const router = useRouter();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (hasRedirectedRef.current) {
      return;
    }

    if (error instanceof ApiError && error.status === 401) {
      hasRedirectedRef.current = true;
      router.push("/portal/invalid");
    }
  }, [error, router]);
}

export function usePortalProjects(token: string) {
  const query = useQuery({
    queryKey: ["portal-projects", token],
    queryFn: () => fetchPortalProjects(token),
    enabled: !!token,
  });

  usePortalUnauthorizedRedirect(query.error);

  return query;
}

export function usePortalInvoices(token: string) {
  const query = useQuery({
    queryKey: ["portal-invoices", token],
    queryFn: () => fetchPortalInvoices(token),
    enabled: !!token,
  });

  usePortalUnauthorizedRedirect(query.error);

  return query;
}

export function usePortalPay(token: string) {
  return useMutation({
    mutationFn: (invoiceId: string) => portalPay(token, invoiceId),
    onError: () => {
      toast.error("Failed to initiate payment. Please try again.");
    },
  });
}
