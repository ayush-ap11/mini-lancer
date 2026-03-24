"use client";

import { Link2, Loader2, Mail, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
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
import { Card, CardContent } from "@/components/ui/card";
import {
  type Client,
  useDeleteClient,
  useSendMagicLink,
} from "@/hooks/use-clients";
import { cn } from "@/lib/utils";

type ClientCardProps = {
  client: Client;
};

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

export default function ClientCard({ client }: ClientCardProps) {
  const deleteClientMutation = useDeleteClient();
  const sendMagicLinkMutation = useSendMagicLink(client.id, {
    suppressDefaultToasts: true,
  });

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

  const tokenExpiresAt = client.tokenExpiresAt
    ? new Date(client.tokenExpiresAt)
    : null;
  const isExpired =
    tokenExpiresAt === null || tokenExpiresAt.getTime() <= Date.now();

  const handleSendMagicLink = async () => {
    try {
      await sendMagicLinkMutation.mutateAsync(undefined);
      toast.success(`Portal link sent to ${client.email}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to send portal link";
      toast.error(message);
    }
  };

  return (
    <Card className="flex h-full min-h-52 flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="flex-1 space-y-4 p-5">
        <div className="flex items-start gap-3">
          <div
            className={`flex size-12 shrink-0 items-center justify-center rounded-full text-lg font-semibold ${avatarClassName}`}
          >
            {initials}
          </div>

          <div className="min-w-0 space-y-1">
            <p className="truncate text-base font-semibold text-foreground">
              {client.name}
            </p>
            {client.companyName?.trim() ? (
              <p className="truncate text-sm text-muted-foreground">
                {client.companyName}
              </p>
            ) : null}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Mail className="size-3.5 shrink-0" />
              <span className="truncate">{client.email}</span>
            </div>
          </div>
        </div>
      </CardContent>

      <div className="flex items-center justify-between border-t border-border px-5 py-3">
        <div className="flex items-center gap-1">
          <Link
            href={`/clients/${client.id}`}
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            View Details
          </Link>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={() => void handleSendMagicLink()}
            disabled={sendMagicLinkMutation.isPending}
          >
            {sendMagicLinkMutation.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Link2 className="size-3.5" />
            )}
            {isExpired ? "Resend Link" : "Send Link"}
          </Button>
        </div>

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
    </Card>
  );
}
