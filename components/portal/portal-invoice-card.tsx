"use client";

import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import InvoiceStatusBadge from "@/components/invoices/invoice-status-badge";
import type { PortalInvoice as Invoice } from "@/hooks/use-portal";
import { formatCurrency } from "@/lib/format-currency";
import { cn } from "@/lib/utils";
import RazorpayPayButton from "./razorpay-pay-button";

type PortalInvoiceCardProps = {
  invoice: Invoice;
  token: string;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDueDateTone(invoice: Invoice) {
  if (invoice.status === "PAID") {
    return "text-slate-500";
  }

  const now = new Date();
  const dueDate = new Date(invoice.dueDate);
  const msInDay = 1000 * 60 * 60 * 24;
  const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / msInDay);

  if (daysUntilDue < 0 || invoice.status === "OVERDUE") {
    return "text-red-600";
  }

  if (daysUntilDue <= 7) {
    return "text-amber-600";
  }

  return "text-slate-600";
}

export default function PortalInvoiceCard({
  invoice,
  token,
}: PortalInvoiceCardProps) {
  const [expanded, setExpanded] = useState(false);

  const dueDateTone = useMemo(() => getDueDateTone(invoice), [invoice]);
  const canPay = invoice.status === "PENDING" || invoice.status === "OVERDUE";

  return (
    <article
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm",
        invoice.status === "OVERDUE" && "border-l-4 border-l-red-500",
        invoice.status === "PENDING" && "border-l-4 border-l-violet-500",
        invoice.status === "PAID" && "border-l-4 border-l-green-500 opacity-80",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="text-base font-bold text-slate-900">
          {invoice.invoiceNumber}
        </p>
        <InvoiceStatusBadge status={invoice.status} />
      </div>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <p className="text-3xl font-bold tracking-tight text-slate-900">
          {formatCurrency(invoice.totalAmount)}
        </p>
        <p className={cn("text-sm font-medium", dueDateTone)}>
          Due {formatDate(invoice.dueDate)}
        </p>
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
        >
          {expanded ? "Hide details" : "View details"}
          <ChevronDown
            className={cn(
              "size-4 transition-transform duration-300",
              expanded && "rotate-180",
            )}
          />
        </button>

        <div
          className="overflow-hidden transition-all duration-300"
          style={{ maxHeight: expanded ? "500px" : "0px" }}
        >
          <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">
                    Description
                  </th>
                  <th className="px-3 py-2 text-right font-medium">Qty</th>
                  <th className="px-3 py-2 text-right font-medium">Rate</th>
                  <th className="px-3 py-2 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.map((item, index) => (
                  <tr
                    key={`${invoice.id}-${item.description}-${index}`}
                    className="border-t border-slate-100"
                  >
                    <td className="px-3 py-2 text-slate-700">
                      {item.description}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-600">
                      {item.qty}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-600">
                      {formatCurrency(item.rate)}
                    </td>
                    <td className="px-3 py-2 text-right font-medium text-slate-900">
                      {formatCurrency(item.qty * item.rate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {canPay ? (
        <div className="mt-5">
          <RazorpayPayButton
            invoiceId={invoice.id}
            token={token}
            invoiceNumber={invoice.invoiceNumber}
            amount={invoice.totalAmount}
          />
        </div>
      ) : null}
    </article>
  );
}
