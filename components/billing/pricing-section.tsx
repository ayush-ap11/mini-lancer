"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreateSubscription } from "@/hooks/use-user";

type PricingSectionProps = {
  currentPlan: "FREE" | "PRO";
  isLoading: boolean;
};

const FREE_INCLUDED = [
  "Up to 3 clients",
  "Unlimited projects",
  "Unlimited invoices",
  "Client portal",
  "Razorpay payments",
] as const;

const FREE_EXCLUDED = ["Unlimited clients", "Priority support"] as const;

const PRO_FEATURES = [
  "Unlimited clients",
  "Unlimited projects",
  "Unlimited invoices",
  "Client portal",
  "Razorpay payments",
  "Priority support",
] as const;

let razorpayScriptPromise: Promise<void> | null = null;

function loadRazorpayScript() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Window is not available"));
  }

  if (window.Razorpay) {
    return Promise.resolve();
  }

  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error("Failed to load Razorpay script"));
      document.body.appendChild(script);
    });
  }

  return razorpayScriptPromise;
}

function UpgradeButton() {
  const queryClient = useQueryClient();
  const createSubscriptionMutation = useCreateSubscription();

  const handleUpgrade = async () => {
    try {
      const data = await createSubscriptionMutation.mutateAsync();

      await loadRazorpayScript();

      if (!window.Razorpay) {
        throw new Error("Razorpay failed to initialize");
      }

      const razorpay = new window.Razorpay({
        key: data.razorpayKeyId,
        subscription_id: data.subscriptionId,
        name: "Mini-lancer",
        description: "Pro Plan Subscription",
        handler: async () => {
          await queryClient.invalidateQueries({ queryKey: ["user-me"] });
        },
        theme: {
          color: "#7c3aed",
        },
      });

      razorpay.open();
    } catch {
      if (!createSubscriptionMutation.isError) {
        toast.error("Failed to open checkout. Please try again.");
      }
    }
  };

  return (
    <Button
      type="button"
      onClick={() => void handleUpgrade()}
      disabled={createSubscriptionMutation.isPending}
      className="w-full gap-2"
    >
      {createSubscriptionMutation.isPending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Starting...
        </>
      ) : (
        "Upgrade to Pro"
      )}
    </Button>
  );
}

export default function PricingSection({
  currentPlan,
  isLoading,
}: PricingSectionProps) {
  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="text-center">
          <Skeleton className="mx-auto h-8 w-44" />
          <Skeleton className="mx-auto mt-2 h-4 w-80" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Skeleton className="h-105 w-full rounded-xl" />
          <Skeleton className="h-105 w-full rounded-xl" />
        </div>
      </section>
    );
  }

  return (
    <section id="pricing-section" className="space-y-6 scroll-mt-24">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground">Plans & Pricing</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Simple, transparent pricing. Upgrade or downgrade anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="order-2 md:order-1">
          <CardContent className="flex h-full flex-col p-6">
            <h3 className="text-3xl font-bold text-foreground">Free</h3>
            <div className="mt-2 flex items-end gap-1">
              <span className="text-5xl font-bold text-foreground">₹0</span>
              <span className="mb-1 text-sm text-muted-foreground">/month</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Perfect for getting started
            </p>

            <div className="my-5 h-px w-full bg-border" />

            <div className="space-y-2">
              {FREE_INCLUDED.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-2 text-sm text-foreground"
                >
                  <Check className="size-4 text-green-600" />
                  <span>{feature}</span>
                </div>
              ))}

              {FREE_EXCLUDED.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <X className="size-4 text-red-600" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-2 border-t border-border pt-4">
              {currentPlan === "FREE" ? (
                <>
                  <Badge variant="secondary">Current Plan</Badge>
                  <Button
                    type="button"
                    variant="outline"
                    disabled
                    className="w-full"
                  >
                    Current Plan
                  </Button>
                </>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card className="order-1 relative border-primary-fixed/40 shadow-xl ring-2 ring-primary-fixed md:order-2">
          <span className="absolute top-4 right-4 rounded-full bg-primary-fixed px-2 py-1 text-xs font-semibold text-on-primary-fixed">
            Most Popular
          </span>

          <CardContent className="flex h-full flex-col p-6">
            <h3 className="flex items-center gap-2 text-3xl font-bold text-foreground">
              Pro <Sparkles className="size-5 text-primary-fixed" />
            </h3>
            <div className="mt-2 flex items-end gap-1">
              <span className="text-5xl font-bold text-foreground">₹499</span>
              <span className="mb-1 text-sm text-muted-foreground">/month</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              For freelancers serious about growth
            </p>

            <div className="my-5 h-px w-full bg-border" />

            <div className="space-y-2">
              {PRO_FEATURES.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-2 text-sm text-foreground"
                >
                  <Check className="size-4 text-primary-fixed" />
                  <span
                    className={
                      feature === "Unlimited clients"
                        ? "font-semibold"
                        : undefined
                    }
                  >
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-2 border-t border-border pt-4">
              {currentPlan === "FREE" ? (
                <UpgradeButton />
              ) : (
                <>
                  <Badge className="border-primary-fixed bg-primary-fixed text-on-primary-fixed">
                    Current Plan
                  </Badge>
                  <p className="text-sm font-medium text-green-600">
                    You&apos;re all set! ✓
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
