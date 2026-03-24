import { Clock, FolderKanban, IndianRupee, Users } from "lucide-react";
import PlanBanner from "@/components/dashboard/plan-banner";
import RecentClientsTable from "@/components/dashboard/recent-clients-table";
import RecentInvoicesTable from "@/components/dashboard/recent-invoices-table";
import StatCard from "@/components/dashboard/stat-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-3 h-4 w-64" />
      </section>

      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard
          title="Total Clients"
          value="0"
          icon={Users}
          description="Clients in your workspace"
          iconColor="text-primary"
          iconBg="bg-primary/10"
          isLoading
        />
        <StatCard
          title="Active Projects"
          value="0"
          icon={FolderKanban}
          description="Projects currently in progress"
          iconColor="text-secondary"
          iconBg="bg-secondary/10"
          isLoading
        />
        <StatCard
          title="Total Invoiced"
          value="₹0"
          icon={IndianRupee}
          description="Across all invoices"
          iconColor="text-primary-fixed"
          iconBg="bg-primary-fixed/10"
          isLoading
        />
        <StatCard
          title="Pending Payments"
          value="0"
          icon={Clock}
          description="Invoices awaiting payment"
          iconColor="text-tertiary"
          iconBg="bg-tertiary/10"
          isLoading
        />
      </section>

      <PlanBanner plan="FREE" clientCount={0} isLoading />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-12">
        <div className="order-2 md:order-2 xl:order-1 xl:col-span-5">
          <RecentClientsTable clients={[]} isLoading />
        </div>
        <div className="order-1 md:order-1 xl:order-2 xl:col-span-7">
          <RecentInvoicesTable invoices={[]} clients={[]} isLoading />
        </div>
      </div>
    </div>
  );
}
