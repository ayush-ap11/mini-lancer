import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const INVOICE_LINE_SKELETON_KEYS = [
  "invoice-line-skeleton-1",
  "invoice-line-skeleton-2",
  "invoice-line-skeleton-3",
  "invoice-line-skeleton-4",
] as const;

export default function InvoiceDetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-5 w-40" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-26" />
          <Skeleton className="h-9 w-26" />
        </div>
      </div>

      <Card className="mx-auto max-w-3xl bg-white text-slate-900 dark:bg-white dark:text-slate-900">
        <CardContent className="space-y-6 p-8">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-10 w-36" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="space-y-2 text-right">
              <Skeleton className="ml-auto h-8 w-20 rounded-full" />
              <Skeleton className="ml-auto h-4 w-32" />
              <Skeleton className="ml-auto h-4 w-32" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 border-t border-slate-200 pt-6 md:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="space-y-2 md:text-right">
              <Skeleton className="h-3 w-8 md:ml-auto" />
              <Skeleton className="h-5 w-36 md:ml-auto" />
              <Skeleton className="h-4 w-28 md:ml-auto" />
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200">
            <div className="grid grid-cols-[50px_1fr_90px_120px_120px] gap-2 bg-slate-100 px-3 py-2">
              <Skeleton className="h-4 w-6" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-14" />
            </div>
            <div>
              {INVOICE_LINE_SKELETON_KEYS.map((skeletonKey) => (
                <div
                  key={skeletonKey}
                  className="grid grid-cols-[50px_1fr_90px_120px_120px] gap-2 border-t border-slate-200 px-3 py-3"
                >
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-18" />
                </div>
              ))}
            </div>
          </div>

          <div className="ml-auto w-full max-w-xs space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-px w-full" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
