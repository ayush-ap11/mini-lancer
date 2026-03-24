"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { type Client, useUpdateClient } from "@/hooks/use-clients";

const updateClientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  companyName: z.string().optional(),
});

type UpdateClientFormValues = z.infer<typeof updateClientSchema>;

type EditClientDialogProps = {
  client: Client;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function EditClientDialog({
  client,
  open,
  onOpenChange,
}: EditClientDialogProps) {
  const form = useForm<UpdateClientFormValues>({
    resolver: zodResolver(updateClientSchema),
    defaultValues: {
      name: client.name,
      email: client.email,
      companyName: client.companyName ?? "",
    },
  });

  const updateClientMutation = useUpdateClient(client.id);

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await updateClientMutation.mutateAsync({
        name: values.name,
        email: values.email,
        companyName: values.companyName?.trim() || undefined,
      });

      onOpenChange(false);
      form.reset({
        name: values.name,
        email: values.email,
        companyName: values.companyName ?? "",
      });
      toast.success("Client updated successfully");
    } catch {
      toast.error("Failed to update client. Please try again.");
    }
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: client.name,
        email: client.email,
        companyName: client.companyName ?? "",
      });
      return;
    }

    form.clearErrors();
  }, [open, client, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Client</DialogTitle>
          <DialogDescription>
            Update the client information below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="edit-client-name"
              className="text-sm font-medium text-foreground"
            >
              Name
            </label>
            <input
              id="edit-client-name"
              type="text"
              className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              {...form.register("name")}
            />
            {form.formState.errors.name ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="edit-client-email"
              className="text-sm font-medium text-foreground"
            >
              Email
            </label>
            <input
              id="edit-client-email"
              type="email"
              className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              {...form.register("email")}
            />
            {form.formState.errors.email ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.email.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="edit-client-company"
              className="text-sm font-medium text-foreground"
            >
              Company Name
            </label>
            <input
              id="edit-client-company"
              type="text"
              className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              {...form.register("companyName")}
            />
            {form.formState.errors.companyName ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.companyName.message}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={updateClientMutation.isPending}
              className="gap-2"
            >
              {updateClientMutation.isPending ? (
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
