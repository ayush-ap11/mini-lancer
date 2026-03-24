import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

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
  lineItems: InvoiceLineItem[];
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  razorpayOrderId: string | null;
};

export type InvoiceLineItem = {
  description: string;
  qty: number;
  rate: number;
};

export type CreateInvoiceInput = {
  clientId: string;
  projectId?: string;
  invoiceNumber: string;
  dueDate: string;
  lineItems: InvoiceLineItem[];
  status?: InvoiceStatus;
};

export type UpdateInvoiceInput = {
  status?: InvoiceStatus;
  dueDate?: string;
  lineItems?: InvoiceLineItem[];
  invoiceNumber?: string;
};

type UpdateInvoiceMutationInput = {
  invoiceId: string;
  data: UpdateInvoiceInput;
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
    throw await parseApiError(response, "Failed to fetch invoices");
  }

  return (await response.json()) as Invoice[];
}

async function fetchInvoice(invoiceId: string): Promise<Invoice> {
  const response = await fetch(`/api/invoices/${invoiceId}`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw await parseApiError(response, "Failed to fetch invoice");
  }

  return (await response.json()) as Invoice;
}

async function createInvoice(payload: CreateInvoiceInput): Promise<Invoice> {
  const response = await fetch("/api/invoices", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parseApiError(response, "Failed to create invoice");
  }

  return (await response.json()) as Invoice;
}

async function updateInvoice({
  invoiceId,
  data,
}: UpdateInvoiceMutationInput): Promise<Invoice> {
  const response = await fetch(`/api/invoices/${invoiceId}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw await parseApiError(response, "Failed to update invoice");
  }

  return (await response.json()) as Invoice;
}

async function deleteInvoice(invoiceId: string): Promise<{ message: string }> {
  const response = await fetch(`/api/invoices/${invoiceId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    throw await parseApiError(response, "Failed to delete invoice");
  }

  return (await response.json()) as { message: string };
}

type UseInvoicesOptions = {
  onError?: (error: Error) => void;
  enabled?: boolean;
};

export function useInvoices(
  filters?: InvoiceFilters,
  options: UseInvoicesOptions = {},
) {
  const query = useQuery({
    queryKey: filters ? ["invoices", filters] : ["invoices"],
    queryFn: () => fetchInvoices(filters),
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
        : new Error("Failed to load invoices");

    if (lastErrorMessageRef.current === error.message) {
      return;
    }

    lastErrorMessageRef.current = error.message;
    options.onError?.(error);
  }, [query.isError, query.error, options.onError]);

  return query;
}

export function useInvoice(invoiceId: string) {
  return useQuery({
    queryKey: ["invoices", invoiceId],
    queryFn: () => fetchInvoice(invoiceId),
    enabled: !!invoiceId,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInvoice,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice created successfully");
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Failed to create invoice";
      toast.error(message);
    },
  });
}

export function useUpdateInvoice(invoiceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateInvoiceInput) =>
      updateInvoice({
        invoiceId,
        data,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["invoices"] }),
        queryClient.invalidateQueries({ queryKey: ["invoices", invoiceId] }),
      ]);
      toast.success("Invoice updated");
    },
    onError: (error) => {
      if (
        error instanceof ApiError &&
        error.status === 400 &&
        error.message === "Cannot edit a paid invoice"
      ) {
        toast.error("Cannot edit a paid invoice");
        return;
      }

      const message =
        error instanceof Error ? error.message : "Failed to update invoice";
      toast.error(message);
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  return useMutation({
    mutationFn: (invoiceId: string) => deleteInvoice(invoiceId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice deleted");

      if (/^\/(dashboard\/)?invoices\/[^/]+$/.test(pathname)) {
        router.push("/invoices");
      }
    },
    onError: (error) => {
      if (
        error instanceof ApiError &&
        error.status === 400 &&
        error.message === "Only draft invoices can be deleted"
      ) {
        toast.error("Only draft invoices can be deleted");
        return;
      }

      const message =
        error instanceof Error ? error.message : "Failed to delete invoice";
      toast.error(message);
    },
  });
}
