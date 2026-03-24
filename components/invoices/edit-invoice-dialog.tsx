"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClients } from "@/hooks/use-clients";
import { type Invoice, useUpdateInvoice } from "@/hooks/use-invoices";
import { useProjects } from "@/hooks/use-projects";

const editInvoiceSchema = z.object({
  clientId: z.string().min(1, "Please select a client"),
  projectId: z.string().optional(),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  dueDate: z.string().min(1, "Due date is required"),
  status: z.enum(["DRAFT", "PENDING"]),
  lineItems: z
    .array(
      z.object({
        description: z.string().min(1, "Description is required"),
        qty: z.number().min(1, "Quantity must be at least 1").int(),
        rate: z.number().min(1, "Rate must be at least 1"),
      }),
    )
    .min(1, "At least one line item is required"),
});

type EditInvoiceFormValues = z.input<typeof editInvoiceSchema>;

type EditInvoiceDialogProps = {
  invoice: Invoice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function toDateInputValue(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

export default function EditInvoiceDialog({
  invoice,
  open,
  onOpenChange,
}: EditInvoiceDialogProps) {
  const clientsQuery = useClients();
  const updateInvoiceMutation = useUpdateInvoice(invoice.id);

  const form = useForm<EditInvoiceFormValues>({
    resolver: zodResolver(editInvoiceSchema),
    defaultValues: {
      clientId: invoice.clientId,
      projectId: invoice.projectId ?? "",
      invoiceNumber: invoice.invoiceNumber,
      dueDate: toDateInputValue(invoice.dueDate),
      status: invoice.status === "PENDING" ? "PENDING" : "DRAFT",
      lineItems: invoice.lineItems.map((item) => ({
        description: item.description,
        qty: item.qty,
        rate: item.rate,
      })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lineItems",
  });

  const selectedClientId = form.watch("clientId");

  const projectsQuery = useProjects(selectedClientId || undefined, {
    enabled: !!selectedClientId,
  });

  const lineItems = form.watch("lineItems") ?? [];

  const total = useMemo(() => {
    return lineItems.reduce((sum, item) => {
      const qty = Number(item?.qty ?? 0);
      const rate = Number(item?.rate ?? 0);
      return sum + qty * rate;
    }, 0);
  }, [lineItems]);

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset({
      clientId: invoice.clientId,
      projectId: invoice.projectId ?? "",
      invoiceNumber: invoice.invoiceNumber,
      dueDate: toDateInputValue(invoice.dueDate),
      status: invoice.status === "PENDING" ? "PENDING" : "DRAFT",
      lineItems: invoice.lineItems.map((item) => ({
        description: item.description,
        qty: item.qty,
        rate: item.rate,
      })),
    });
  }, [open, form, invoice]);

  const clients = clientsQuery.data ?? [];
  const projects = projectsQuery.data ?? [];

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await updateInvoiceMutation.mutateAsync({
        invoiceNumber: values.invoiceNumber,
        dueDate: values.dueDate,
        status: values.status,
        lineItems: values.lineItems.map((item) => ({
          description: item.description,
          qty: item.qty,
          rate: item.rate,
        })),
      });
      onOpenChange(false);
    } catch {
      // Toast handled in hook
    }
  });

  if (invoice.status === "PAID") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Invoice</DialogTitle>
            <DialogDescription>
              Paid invoices cannot be edited
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Invoice</DialogTitle>
          <DialogDescription>
            Update invoice details and line items.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="edit-invoice-client"
                  className="text-sm font-medium text-foreground"
                >
                  Client
                </label>
                <Controller
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue("projectId", "");
                      }}
                    >
                      <SelectTrigger id="edit-invoice-client">
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.clientId ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.clientId.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="edit-invoice-project"
                  className="text-sm font-medium text-foreground"
                >
                  Project (Optional)
                </label>
                {!selectedClientId ? (
                  <Select value="" disabled>
                    <SelectTrigger id="edit-invoice-project">
                      Select a client first
                    </SelectTrigger>
                  </Select>
                ) : (
                  <Controller
                    control={form.control}
                    name="projectId"
                    render={({ field }) => (
                      <Select
                        value={field.value || "NO_PROJECT"}
                        onValueChange={(value) =>
                          field.onChange(value === "NO_PROJECT" ? "" : value)
                        }
                      >
                        <SelectTrigger id="edit-invoice-project">
                          {projectsQuery.isLoading ? (
                            <span className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Loader2 className="size-4 animate-spin" />
                              Loading projects...
                            </span>
                          ) : (
                            <SelectValue placeholder="Select project" />
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NO_PROJECT">No Project</SelectItem>
                          {projects.length === 0 ? (
                            <SelectItem value="NO_PROJECTS" disabled>
                              No projects for this client
                            </SelectItem>
                          ) : (
                            projects.map((project) => (
                              <SelectItem key={project.id} value={project.id}>
                                {project.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="edit-invoice-number"
                  className="text-sm font-medium text-foreground"
                >
                  Invoice Number
                </label>
                <input
                  id="edit-invoice-number"
                  type="text"
                  className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                  {...form.register("invoiceNumber")}
                />
                {form.formState.errors.invoiceNumber ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.invoiceNumber.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="edit-invoice-due-date"
                  className="text-sm font-medium text-foreground"
                >
                  Due Date
                </label>
                <input
                  id="edit-invoice-due-date"
                  type="date"
                  className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
                  {...form.register("dueDate")}
                />
                {form.formState.errors.dueDate ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.dueDate.message}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="edit-invoice-status"
              className="text-sm font-medium text-foreground"
            >
              Status
            </label>
            <Controller
              control={form.control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="edit-invoice-status" className="max-w-52">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Line Items
            </p>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="space-y-3">
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-180 text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-left text-muted-foreground">
                    <th className="w-12 px-3 py-2 font-medium">#</th>
                    <th className="px-3 py-2 font-medium">Description</th>
                    <th className="w-24 px-3 py-2 font-medium">Qty</th>
                    <th className="w-36 px-3 py-2 font-medium">Rate (₹)</th>
                    <th className="w-36 px-3 py-2 font-medium">Amount (₹)</th>
                    <th className="w-14 px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, index) => {
                    const currentQty = Number(lineItems[index]?.qty ?? 0);
                    const currentRate = Number(lineItems[index]?.rate ?? 0);
                    const amount = currentQty * currentRate;

                    return (
                      <tr
                        key={field.id}
                        className="border-b border-border/60 last:border-b-0"
                      >
                        <td className="px-3 py-2 text-muted-foreground">
                          {index + 1}
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            placeholder="e.g. Homepage Design"
                            className="h-9 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                            {...form.register(`lineItems.${index}.description`)}
                          />
                          {form.formState.errors.lineItems?.[index]
                            ?.description ? (
                            <p className="mt-1 text-xs text-destructive">
                              {
                                form.formState.errors.lineItems[index]
                                  ?.description?.message
                              }
                            </p>
                          ) : null}
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min={1}
                            step={1}
                            className="h-9 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
                            {...form.register(`lineItems.${index}.qty`, {
                              setValueAs: (value) => Number.parseInt(value, 10),
                            })}
                          />
                          {form.formState.errors.lineItems?.[index]?.qty ? (
                            <p className="mt-1 text-xs text-destructive">
                              {
                                form.formState.errors.lineItems[index]?.qty
                                  ?.message
                              }
                            </p>
                          ) : null}
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min={1}
                            step={1}
                            className="h-9 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
                            {...form.register(`lineItems.${index}.rate`, {
                              setValueAs: (value) => Number.parseFloat(value),
                            })}
                          />
                          {form.formState.errors.lineItems?.[index]?.rate ? (
                            <p className="mt-1 text-xs text-destructive">
                              {
                                form.formState.errors.lineItems[index]?.rate
                                  ?.message
                              }
                            </p>
                          ) : null}
                        </td>
                        <td className="px-3 py-2 font-medium text-foreground">
                          {amount.toLocaleString("en-IN")}
                        </td>
                        <td className="px-3 py-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            disabled={fields.length <= 1}
                            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            aria-label={`Delete line item ${index + 1}`}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {form.formState.errors.lineItems?.message ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.lineItems.message}
              </p>
            ) : null}

            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                className="gap-2"
                onClick={() =>
                  append({
                    description: "",
                    qty: 1,
                    rate: 0,
                  })
                }
              >
                <Plus className="size-4" />
                Add Line Item
              </Button>

              <p className="text-lg font-bold text-foreground">
                Total: ₹{total.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              className="gap-2"
              disabled={updateInvoiceMutation.isPending}
            >
              {updateInvoiceMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
