import { FileText } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Client } from "@/hooks/use-clients";
import type { Invoice } from "@/hooks/use-invoices";

type RecentInvoicesTableProps = {
  invoices: Invoice[];
  clients: Client[];
  isLoading: boolean;
};

const RECENT_INVOICE_SKELETON_KEYS = [
  "recent-invoice-row-1",
  "recent-invoice-row-2",
  "recent-invoice-row-3",
  "recent-invoice-row-4",
  "recent-invoice-row-5",
] as const;

function getRecentInvoices(invoices: Invoice[]) {
  return invoices.slice(-5).reverse();
}

function formatCurrency(amountInPaise: number) {
  return `₹${(amountInPaise / 100).toLocaleString("en-IN")}`;
}

function formatDueDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getClientNameById(clientId: string, clients: Client[]) {
  const client = clients.find((item) => item.id === clientId);
  return client?.name ?? "Unknown Client";
}

function getBadgeVariant(
  status: Invoice["status"],
): "secondary" | "warning" | "success" | "destructive" {
  if (status === "DRAFT") return "secondary";
  if (status === "PENDING") return "warning";
  if (status === "PAID") return "success";
  return "destructive";
}

function LoadingRows() {
  return (
    <div className="space-y-3">
      {RECENT_INVOICE_SKELETON_KEYS.map((skeletonKey) => (
        <div
          key={skeletonKey}
          className="grid grid-cols-[1fr_1.2fr_0.9fr_0.9fr_1fr] items-center gap-3 border-b border-border/60 pb-3 last:border-0"
        >
          <Skeleton className="h-4 w-18" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <FileText className="size-10 text-muted-foreground/60" />
      <h3 className="mt-3 text-base font-semibold text-foreground">
        No invoices yet
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Create your first invoice to see it here
      </p>
      <Link
        href="/invoices"
        className="mt-4 inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
      >
        Create Invoice
      </Link>
    </div>
  );
}

export default function RecentInvoicesTable({
  invoices,
  clients,
  isLoading,
}: RecentInvoicesTableProps) {
  const recentInvoices = getRecentInvoices(invoices);

  return (
    <Card>
      <CardHeader>
        <h2 className="text-base font-semibold text-foreground">
          Recent Invoices
        </h2>
      </CardHeader>

      <CardContent className="pt-4">
        {isLoading ? (
          <LoadingRows />
        ) : recentInvoices.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-140 text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-2 py-2 font-medium">Invoice #</th>
                  <th className="px-2 py-2 font-medium">Client</th>
                  <th className="px-2 py-2 font-medium">Amount</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                  <th className="px-2 py-2 font-medium">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map((invoice) => {
                  const isOverdue =
                    invoice.status === "PENDING" &&
                    new Date(invoice.dueDate) < new Date();

                  return (
                    <tr
                      key={invoice.id}
                      className="border-b border-border/60 last:border-0"
                    >
                      <td className="px-2 py-3">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {invoice.invoiceNumber}
                        </Link>
                      </td>
                      <td className="px-2 py-3 text-muted-foreground">
                        {getClientNameById(invoice.clientId, clients)}
                      </td>
                      <td className="px-2 py-3 text-foreground">
                        {formatCurrency(invoice.totalAmount)}
                      </td>
                      <td className="px-2 py-3">
                        <Badge variant={getBadgeVariant(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </td>
                      <td
                        className={`px-2 py-3 ${isOverdue ? "text-red-500" : "text-muted-foreground"}`}
                      >
                        {formatDueDate(invoice.dueDate)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Link
            href="/invoices"
            className="text-xs font-medium text-violet-500/90 transition-colors hover:text-violet-500"
          >
            View all invoices →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
