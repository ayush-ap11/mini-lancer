"use client";

import { UserX } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import ClientDetailHeader from "@/components/clients/client-detail-header";
import ClientDetailSkeleton from "@/components/clients/client-detail-skeleton";
import ClientInfoCard from "@/components/clients/client-info-card";
import ClientInvoicesSection from "@/components/clients/client-invoices-section";
import ClientProjectsSection from "@/components/clients/client-projects-section";
import { Button } from "@/components/ui/Button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useClient } from "@/hooks/use-clients";

type ClientDetailPageProps = {
  params: Promise<{
    clientId: string;
  }>;
};

export default function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { clientId } = use(params);

  const clientQuery = useClient(clientId);

  if (clientQuery.isLoading) {
    return <ClientDetailSkeleton />;
  }

  const clientStatus =
    typeof clientQuery.error === "object" &&
    clientQuery.error !== null &&
    "status" in clientQuery.error
      ? Number(clientQuery.error.status)
      : undefined;

  if (clientStatus === 404 || !clientQuery.data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <UserX className="size-12 text-muted-foreground/70" />
        <h1 className="mt-4 text-2xl font-semibold text-foreground">
          Client not found
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This client doesn't exist or you don't have access.
        </p>
        <Link href="/clients" className="mt-4">
          <Button>Back to Clients</Button>
        </Link>
      </div>
    );
  }

  const client = clientQuery.data;
  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/clients">Clients</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{client.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <ClientDetailHeader client={client} isLoading={clientQuery.isLoading} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="order-1 xl:order-2 xl:col-span-5">
          <ClientInfoCard client={client} isLoading={clientQuery.isLoading} />
        </div>

        <div className="order-2 space-y-4 xl:order-1 xl:col-span-7">
          <ClientProjectsSection
            clientId={clientId}
            isLoading={clientQuery.isLoading}
          />
          <ClientInvoicesSection
            clientId={clientId}
            isLoading={clientQuery.isLoading}
          />
        </div>
      </div>
    </div>
  );
}
