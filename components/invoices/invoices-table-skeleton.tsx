import { Skeleton } from "@/components/ui/skeleton";

const INVOICE_TABLE_SKELETON_KEYS = [
  "invoice-table-skeleton-1",
  "invoice-table-skeleton-2",
  "invoice-table-skeleton-3",
  "invoice-table-skeleton-4",
  "invoice-table-skeleton-5",
] as const;

export default function InvoicesTableSkeleton() {
  return (
    <tbody>
      {INVOICE_TABLE_SKELETON_KEYS.map((skeletonKey) => (
        <tr key={skeletonKey} className="border-b border-border/60">
          <td className="px-4 py-3">
            <Skeleton className="h-4 w-28" />
          </td>
          <td className="px-4 py-3">
            <Skeleton className="h-4 w-32" />
          </td>
          <td className="px-4 py-3 text-right">
            <Skeleton className="ml-auto h-4 w-24" />
          </td>
          <td className="px-4 py-3">
            <Skeleton className="h-6 w-20 rounded-full" />
          </td>
          <td className="px-4 py-3">
            <Skeleton className="h-4 w-28" />
          </td>
          <td className="px-4 py-3">
            <div className="ml-auto flex w-fit gap-2">
              <Skeleton className="size-8 rounded-md" />
              <Skeleton className="size-8 rounded-md" />
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  );
}
