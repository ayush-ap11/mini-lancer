import { Skeleton } from "@/components/ui/skeleton";

export default function BillingSkeleton() {
  return (
    <div className="space-y-6">
      <section>
        <Skeleton className="h-10 w-56" />
        <Skeleton className="mt-2 h-4 w-72" />
      </section>

      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>

        <Skeleton className="mt-4 h-9 w-40" />
        <Skeleton className="mt-2 h-4 w-60" />

        <div className="mt-5 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-2.5 w-full" />
          <Skeleton className="h-4 w-36" />
        </div>

        <div className="mt-5 space-y-2">
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-60" />
          <Skeleton className="h-4 w-56" />
        </div>
      </section>

      <div className="h-px w-full bg-border" />

      <section className="space-y-6">
        <div className="text-center">
          <Skeleton className="mx-auto h-8 w-44" />
          <Skeleton className="mx-auto mt-2 h-4 w-80" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Skeleton className="h-[420px] w-full rounded-xl" />
          <Skeleton className="h-[420px] w-full rounded-xl" />
        </div>
      </section>
    </div>
  );
}
