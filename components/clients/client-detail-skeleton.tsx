import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const PROJECT_SKELETON_KEYS = ["p1", "p2", "p3"] as const;
const INVOICE_SKELETON_KEYS = ["i1", "i2", "i3"] as const;

export default function ClientDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-28" />
      </div>

      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="mt-3 h-4 w-72" />
      </section>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="order-1 space-y-4 xl:order-2 xl:col-span-5">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-40" />
            </CardContent>
          </Card>
        </div>

        <div className="order-2 space-y-4 xl:order-1 xl:col-span-7">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent className="space-y-3">
              {PROJECT_SKELETON_KEYS.map((key) => (
                <div key={key} className="space-y-2">
                  <Skeleton className="h-4 w-52" />
                  <Skeleton className="h-3 w-32" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent className="space-y-3">
              {INVOICE_SKELETON_KEYS.map((key) => (
                <div key={key} className="space-y-2">
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-3 w-40" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
