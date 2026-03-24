import type { Invoice } from "@/hooks/use-invoices";

export function generateInvoiceNumber(existingInvoices: Invoice[]): string {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;

  const nextSequence =
    existingInvoices.reduce((maxSequence, invoice) => {
      if (!invoice.invoiceNumber.startsWith(prefix)) {
        return maxSequence;
      }

      const suffix = invoice.invoiceNumber.slice(prefix.length);
      const parsedSequence = Number.parseInt(suffix, 10);

      if (!Number.isFinite(parsedSequence)) {
        return maxSequence;
      }

      return Math.max(maxSequence, parsedSequence);
    }, 0) + 1;

  return `INV-${year}-${String(nextSequence).padStart(3, "0")}`;
}
