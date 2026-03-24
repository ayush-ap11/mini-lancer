import InvoiceStatusBadge from "@/components/invoices/invoice-status-badge";
import type { Client } from "@/hooks/use-clients";
import type { Invoice } from "@/hooks/use-invoices";
import { formatCurrency } from "@/lib/format-currency";

type InvoiceDocumentProps = {
  invoice: Invoice;
  client: Client;
  freelancerName: string;
};

function formatLongDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getLineItems(invoice: Invoice) {
  if (!Array.isArray(invoice.lineItems)) {
    return [];
  }

  return invoice.lineItems.filter(
    (item): item is { description: string; qty: number; rate: number } => {
      if (typeof item !== "object" || item === null) {
        return false;
      }

      const lineItem = item as {
        description?: unknown;
        qty?: unknown;
        rate?: unknown;
      };

      return (
        typeof lineItem.description === "string" &&
        typeof lineItem.qty === "number" &&
        typeof lineItem.rate === "number"
      );
    },
  );
}

export default function InvoiceDocument({
  invoice,
  client,
  freelancerName,
}: InvoiceDocumentProps) {
  const lineItems = getLineItems(invoice);

  const isOverdue =
    invoice.status === "OVERDUE" ||
    (invoice.status === "PENDING" && new Date(invoice.dueDate) < new Date());

  return (
    <div className="invoice-print-area mx-auto w-full max-w-3xl">
      <style>{`
        @media print {
          @page {
            size: A4;
          }

          html, body {
            background: #ffffff !important;
          }

          body * {
            visibility: hidden !important;
          }

          .invoice-print-area,
          .invoice-print-area * {
            visibility: visible !important;
          }

          .invoice-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .invoice-document {
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
          }

          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      <div className="invoice-document relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 text-slate-900 shadow-sm">
        {invoice.status === "PAID" ? (
          <div className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 rotate-[-15deg] text-8xl font-bold tracking-widest text-green-600/10">
            PAID
          </div>
        ) : null}

        <div className="space-y-6">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-widest">INVOICE</h1>
              <p className="mt-2 text-sm text-slate-500">
                {invoice.invoiceNumber}
              </p>
            </div>

            <div className="space-y-2 text-right">
              <InvoiceStatusBadge status={invoice.status} size="lg" />
              <p className="text-sm text-slate-600">
                Issued: {formatLongDate(invoice.createdAt)}
              </p>
              <p
                className={[
                  "text-sm",
                  isOverdue ? "text-red-600" : "text-slate-600",
                ].join(" ")}
              >
                Due: {formatLongDate(invoice.dueDate)}
              </p>
            </div>
          </header>

          <section className="grid grid-cols-1 gap-6 border-b border-slate-200 pb-6 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                FROM
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {freelancerName}
              </p>
              <p className="text-sm text-slate-500">Mini-lancer</p>
            </div>

            <div className="md:text-right">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                TO
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {client.name}
              </p>
              {client.companyName ? (
                <p className="text-sm text-slate-700">{client.companyName}</p>
              ) : null}
              <p className="text-sm text-slate-500">{client.email}</p>
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="w-12 px-3 py-2">#</th>
                  <th className="px-3 py-2">Description</th>
                  <th className="w-20 px-3 py-2 text-center">Qty</th>
                  <th className="w-28 px-3 py-2 text-right">Rate</th>
                  <th className="w-32 px-3 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, index) => (
                  <tr
                    key={`${invoice.id}-line-${index + 1}`}
                    className="border-t border-slate-200 even:bg-slate-50/40"
                  >
                    <td className="px-3 py-3 text-slate-500">{index + 1}</td>
                    <td className="px-3 py-3 text-slate-800">
                      {item.description}
                    </td>
                    <td className="px-3 py-3 text-center text-slate-700">
                      {item.qty}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-slate-700">
                      {formatCurrency(item.rate * 100)}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-slate-900">
                      {formatCurrency(item.qty * item.rate * 100)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="ml-auto w-full max-w-xs space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Subtotal:</span>
              <span className="font-medium text-slate-700">
                {formatCurrency(invoice.totalAmount)}
              </span>
            </div>
            <div className="h-px bg-slate-200" />
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-slate-900">Total:</span>
              <span className="text-xl font-bold text-slate-900">
                {formatCurrency(invoice.totalAmount)}
              </span>
            </div>
          </section>

          <footer className="mt-6 flex flex-wrap items-start justify-between gap-4 border-t border-slate-200 pt-5">
            <p className="text-sm italic text-slate-500">
              Thank you for your business!
            </p>

            {invoice.status === "PENDING" || invoice.status === "OVERDUE" ? (
              <div className="max-w-xs rounded-md border border-slate-200 p-3 text-sm">
                <p className="font-semibold text-slate-800">
                  Payment Instructions
                </p>
                <p className="mt-1 text-slate-600">
                  Please pay via the client portal link sent to your email.
                </p>
                <p className="mt-1 text-amber-700">
                  Payment due by {formatLongDate(invoice.dueDate)}
                </p>
              </div>
            ) : null}
          </footer>
        </div>
      </div>
    </div>
  );
}
