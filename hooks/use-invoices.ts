import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";

export type InvoiceStatus = "DRAFT" | "PENDING" | "PAID" | "OVERDUE";

export type InvoiceFilters = {
  clientId?: string;
  status?: string;
};

export type Invoice = {
  id: string;
  userId: string;
  clientId: string;
  projectId: string | null;
  invoiceNumber: string;
  status: InvoiceStatus;
  totalAmount: number;
  lineItems: unknown;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  razorpayOrderId: string | null;
};

async function fetchInvoices(filters?: InvoiceFilters): Promise<Invoice[]> {
  const params = new URLSearchParams();

  if (filters?.clientId) {
    params.set("clientId", filters.clientId);
  }

  if (filters?.status) {
    params.set("status", filters.status);
  }

  const query = params.toString();
  const url = query ? `/api/invoices?${query}` : "/api/invoices";

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    let message = "Failed to fetch invoices";

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

  return (await response.json()) as Invoice[];
}

type UseInvoicesOptions = {
  onError?: (error: Error) => void;
};

export function useInvoices(
  filters?: InvoiceFilters,
  options: UseInvoicesOptions = {},
) {
  const query = useQuery({
    queryKey: filters ? ["invoices", filters] : ["invoices"],
    queryFn: () => fetchInvoices(filters),
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
        : new Error("Failed to load invoices");

    if (lastErrorMessageRef.current === error.message) {
      return;
    }

    lastErrorMessageRef.current = error.message;
    options.onError?.(error);
  }, [query.isError, query.error, options.onError]);

  return query;
}
