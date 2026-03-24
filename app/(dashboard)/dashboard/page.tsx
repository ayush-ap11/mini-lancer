"use client";

import { useCallback } from "react";
import { Clock, FolderKanban, IndianRupee, Users } from "lucide-react";
import { toast } from "sonner";
import DashboardSkeleton from "@/components/dashboard/dashboard-skeleton";
import PlanBanner from "@/components/dashboard/plan-banner";
import RecentClientsTable from "@/components/dashboard/recent-clients-table";
import RecentInvoicesTable from "@/components/dashboard/recent-invoices-table";
import StatCard from "@/components/dashboard/stat-card";
import { useClients } from "@/hooks/use-clients";
import { useInvoices } from "@/hooks/use-invoices";
import { useProjects } from "@/hooks/use-projects";
import { useUserMe } from "@/hooks/use-user";

export default function DashboardPage() {
  const handleQueryError = useCallback(() => {
    toast.error("Failed to load dashboard data. Please refresh.", {
      id: "dashboard-load-error",
    });
  }, []);

  const userQuery = useUserMe({ onError: handleQueryError });
  const clientsQuery = useClients({ onError: handleQueryError });
  const projectsQuery = useProjects(undefined, { onError: handleQueryError });
  const invoicesQuery = useInvoices(undefined, { onError: handleQueryError });

  const isAllLoading =
    userQuery.isLoading &&
    clientsQuery.isLoading &&
    projectsQuery.isLoading &&
    invoicesQuery.isLoading;

  if (isAllLoading) {
    return <DashboardSkeleton />;
  }

  const user = userQuery.data;
  const clients = clientsQuery.data ?? [];
  const projects = projectsQuery.data ?? [];
  const invoices = invoicesQuery.data ?? [];

  const totalClients = clients.length;
  const activeProjects = projects.filter(
    (project) => project.status !== "COMPLETED",
  ).length;
  const totalInvoiced =
    invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0) / 100;
  const pendingPaymentsCount = invoices.filter(
    (invoice) => invoice.status === "PENDING" || invoice.status === "OVERDUE",
  ).length;

  const formattedDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-3xl font-headline font-bold text-foreground">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{formattedDate}</p>
      </section>

      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard
          title="Total Clients"
          value={totalClients}
          icon={Users}
          description="Clients in your workspace"
          iconColor="text-primary"
          iconBg="bg-primary/10"
          isLoading={clientsQuery.isFetching}
        />
        <StatCard
          title="Active Projects"
          value={activeProjects}
          icon={FolderKanban}
          description="Projects currently in progress"
          iconColor="text-secondary"
          iconBg="bg-secondary/10"
          isLoading={projectsQuery.isFetching}
        />
        <StatCard
          title="Total Invoiced"
          value={`₹${totalInvoiced.toLocaleString("en-IN")}`}
          icon={IndianRupee}
          description="Across all invoices"
          iconColor="text-primary-fixed"
          iconBg="bg-primary-fixed/10"
          isLoading={invoicesQuery.isFetching}
        />
        <StatCard
          title="Pending Payments"
          value={pendingPaymentsCount}
          icon={Clock}
          description="Invoices awaiting payment"
          iconColor="text-tertiary"
          iconBg="bg-tertiary/10"
          isLoading={invoicesQuery.isFetching}
        />
      </section>

      <PlanBanner
        plan={user?.plan ?? "PRO"}
        clientCount={user?.clientCount ?? 0}
        isLoading={userQuery.isFetching}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-12">
        <div className="order-1 md:order-1 xl:order-2 xl:col-span-7">
          <RecentInvoicesTable
            invoices={invoices}
            clients={clients}
            isLoading={invoicesQuery.isFetching}
          />
        </div>
        <div className="order-2 md:order-2 xl:order-1 xl:col-span-5">
          <RecentClientsTable
            clients={clients}
            isLoading={clientsQuery.isFetching}
          />
        </div>
      </div>
    </div>
  );
}
