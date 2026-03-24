import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description: string;
  iconColor: string;
  iconBg: string;
  isLoading: boolean;
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  description,
  iconColor,
  iconBg,
  isLoading,
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {title}
          </p>
          {isLoading ? (
            <Skeleton className="h-9 w-9 rounded-lg" />
          ) : (
            <div className={cn("rounded-lg p-2", iconBg)}>
              <Icon className={cn("size-4", iconColor)} />
            </div>
          )}
        </div>

        {isLoading ? (
          <>
            <Skeleton className="mt-3 h-8 w-24" />
            <Skeleton className="mt-2 h-4 w-40" />
          </>
        ) : (
          <>
            <p className="mt-3 text-2xl font-bold text-foreground">{value}</p>
            <p className="mt-2 text-xs text-muted-foreground">{description}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
