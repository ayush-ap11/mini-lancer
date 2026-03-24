"use client";

import { Check, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import CancelSubscriptionDialog from "@/components/billing/cancel-subscription-dialog";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type CurrentPlanCardProps = {
  plan: "FREE" | "PRO";
  clientCount: number;
  clientLimit: number | null;
  isLoading: boolean;
};

const FREE_FEATURES = [
  "Up to 3 clients",
  "Unlimited projects",
  "Unlimited invoices",
  "Client portal access",
  "Razorpay payment collection",
] as const;

const PRO_FEATURES = [
  "Unlimited clients",
  "Unlimited projects",
  "Unlimited invoices",
  "Client portal access",
  "Razorpay payment collection",
  "Priority support",
] as const;

export default function CurrentPlanCard({
  plan,
  clientCount,
  clientLimit,
  isLoading,
}: CurrentPlanCardProps) {
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>

          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-4 w-56" />

          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-2.5 w-full" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-4 w-52" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (plan === "PRO") {
    return (
      <>
        <Card className="border-violet-500/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Current Plan
              </p>
              <Badge className="border-violet-500 bg-violet-600 text-white">
                PRO
              </Badge>
            </div>

            <h2 className="mt-4 flex items-center gap-2 text-3xl font-bold text-foreground">
              Pro Plan <Sparkles className="size-5 text-violet-500" />
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              You have access to all Pro features
            </p>

            <div className="mt-5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-300">
                <span className="size-2 rounded-full bg-emerald-500" />
                Active
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Your subscription renews monthly
              </p>
            </div>

            <div className="mt-5 space-y-2">
              {PRO_FEATURES.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-2 text-sm text-foreground"
                >
                  <Check
                    className="size-4 text-violet-600"
                    fill="currentColor"
                  />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-border pt-4">
              <Button
                type="button"
                variant="ghost"
                className="gap-2 text-red-600 hover:bg-red-500/10 hover:text-red-700"
                onClick={() => setIsCancelDialogOpen(true)}
              >
                <Trash2 className="size-4" />
                Cancel Subscription
              </Button>
            </div>
          </CardContent>
        </Card>

        <CancelSubscriptionDialog
          open={isCancelDialogOpen}
          onOpenChange={setIsCancelDialogOpen}
        />
      </>
    );
  }

  const maxClients = clientLimit ?? 3;
  const cappedUsage = Math.min(clientCount, maxClients);
  const usagePercent = Math.min((cappedUsage / maxClients) * 100, 100);

  const progressColorClass =
    cappedUsage <= 1
      ? "bg-green-500"
      : cappedUsage === 2
        ? "bg-amber-500"
        : "bg-red-500";

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Current Plan
          </p>
          <Badge variant="secondary">FREE</Badge>
        </div>

        <h2 className="mt-4 text-3xl font-bold text-foreground">Free Plan</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Get started with the basics
        </p>

        <div className="mt-5">
          <p className="mb-2 text-sm font-medium text-foreground">
            Client Usage
          </p>

          <div className="h-2.5 w-full overflow-hidden rounded-full bg-border/60">
            <div
              className={`h-full rounded-full transition-all ${progressColorClass}`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            {cappedUsage} of {maxClients} clients used
          </p>

          {cappedUsage >= maxClients ? (
            <p className="mt-1 text-xs font-medium text-red-600">
              You&apos;ve reached the client limit
            </p>
          ) : null}
        </div>

        <div className="mt-5 space-y-2">
          {FREE_FEATURES.map((feature) => (
            <div
              key={feature}
              className="flex items-center gap-2 text-sm text-foreground"
            >
              <Check className="size-4 text-green-600" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-border pt-4">
          <a
            href="#pricing-section"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Upgrade to Pro for unlimited clients →
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
