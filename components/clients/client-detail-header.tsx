"use client";

import {
  ExternalLink,
  Link2,
  Loader2,
  Mail,
  Pencil,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import EditClientDialog from "@/components/clients/edit-client-dialog";
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
import { Button, buttonVariants } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type Client,
  useDeleteClient,
  useSendMagicLink,
} from "@/hooks/use-clients";
import { getClientPortalState } from "@/lib/client-portal";
import { cn } from "@/lib/utils";

const avatarColorClasses = [
  "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
  "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  "bg-rose-500/15 text-rose-700 dark:text-rose-300",
] as const;

function getAvatarColor(name: string) {
  const firstChar = name.trim().charAt(0);

  if (!firstChar) {
    return avatarColorClasses[0];
  }

  const index = firstChar.charCodeAt(0) % 6;
  return avatarColorClasses[index];
}

type ClientDetailHeaderProps = {
  client: Client;
  isLoading: boolean;
};

export default function ClientDetailHeader({
  client,
  isLoading,
}: ClientDetailHeaderProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const deleteClientMutation = useDeleteClient();
  const sendPortalLinkMutation = useSendMagicLink(client.id, {
    suppressDefaultToasts: true,
  });
  const portalState = getClientPortalState(client);

  const initials = client.name.trim().charAt(0).toUpperCase() || "?";
  const avatarClassName = getAvatarColor(client.name);

  const handleDelete = async () => {
    try {
      await deleteClientMutation.mutateAsync(client.id);
      toast.success("Client deleted successfully");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete client";
      toast.error(message);
    }
  };

  const handleSendPortalLink = async () => {
    try {
      await sendPortalLinkMutation.mutateAsync(undefined);
      toast.success(
        `Portal link sent to ${client.email}! Link expires in 7 days.`,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to send portal link";
      toast.error(message);
    }
  };

  if (isLoading) {
    return (
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="size-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-52" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-44" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-44" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`flex size-16 shrink-0 items-center justify-center rounded-full text-2xl font-semibold ${avatarClassName}`}
          >
            {initials}
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl font-headline font-bold text-foreground">
              {client.name}
            </h1>
            {client.companyName?.trim() ? (
              <p className="text-sm text-muted-foreground">
                {client.companyName}
              </p>
            ) : null}
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="size-4" />
              <span>{client.email}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={() => setIsEditOpen(true)}
          >
            <Pencil className="size-4" />
            Edit
          </Button>

          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={handleSendPortalLink}
            disabled={sendPortalLinkMutation.isPending}
          >
            {sendPortalLinkMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Link2 className="size-4" />
            )}
            {portalState.isActive ? "Resend Portal Link" : "Send Portal Link"}
          </Button>

          {portalState.portalPath ? (
            <Link
              href={portalState.portalPath}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
            >
              <ExternalLink className="size-4" />
              Open Portal
            </Link>
          ) : null}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                aria-label={`Delete ${client.name}`}
              >
                <Trash2 className="size-4" />
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Client?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete {client.name} and all their
                  projects and invoices. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleteClientMutation.isPending}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={(event) => {
                    event.preventDefault();
                    void handleDelete();
                  }}
                  disabled={deleteClientMutation.isPending}
                  className="bg-destructive text-white hover:bg-destructive/90"
                >
                  {deleteClientMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <EditClientDialog
        client={client}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </section>
  );
}
