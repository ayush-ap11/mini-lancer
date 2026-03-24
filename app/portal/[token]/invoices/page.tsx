"use client";

import { AlertCircle, Receipt } from "lucide-react";
import { use, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import PortalEmptyState from "@/components/portal/portal-empty-state";
import PortalInvoiceCard from "@/components/portal/portal-invoice-card";
import PortalTabs from "@/components/portal/portal-tabs";
import { usePortalInvoices } from "@/hooks/use-portal";
import { formatCurrency } from "@/lib/format-currency";

const INVOICE_SKELETON_KEYS = [
  "portal-invoice-skeleton-1",
  "portal-invoice-skeleton-2",
  "portal-invoice-skeleton-3",
] as const;

type PortalInvoicesPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default function PortalInvoicesPage({
  params,
}: PortalInvoicesPageProps) {
  const { token } = use(params);
  const router = useRouter();
  const invoicesQuery = usePortalInvoices(token);

  useEffect(() => {
    const status =
      typeof invoicesQuery.error === "object" &&
      invoicesQuery.error !== null &&
      "status" in invoicesQuery.error
        ? (invoicesQuery.error.status as number)
        : null;

    if (status === 401) {
      router.push("/portal/invalid");
    }
  }, [invoicesQuery.error, router]);

  const invoices = invoicesQuery.data ?? [];

  const outstandingInvoices = useMemo(() => {
    return invoices.filter(
      (invoice) => invoice.status === "PENDING" || invoice.status === "OVERDUE",
    );
  }, [invoices]);

  const outstandingTotal = useMemo(() => {
    return outstandingInvoices.reduce(
      (sum, invoice) => sum + invoice.totalAmount,
      0,
    );
  }, [outstandingInvoices]);

  return (
    <div className="space-y-6 pt-4">
      <PortalTabs token={token} activeTab="invoices" />

      <section className="space-y-2 pt-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Your Invoices
        </h1>
        <p className="text-sm text-slate-500">
          View and pay your outstanding invoices
        </p>
      </section>

      {outstandingInvoices.length > 0 ? (
        <section className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertCircle className="size-4" />
          <p>
            You have {outstandingInvoices.length} outstanding invoice(s)
            totalling {formatCurrency(outstandingTotal)}
          </p>
        </section>
      ) : null}

      {invoicesQuery.isLoading ? (
        <section className="space-y-3">
          {INVOICE_SKELETON_KEYS.map((skeletonKey) => (
            <div
              key={skeletonKey}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="space-y-2">
                <div className="h-5 w-28 rounded bg-slate-200" />
                <div className="h-4 w-20 rounded bg-slate-100" />
                <div className="h-4 w-40 rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </section>
      ) : invoices.length === 0 ? (
        <PortalEmptyState
          icon={Receipt}
          heading="No invoices yet"
          subtext="Your freelancer hasn't sent you any invoices yet"
        />
      ) : (
        <section className="space-y-3">
          {invoices.map((invoice) => (
            <PortalInvoiceCard
              key={invoice.id}
              invoice={invoice}
              token={token}
            />
          ))}
        </section>
      )}
    </div>
  );
}
