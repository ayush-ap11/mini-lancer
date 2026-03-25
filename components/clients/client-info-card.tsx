"use client";

import { Mail } from "lucide-react";
import { useState } from "react";
import EditClientDialog from "@/components/clients/edit-client-dialog";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Client } from "@/hooks/use-clients";
import { getClientPortalState } from "@/lib/client-portal";

type ClientInfoCardProps = {
  client: Client;
  isLoading: boolean;
};

function getPortalStatus(client: Client) {
  const portalState = getClientPortalState(client);

  if (!portalState.isActive) {
    return { label: "No Active Link", variant: "secondary" as const };
  }

  return { label: "Link Active", variant: "success" as const };
}

export default function ClientInfoCard({
  client,
  isLoading,
}: ClientInfoCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-36" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-44" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const portalStatus = getPortalStatus(client);
  const memberSince = new Date(client.createdAt).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-foreground">
            Client Info
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground">Name</p>
            <p className="text-sm font-medium text-foreground">{client.name}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-foreground">
              <Mail className="size-4 text-muted-foreground" />
              <span className="break-all">{client.email}</span>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Company</p>
            <p className="text-sm font-medium text-foreground">
              {client.companyName?.trim() ? client.companyName : "—"}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Portal Status</p>
            <div className="mt-1">
              <Badge variant={portalStatus.variant}>{portalStatus.label}</Badge>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Member Since</p>
            <p className="text-sm font-medium text-foreground">{memberSince}</p>
          </div>
        </CardContent>

        <div className="border-t border-border px-6 py-3">
          <Button variant="ghost" size="sm" onClick={() => setIsEditOpen(true)}>
            Edit Client
          </Button>
        </div>
      </Card>

      <EditClientDialog
        client={client}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </>
  );
}
