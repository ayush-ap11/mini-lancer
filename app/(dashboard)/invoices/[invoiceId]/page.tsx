"use client";

import { FileX } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import EditInvoiceDialog from "@/components/invoices/edit-invoice-dialog";
import InvoiceActionsBar from "@/components/invoices/invoice-actions-bar";
import InvoiceDetailSkeleton from "@/components/invoices/invoice-detail-skeleton";
import InvoiceDocument from "@/components/invoices/invoice-document";
import { Button } from "@/components/ui/Button";
import { useClients } from "@/hooks/use-clients";
import {
  type InvoiceStatus,
  useDeleteInvoice,
  useInvoice,
  useUpdateInvoice,
} from "@/hooks/use-invoices";
import { useUserMe } from "@/hooks/use-user";

type InvoiceDetailPageProps = {
  params: Promise<{
    invoiceId: string;
  }>;
};

export default function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const { invoiceId } = use(params);
  const router = useRouter();

  const [editOpen, setEditOpen] = useState(false);

  const invoiceQuery = useInvoice(invoiceId);
  const clientsQuery = useClients();
  const userQuery = useUserMe();

  const updateInvoiceMutation = useUpdateInvoice(invoiceId);
  const deleteInvoiceMutation = useDeleteInvoice();

  if (invoiceQuery.isLoading || clientsQuery.isLoading || userQuery.isLoading) {
    return <InvoiceDetailSkeleton />;
  }

  const invoiceStatus =
    typeof invoiceQuery.error === "object" &&
    invoiceQuery.error !== null &&
    "status" in invoiceQuery.error
      ? Number(invoiceQuery.error.status)
      : undefined;

  if (invoiceStatus === 404 || !invoiceQuery.data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <FileX className="size-12 text-muted-foreground/70" />
        <h1 className="mt-4 text-2xl font-semibold text-foreground">
          Invoice not found
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This invoice doesn't exist or you don't have access
        </p>
        <Link href="/invoices" className="mt-4">
          <Button>Back to Invoices</Button>
        </Link>
      </div>
    );
  }

  const invoice = invoiceQuery.data;

  const client =
    clientsQuery.data?.find((item) => item.id === invoice.clientId) ?? null;

  const freelancerName = userQuery.data?.name?.trim() || "Freelancer";

  if (!client) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <FileX className="size-12 text-muted-foreground/70" />
        <h1 className="mt-4 text-2xl font-semibold text-foreground">
          Invoice not found
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This invoice doesn't exist or you don't have access
        </p>
        <Link href="/invoices" className="mt-4">
          <Button>Back to Invoices</Button>
        </Link>
      </div>
    );
  }

  const handleEdit = () => setEditOpen(true);

  const handleDelete = () => {
    deleteInvoiceMutation.mutate(invoiceId, {
      onSuccess: () => {
        router.push("/invoices");
      },
    });
  };

  const handleStatusChange = (status: InvoiceStatus) => {
    updateInvoiceMutation.mutate({ status });
  };

  const isUpdating =
    updateInvoiceMutation.isPending || deleteInvoiceMutation.isPending;

  return (
    <div className="space-y-4">
      <InvoiceActionsBar
        invoice={invoice}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
        isUpdating={isUpdating}
      />

      <InvoiceDocument
        invoice={invoice}
        client={client}
        freelancerName={freelancerName}
      />

      <EditInvoiceDialog
        invoice={invoice}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </div>
  );
}
