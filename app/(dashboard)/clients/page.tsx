"use client";

import {
  AlertTriangle,
  Plus,
  Search,
  SearchX,
  UserPlus,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import AddClientDialog from "@/components/clients/add-client-dialog";
import ClientCard from "@/components/clients/client-card";
import ClientCardSkeleton from "@/components/clients/client-card-skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/Button";
import { useClients } from "@/hooks/use-clients";
import { useUserMe } from "@/hooks/use-user";

const CLIENT_SKELETON_KEYS = [
  "client-skeleton-1",
  "client-skeleton-2",
  "client-skeleton-3",
  "client-skeleton-4",
  "client-skeleton-5",
  "client-skeleton-6",
] as const;

type AddClientButtonProps = {
  canAddClient: boolean;
  onClick: () => void;
};

function AddClientButton({ canAddClient, onClick }: AddClientButtonProps) {
  const tooltipText = "Upgrade to Pro to add more clients";

  return (
    <span className="group relative inline-flex">
      <Button
        onClick={onClick}
        disabled={!canAddClient}
        className="gap-2"
        aria-label="Add Client"
      >
        <Plus className="size-4" />
        Add Client
      </Button>

      {!canAddClient ? (
        <span
          role="tooltip"
          className="pointer-events-none absolute -top-11 left-1/2 z-20 -translate-x-1/2 rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background opacity-0 transition-opacity group-hover:opacity-100"
        >
          {tooltipText}
        </span>
      ) : null}
    </span>
  );
}

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);

  const clientsQuery = useClients();
  const userMeQuery = useUserMe();

  const clients = clientsQuery.data ?? [];
  const userMe = userMeQuery.data;

  const sortedClients = useMemo(() => {
    return [...clients].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
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
        companyName.toLowerCase().includes(normalizedSearch) ||
        client.email.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [normalizedSearch, sortedClients]);

  const plan = userMe?.plan;
  const clientCount = userMe?.clientCount ?? clients.length;
  const canAddClient = userMe?.canAddClient ?? true;

  const showPlanWarning = plan === "FREE" && clientCount >= 2;
  const showLimitReached = clientCount === 3;

  const showLoading = clientsQuery.isLoading || userMeQuery.isLoading;
  const showNoClients = !showLoading && sortedClients.length === 0;
  const showNoSearchResults =
    !showLoading && sortedClients.length > 0 && filteredClients.length === 0;

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground">
            Clients
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your client relationships
          </p>
        </div>
        <AddClientButton
          canAddClient={canAddClient}
          onClick={() => setIsAddClientOpen(true)}
        />
      </section>

      {showPlanWarning ? (
        <Alert className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-tertiary" />
          <AlertDescription>
            {showLimitReached
              ? "You've reached the Free plan limit."
              : `You have ${clientCount} of 3 clients on the Free plan.`}{" "}
            <Link
              href="/billing"
              className="font-semibold text-primary hover:underline"
            >
              Upgrade to Pro
            </Link>
          </AlertDescription>
        </Alert>
      ) : null}

      <section>
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search clients..."
            className="h-10 w-full rounded-md border border-border bg-card pl-9 pr-9 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
            aria-label="Search clients"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
      </section>

      <section>
        {showLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {CLIENT_SKELETON_KEYS.map((skeletonKey) => (
              <ClientCardSkeleton key={skeletonKey} />
            ))}
          </div>
        ) : showNoClients ? (
          <div className="flex min-h-[45vh] flex-col items-center justify-center text-center">
            <UserPlus className="size-12 text-muted-foreground/70" />
            <h2 className="mt-4 text-xl font-semibold text-foreground">
              No clients yet
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Add your first client to start managing your work
            </p>
            <div className="mt-4">
              <AddClientButton
                canAddClient={canAddClient}
                onClick={() => setIsAddClientOpen(true)}
              />
            </div>
          </div>
        ) : showNoSearchResults ? (
          <div className="flex min-h-[45vh] flex-col items-center justify-center text-center">
            <SearchX className="size-12 text-muted-foreground/70" />
            <h2 className="mt-4 text-xl font-semibold text-foreground">
              No clients found
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different search term
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredClients.map((client) => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>
        )}
      </section>

      <AddClientDialog
        open={isAddClientOpen}
        onOpenChange={setIsAddClientOpen}
      />
    </div>
  );
}
