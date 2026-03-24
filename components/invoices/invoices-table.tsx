"use client";

import { AlertCircle, Eye, Receipt, SearchX, Trash2 } from "lucide-react";
import Link from "next/link";
import InvoiceStatusBadge from "@/components/invoices/invoice-status-badge";
import InvoicesTableSkeleton from "@/components/invoices/invoices-table-skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/Button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Client } from "@/hooks/use-clients";
import type { Invoice } from "@/hooks/use-invoices";
import { useDeleteInvoice } from "@/hooks/use-invoices";
import { formatCurrency } from "@/lib/format-currency";

type InvoicesTableProps = {
  invoices: Invoice[];
  clients: Client[];
  isLoading: boolean;
  hasActiveFilters?: boolean;
  onCreateInvoice?: () => void;
  onClearFilters?: () => void;
};

function formatDueDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function InvoicesTable({
  invoices,
  clients,
  isLoading,
  hasActiveFilters = false,
  onCreateInvoice,
  onClearFilters,
}: InvoicesTableProps) {
  const deleteInvoiceMutation = useDeleteInvoice();

  const handleDelete = async (invoiceId: string) => {
    try {
      await deleteInvoiceMutation.mutateAsync(invoiceId);
    } catch {
      // Toast handled in hook
    }
  };

  return (
    <section className="rounded-xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-190 text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="px-4 py-3 font-medium">Invoice #</th>
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="px-4 py-3 text-right font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Due Date</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>

          {isLoading ? (
            <InvoicesTableSkeleton />
          ) : invoices.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={6} className="px-4 py-16">
                  {hasActiveFilters ? (
                    <div className="flex flex-col items-center justify-center text-center">
                      <SearchX className="size-12 text-muted-foreground/70" />
                      <h3 className="mt-4 text-xl font-semibold text-foreground">
                        No invoices match your filters
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Try adjusting your search or filters
                      </p>
                      <Button
                        variant="ghost"
                        className="mt-4"
                        onClick={onClearFilters}
                      >
                        Clear filters
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center">
                      <Receipt className="size-16 text-muted-foreground/70" />
                      <h3 className="mt-4 text-xl font-semibold text-foreground">
                        No invoices yet
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Create your first invoice to start getting paid
                      </p>
                      <Button className="mt-4" onClick={onCreateInvoice}>
                        Create Invoice
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {invoices.map((invoice) => {
                const clientName =
                  clients.find((client) => client.id === invoice.clientId)
                    ?.name ?? "Unknown Client";

                const isOverdue =
                  invoice.status === "PENDING" &&
                  new Date(invoice.dueDate) < new Date();

                return (
                  <tr
                    key={invoice.id}
                    className="border-b border-border/60 transition-colors hover:bg-muted/50 last:border-b-0"
                  >
                    <td className="cursor-pointer px-4 py-3">
                      <Link
                        href={`/invoices/${invoice.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {invoice.invoiceNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {clientName}
                    </td>
                    <td className="px-4 py-3 text-right text-foreground">
                      {formatCurrency(invoice.totalAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <InvoiceStatusBadge status={invoice.status} size="sm" />
                    </td>
                    <td
                      className={[
                        "px-4 py-3",
                        isOverdue ? "text-red-500" : "text-muted-foreground",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-1.5">
                        {isOverdue ? <AlertCircle className="size-4" /> : null}
                        <span>{formatDueDate(invoice.dueDate)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="ml-auto flex w-fit items-center gap-1">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          aria-label={`View ${invoice.invoiceNumber}`}
                        >
                          <Button type="button" variant="ghost" size="icon">
                            <Eye className="size-4" />
                          </Button>
                        </Link>

                        {invoice.status !== "DRAFT" ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    disabled
                                    aria-label={`Delete ${invoice.invoiceNumber}`}
                                  >
                                    <Trash2 className="size-4" />
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                Only draft invoices can be deleted
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                aria-label={`Delete ${invoice.invoiceNumber}`}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete invoice?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will
                                  permanently delete invoice{" "}
                                  {invoice.invoiceNumber}.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel
                                  disabled={deleteInvoiceMutation.isPending}
                                >
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={(event) => {
                                    event.preventDefault();
                                    void handleDelete(invoice.id);
                                  }}
                                  disabled={deleteInvoiceMutation.isPending}
                                  className="bg-destructive text-white hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          )}
        </table>
      </div>
    </section>
  );
}
