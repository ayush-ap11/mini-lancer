"use client";

import BillingSkeleton from "@/components/billing/billing-skeleton";
import CurrentPlanCard from "@/components/billing/current-plan-card";
import PricingSection from "@/components/billing/pricing-section";
import { useUserMe } from "@/hooks/use-user";

export default function BillingPage() {
  const userMeQuery = useUserMe();

  if (userMeQuery.isLoading) {
    return <BillingSkeleton />;
  }

  const user = userMeQuery.data;

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-headline font-bold text-foreground">
          Billing & Plan
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your Mini-lancer subscription
        </p>
      </section>

      <CurrentPlanCard
        plan={user?.plan ?? "FREE"}
        clientCount={user?.clientCount ?? 0}
        clientLimit={user?.clientLimit ?? 3}
        isLoading={userMeQuery.isFetching}
      />

      <div className="h-px w-full bg-border" />

      <PricingSection
        currentPlan={user?.plan ?? "FREE"}
        isLoading={userMeQuery.isFetching}
      />
    </div>
  );
}
