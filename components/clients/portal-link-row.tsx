"use client";

import { Copy, ExternalLink, Link2, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import type { Client } from "@/hooks/use-clients";
import { useSendMagicLink } from "@/hooks/use-clients";
import { getClientPortalState } from "@/lib/client-portal";
import { cn } from "@/lib/utils";

type PortalLinkRowProps = {
  client: Client;
};

export default function PortalLinkRow({ client }: PortalLinkRowProps) {
  const sendMagicLinkMutation = useSendMagicLink(client.id, {
    suppressDefaultToasts: true,
  });

  const portalState = getClientPortalState(client);

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

  const handleCopyPortalLink = async () => {
    if (!portalState.portalPath || typeof window === "undefined") {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}${portalState.portalPath}`,
      );
      toast.success("Portal link copied");
    } catch {
      toast.error("Failed to copy portal link");
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {client.name}
          </p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Mail className="size-3.5" />
            <span className="truncate">{client.email}</span>
          </p>
          <div>
            <Badge variant={portalState.isActive ? "success" : "secondary"}>
              {portalState.isActive ? "Link Active" : "No Active Link"}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
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
            {portalState.isActive ? "Resend Link" : "Send Link"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={() => void handleCopyPortalLink()}
            disabled={!portalState.portalPath}
          >
            <Copy className="size-3.5" />
            Copy Link
          </Button>

          {portalState.portalPath ? (
            <Link
              href={portalState.portalPath}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              <ExternalLink className="size-3.5" />
              Open Portal
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
