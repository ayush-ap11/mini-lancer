import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const PROJECT_SKELETON_KEYS = [
  "project-skeleton-1",
  "project-skeleton-2",
  "project-skeleton-3",
  "project-skeleton-4",
  "project-skeleton-5",
  "project-skeleton-6",
] as const;

export default function ProjectCardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {PROJECT_SKELETON_KEYS.map((key) => (
        <Card key={key}>
          <CardContent className="space-y-4 p-5">
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-9 w-full" />
            <div className="border-t border-border pt-3">
              <Skeleton className="h-4 w-28" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
