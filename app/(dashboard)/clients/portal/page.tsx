"use client";

import { Link2, Search, SearchX } from "lucide-react";
import { useMemo, useState } from "react";
import PortalLinkRow from "@/components/clients/portal-link-row";
import { Skeleton } from "@/components/ui/skeleton";
import { useClients } from "@/hooks/use-clients";

const PORTAL_LINK_SKELETON_KEYS = [
  "portal-link-skeleton-1",
  "portal-link-skeleton-2",
  "portal-link-skeleton-3",
  "portal-link-skeleton-4",
] as const;

export default function ClientPortalLinksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const clientsQuery = useClients();

  const clients = clientsQuery.data ?? [];

  const sortedClients = useMemo(() => {
    return [...clients].sort((a, b) => a.name.localeCompare(b.name));
  }, [clients]);

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredClients = useMemo(() => {
    if (!normalizedSearch) {
      return sortedClients;
    }

    return sortedClients.filter((client) => {
      const companyName = client.companyName ?? "";

      return (
        client.name.toLowerCase().includes(normalizedSearch) ||
        client.email.toLowerCase().includes(normalizedSearch) ||
        companyName.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [normalizedSearch, sortedClients]);

  const showLoading = clientsQuery.isLoading;
  const showNoResults =
    !showLoading && sortedClients.length > 0 && filteredClients.length === 0;

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-headline font-bold text-foreground">
          Client Portal Links
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Send, copy, and open secure client portal links.
        </p>
      </section>

      <section>
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search clients..."
            className="h-10 w-full rounded-md border border-border bg-card pl-9 pr-3 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
            aria-label="Search clients for portal links"
          />
        </div>
      </section>

      {showLoading ? (
        <section className="space-y-3">
          {PORTAL_LINK_SKELETON_KEYS.map((skeletonKey) => (
            <div
              key={skeletonKey}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </div>
            </div>
          ))}
        </section>
      ) : showNoResults ? (
        <section className="flex min-h-[40vh] flex-col items-center justify-center text-center">
          <SearchX className="size-10 text-muted-foreground/70" />
          <h2 className="mt-3 text-xl font-semibold text-foreground">
            No matching clients
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a different name, email, or company.
          </p>
        </section>
      ) : (
        <section className="space-y-3">
          {filteredClients.map((client) => (
            <PortalLinkRow key={client.id} client={client} />
          ))}
        </section>
      )}

      {!showLoading && clients.length === 0 ? (
        <section className="flex min-h-[40vh] flex-col items-center justify-center text-center">
          <Link2 className="size-10 text-muted-foreground/70" />
          <h2 className="mt-3 text-xl font-semibold text-foreground">
            No clients yet
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a client first to generate and share a portal link.
          </p>
        </section>
      ) : null}
    </div>
  );
}
