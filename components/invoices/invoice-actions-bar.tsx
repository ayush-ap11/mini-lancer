"use client";

import {
  CheckCircle,
  Download,
  Loader2,
  Pencil,
  Send,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
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
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { Invoice, InvoiceStatus } from "@/hooks/use-invoices";

type InvoiceActionsBarProps = {
  invoice: Invoice;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: InvoiceStatus) => void;
  isUpdating: boolean;
};

type ActiveAction = "send" | "mark-paid" | "delete" | null;

export default function InvoiceActionsBar({
  invoice,
  onEdit,
  onDelete,
  onStatusChange,
  isUpdating,
}: InvoiceActionsBarProps) {
  const [activeAction, setActiveAction] = useState<ActiveAction>(null);

  useEffect(() => {
    if (!isUpdating) {
      setActiveAction(null);
    }
  }, [isUpdating]);

  const handleStatusChange = (status: InvoiceStatus, action: ActiveAction) => {
    setActiveAction(action);
    onStatusChange(status);
  };

  const handleDelete = () => {
    setActiveAction("delete");
    onDelete();
  };

  const handlePrint = () => {
    const previousTitle = document.title;
    document.title = `${invoice.invoiceNumber}.pdf`;
    window.print();

    window.setTimeout(() => {
      document.title = previousTitle;
    }, 300);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link
              href="/invoices"
              className="transition-colors hover:text-foreground"
            >
              Invoices
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{invoice.invoiceNumber}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-wrap items-center gap-2">
        {invoice.status === "DRAFT" ? (
          <>
            <Button
              variant="outline"
              className="gap-2"
              onClick={onEdit}
              disabled={isUpdating}
            >
              <Pencil className="size-4" />
              Edit Invoice
            </Button>
            <Button
              className="gap-2"
              onClick={() => handleStatusChange("PENDING", "send")}
              disabled={isUpdating}
            >
              {isUpdating && activeAction === "send" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              Send Invoice
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  disabled={isUpdating}
                >
                  <Trash2 className="size-4" />
                  Delete Invoice
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete invoice?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete{" "}
                    {invoice.invoiceNumber}.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isUpdating}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(event) => {
                      event.preventDefault();
                      handleDelete();
                    }}
                    disabled={isUpdating}
                    className="bg-destructive text-white dark:text-white hover:bg-destructive/90"
                  >
                    {isUpdating && activeAction === "delete" ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : null}
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        ) : null}

        {invoice.status === "PENDING" || invoice.status === "OVERDUE" ? (
          <>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="gap-2 bg-green-600 text-white hover:bg-green-700"
                  disabled={isUpdating}
                >
                  {isUpdating && activeAction === "mark-paid" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <CheckCircle className="size-4" />
                  )}
                  Mark as Paid
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Mark invoice as paid?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This updates {invoice.invoiceNumber} to paid status.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isUpdating}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(event) => {
                      event.preventDefault();
                      handleStatusChange("PAID", "mark-paid");
                    }}
                    disabled={isUpdating}
                  >
                    Confirm
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              variant="outline"
              className="gap-2"
              onClick={handlePrint}
              disabled={isUpdating}
            >
              <Download className="size-4" />
              Download PDF
            </Button>
          </>
        ) : null}

        {invoice.status === "PAID" ? (
          <>
            <span className="text-sm font-semibold text-green-600">Paid</span>
            <Button
              variant="outline"
              className="gap-2"
              onClick={handlePrint}
              disabled={isUpdating}
            >
              <Download className="size-4" />
              Download PDF
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}
