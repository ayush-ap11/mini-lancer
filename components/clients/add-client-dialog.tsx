"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { useCreateClient, useSendMagicLink } from "@/hooks/use-clients";

const createClientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  companyName: z.string().optional(),
});

type CreateClientFormValues = z.infer<typeof createClientSchema>;

type AddClientDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function AddClientDialog({
  open,
  onOpenChange,
}: AddClientDialogProps) {
  const router = useRouter();

  const form = useForm<CreateClientFormValues>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      name: "",
      email: "",
      companyName: "",
    },
  });

  const createClientMutation = useCreateClient({
    suppressDefaultErrorToast: true,
  });
  const sendMagicLinkMutation = useSendMagicLink("", {
    suppressDefaultToasts: true,
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      const createdClient = await createClientMutation.mutateAsync({
        name: values.name,
        email: values.email,
        companyName: values.companyName?.trim() || undefined,
      });

      try {
        await sendMagicLinkMutation.mutateAsync(createdClient.id);
        toast.success("Client added and portal link sent ✓");
      } catch {
        toast.warning(
          "Client added, but magic link email could not be sent. You can resend it from the client card.",
        );
      }

      onOpenChange(false);
      form.reset();
    } catch (error) {
      const status =
        typeof error === "object" && error !== null && "status" in error
          ? Number(error.status)
          : undefined;

      if (status === 403) {
        toast.error(
          "You've reached the 3-client limit. Upgrade to Pro to add more clients.",
          {
            action: {
              label: "Upgrade to Pro",
              onClick: () => router.push("/dashboard/billing"),
            },
          },
        );
        return;
      }

      toast.error("Failed to add client. Please try again.");
    }
  });

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Client</DialogTitle>
          <DialogDescription>
            Enter client details to create a new profile.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="client-name"
              className="text-sm font-medium text-foreground"
            >
              Name
            </label>
            <input
              id="client-name"
              type="text"
              placeholder="John Doe"
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
              htmlFor="client-email"
              className="text-sm font-medium text-foreground"
            >
              Email
            </label>
            <input
              id="client-email"
              type="email"
              placeholder="john@example.com"
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
              htmlFor="client-company"
              className="text-sm font-medium text-foreground"
            >
              Company Name
            </label>
            <input
              id="client-company"
              type="text"
              placeholder="Acme Inc"
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
              disabled={createClientMutation.isPending}
              className="gap-2"
            >
              {createClientMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Client"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
