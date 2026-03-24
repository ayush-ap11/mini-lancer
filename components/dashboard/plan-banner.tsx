import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type PlanBannerProps = {
  plan: "FREE" | "PRO";
  clientCount: number;
  isLoading: boolean;
};

export default function PlanBanner({
  plan,
  clientCount,
  isLoading,
}: PlanBannerProps) {
  if (isLoading) {
    return <Skeleton className="h-27 w-full rounded-xl" />;
  }

  if (plan !== "FREE") {
    return null;
  }

  const maxClients = 3;
  const usage = Math.min(clientCount, maxClients);
  const progress = (usage / maxClients) * 100;

  const progressColorClass =
    usage <= 1 ? "bg-emerald-500" : usage === 2 ? "bg-amber-500" : "bg-red-500";

  return (
    <Card className="border-violet-300/40 bg-linear-to-r from-violet-500/10 to-indigo-500/10">
      <CardContent className="p-5">
        <div className="min-w-0 flex flex-col">
          <div className="flex justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                You&apos;re on the Free Plan
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {usage} of 3 clients used. Upgrade to Pro for unlimited clients
                and more.
              </p>
            </div>

            <Link
              href="/dashboard/billing"
              className="mt-3 inline-flex items-center justify-center rounded-md border border-violet-400/40 bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Upgrade to Pro →
            </Link>
          </div>

          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-border/60">
            <div
              className={`h-full rounded-full transition-all ${progressColorClass}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
