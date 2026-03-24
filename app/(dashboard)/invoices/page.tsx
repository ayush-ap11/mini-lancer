"use client";

import { Plus, Search, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import CreateInvoiceDialog from "@/components/invoices/create-invoice-dialog";
import InvoicesTable from "@/components/invoices/invoices-table";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useClients } from "@/hooks/use-clients";
import { type InvoiceStatus, useInvoices } from "@/hooks/use-invoices";
import { formatCurrency } from "@/lib/format-currency";

type StatusFilter = "ALL" | InvoiceStatus;

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: "ALL", label: "All Statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "PENDING", label: "Pending" },
  { value: "PAID", label: "Paid" },
  { value: "OVERDUE", label: "Overdue" },
];

export default function InvoicesPage() {
  const searchParams = useSearchParams();
  const urlClientId = searchParams.get("clientId");

  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [clientFilter, setClientFilter] = useState("ALL");

  useEffect(() => {
    if (urlClientId) {
      setClientFilter(urlClientId);
      return;
    }

    setClientFilter("ALL");
  }, [urlClientId]);

  const filters = useMemo(() => {
    return {
      clientId: clientFilter !== "ALL" ? clientFilter : undefined,
      status: statusFilter !== "ALL" ? statusFilter : undefined,
    };
  }, [clientFilter, statusFilter]);

  const invoicesQuery = useInvoices(filters);
  const clientsQuery = useClients();

  const invoices = invoicesQuery.data ?? [];
  const clients = clientsQuery.data ?? [];

  const normalizedSearch = search.trim().toLowerCase();

  const visibleInvoices = useMemo(() => {
    return invoices.filter((invoice) =>
      invoice.invoiceNumber.toLowerCase().includes(normalizedSearch),
    );
  }, [invoices, normalizedSearch]);

  const summary = useMemo(() => {
    const outstandingPaise = invoices
      .filter(
        (invoice) =>
          invoice.status === "PENDING" || invoice.status === "OVERDUE",
      )
      .reduce((sum, invoice) => sum + invoice.totalAmount, 0);

    const paidPaise = invoices
      .filter((invoice) => invoice.status === "PAID")
      .reduce((sum, invoice) => sum + invoice.totalAmount, 0);

    const draftCount = invoices.filter(
      (invoice) => invoice.status === "DRAFT",
    ).length;

    return {
      outstandingPaise,
      paidPaise,
      draftCount,
    };
  }, [invoices]);

  const hasActiveFilters =
    normalizedSearch.length > 0 ||
    statusFilter !== "ALL" ||
    clientFilter !== "ALL";

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground">
            Invoices
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and manage your invoices
          </p>
        </div>

        <Button className="gap-2" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          Create Invoice
        </Button>
      </section>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {invoicesQuery.isLoading ? (
          <>
            <Skeleton className="h-18 rounded-xl" />
            <Skeleton className="h-18 rounded-xl" />
            <Skeleton className="h-18 rounded-xl" />
          </>
        ) : (
          <>
            <Card className="border-amber-200/50 bg-amber-50/40 dark:bg-amber-950/20">
              <CardContent className="space-y-1 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-amber-700 dark:text-amber-400">
                  Total Outstanding
                </p>
                <p className="text-xl font-bold text-amber-700 dark:text-amber-300">
                  {formatCurrency(summary.outstandingPaise)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200/50 bg-green-50/40 dark:bg-green-950/20">
              <CardContent className="space-y-1 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-green-700 dark:text-green-400">
                  Total Paid
                </p>
                <p className="text-xl font-bold text-green-700 dark:text-green-300">
                  {formatCurrency(summary.paidPaise)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200/60 bg-slate-50/50 dark:bg-slate-900/30">
              <CardContent className="space-y-1 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-400">
                  Total Draft
                </p>
                <p className="text-xl font-bold text-slate-700 dark:text-slate-300">
                  {summary.draftCount}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </section>

      <section className="space-y-3">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px_auto] lg:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by invoice number..."
              className="h-10 w-full rounded-md border border-border bg-card pl-9 pr-9 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-3 lg:contents">
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as StatusFilter)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={clientFilter} onValueChange={setClientFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Clients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Clients</SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 justify-self-start lg:justify-self-end"
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
                setClientFilter(urlClientId ?? "ALL");
              }}
            >
              Clear filters
              <X className="ml-1 size-3.5" />
            </Button>
          ) : null}
        </div>
      </section>

      <InvoicesTable
        invoices={visibleInvoices}
        clients={clients}
        isLoading={invoicesQuery.isLoading || clientsQuery.isLoading}
        hasActiveFilters={hasActiveFilters}
        onCreateInvoice={() => setCreateOpen(true)}
        onClearFilters={() => {
          setSearch("");
          setStatusFilter("ALL");
          setClientFilter(urlClientId ?? "ALL");
        }}
      />

      <CreateInvoiceDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        defaultClientId={urlClientId ?? undefined}
      />
    </div>
  );
}
