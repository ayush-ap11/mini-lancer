import Link from "next/link";
import { Users } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Client } from "@/hooks/use-clients";

type RecentClientsTableProps = {
  clients: Client[];
  isLoading: boolean;
};

const avatarColorClasses = [
  "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
  "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  "bg-rose-500/15 text-rose-700 dark:text-rose-300",
] as const;

function getAvatarColor(name: string) {
  if (!name) {
    return avatarColorClasses[0];
  }

  const firstChar = name.trim().charAt(0).toUpperCase();
  const index = firstChar
    ? firstChar.charCodeAt(0) % avatarColorClasses.length
    : 0;
  return avatarColorClasses[index];
}

function getRecentClients(clients: Client[]) {
  return clients.slice(-5).reverse();
}

function formatAddedDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
}

function LoadingRows() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={`client-row-skeleton-${index}`}
          className="grid grid-cols-[1.8fr_1.1fr_1.6fr_0.8fr] items-center gap-3 border-b border-border/60 pb-3 last:border-0"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-14" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <Users className="size-10 text-muted-foreground/60" />
      <h3 className="mt-3 text-base font-semibold text-foreground">
        No clients yet
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Add your first client to see them here
      </p>
      <Link
        href="/clients"
        className="mt-4 inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
      >
        Add Client
      </Link>
    </div>
  );
}

export default function RecentClientsTable({
  clients,
  isLoading,
}: RecentClientsTableProps) {
  const recentClients = getRecentClients(clients);

  return (
    <Card>
      <CardHeader>
        <h2 className="text-base font-semibold text-foreground">
          Recent Clients
        </h2>
      </CardHeader>

      <CardContent className="pt-4">
        {isLoading ? (
          <LoadingRows />
        ) : recentClients.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-110 text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-2 py-2 font-medium">Client</th>
                  <th className="px-2 py-2 font-medium">Company</th>
                  <th className="px-2 py-2 font-medium">Email</th>
                  <th className="px-2 py-2 font-medium">Added</th>
                </tr>
              </thead>
              <tbody>
                {recentClients.map((client) => {
                  const firstLetter =
                    client.name.trim().charAt(0).toUpperCase() || "?";
                  const avatarClassName = getAvatarColor(client.name);

                  return (
                    <tr
                      key={client.id}
                      className="border-b border-border/60 last:border-0"
                    >
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatarClassName}`}
                          >
                            {firstLetter}
                          </div>
                          <span className="font-medium text-foreground">
                            {client.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-3 text-muted-foreground">
                        {client.companyName?.trim() ? client.companyName : "—"}
                      </td>
                      <td className="px-2 py-3 text-muted-foreground">
                        {client.email}
                      </td>
                      <td className="px-2 py-3 text-muted-foreground">
                        {formatAddedDate(client.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Link
            href="/clients"
            className="text-xs font-medium text-violet-500/90 transition-colors hover:text-violet-500"
          >
            View all clients →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
