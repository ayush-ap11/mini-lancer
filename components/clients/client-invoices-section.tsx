"use client";

import { Receipt } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useInvoices } from "@/hooks/use-invoices";
import { cn } from "@/lib/utils";

type ClientInvoicesSectionProps = {
  clientId: string;
  isLoading: boolean;
};

const INVOICE_ROW_SKELETON_KEYS = [
  "invoice-row-1",
  "invoice-row-2",
  "invoice-row-3",
] as const;

function formatCurrency(valueInPaise: number) {
  return `₹${(valueInPaise / 100).toLocaleString("en-IN")}`;
}

function formatDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getInvoiceStatusVariant(status: string) {
  if (status === "PAID") {
    return "success" as const;
  }

  if (status === "OVERDUE") {
    return "destructive" as const;
  }

  if (status === "PENDING") {
    return "warning" as const;
  }

  return "secondary" as const;
}

export default function ClientInvoicesSection({
  clientId,
  isLoading,
}: ClientInvoicesSectionProps) {
  const invoicesQuery = useInvoices({ clientId });

  const invoices = invoicesQuery.data ?? [];
  const showLoading = isLoading || invoicesQuery.isLoading;

  const outstandingAmount = invoices
    .filter(
      (invoice) => invoice.status === "PENDING" || invoice.status === "OVERDUE",
    )
    .reduce((sum, invoice) => sum + invoice.totalAmount, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-foreground">
              Invoices
            </h2>
            <Badge variant="secondary">{invoices.length}</Badge>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              {formatCurrency(outstandingAmount)} outstanding
            </p>
          </div>

          <Link href={`/dashboard/invoices?clientId=${clientId}`}>
            <Button variant="outline" size="sm">
              New Invoice
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent>
        {showLoading ? (
          <div className="space-y-3">
            {INVOICE_ROW_SKELETON_KEYS.map((key) => (
              <div key={key} className="grid grid-cols-4 gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Receipt className="size-4" />
            <span>No invoices for this client yet</span>
            <Link
              href={`/dashboard/invoices?clientId=${clientId}`}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "h-auto px-1 py-0 text-primary",
              )}
            >
              Create an invoice →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-160 text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-2 py-2 font-medium">Invoice #</th>
                  <th className="px-2 py-2 font-medium">Amount</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                  <th className="px-2 py-2 font-medium">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => {
                  const dueDateTimestamp = new Date(invoice.dueDate).getTime();
                  const isOverdue =
                    (invoice.status === "OVERDUE" ||
                      dueDateTimestamp < Date.now()) &&
                    invoice.status !== "PAID";

                  return (
                    <tr
                      key={invoice.id}
                      className="border-b border-border/60 last:border-0"
                    >
                      <td className="px-2 py-3">
                        <Link
                          href={`/dashboard/invoices/${invoice.id}`}
                          className="font-medium text-foreground hover:underline"
                        >
                          #{invoice.invoiceNumber}
                        </Link>
                      </td>
                      <td className="px-2 py-3 text-muted-foreground">
                        {formatCurrency(invoice.totalAmount)}
                      </td>
                      <td className="px-2 py-3">
                        <Badge
                          variant={getInvoiceStatusVariant(invoice.status)}
                        >
                          {invoice.status}
                        </Badge>
                      </td>
                      <td
                        className={cn(
                          "px-2 py-3",
                          isOverdue
                            ? "text-red-700 dark:text-red-300"
                            : "text-muted-foreground",
                        )}
                      >
                        {formatDate(invoice.dueDate)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
