"use client";

import {
  FolderOpen,
  Kanban,
  LayoutGrid,
  Plus,
  Search,
  SearchX,
  X,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import CreateProjectDialog from "@/components/projects/create-project-dialog";
import ProjectCard from "@/components/projects/project-card";
import ProjectCardSkeleton from "@/components/projects/project-card-skeleton";
import ProjectPipeline from "@/components/projects/project-pipeline";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClients } from "@/hooks/use-clients";
import { type ProjectStatus, useProjects } from "@/hooks/use-projects";
import { cn } from "@/lib/utils";

type StatusFilter = "ALL" | ProjectStatus;
type ViewMode = "grid" | "pipeline";

const STATUS_OPTIONS: Array<{ label: string; value: StatusFilter }> = [
  { label: "All Statuses", value: "ALL" },
  { label: "Not Started", value: "NOT_STARTED" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "In Review", value: "IN_REVIEW" },
  { label: "Completed", value: "COMPLETED" },
];

export default function ProjectsPage() {
  const searchParams = useSearchParams();
  const urlClientId = searchParams.get("clientId");

  const [search, setSearch] = useState("");
  const [clientFilter, setClientFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (urlClientId) {
      setClientFilter(urlClientId);
      return;
    }

    setClientFilter("ALL");
  }, [urlClientId]);

  const filteredClientId = clientFilter !== "ALL" ? clientFilter : undefined;

  const { data: projects = [], isLoading: projectsLoading } =
    useProjects(filteredClientId);
  const { data: clients = [] } = useClients();

  const normalizedSearch = search.trim().toLowerCase();

  const filteredProjects = useMemo(() => {
    return projects
      .filter((project) =>
        project.name.toLowerCase().includes(normalizedSearch),
      )
      .filter((project) =>
        statusFilter === "ALL" ? true : project.status === statusFilter,
      );
  }, [projects, normalizedSearch, statusFilter]);

  const hasActiveFilters =
    normalizedSearch.length > 0 ||
    statusFilter !== "ALL" ||
    clientFilter !== "ALL";

  const hasNoProjectsAtAll = !projectsLoading && projects.length === 0;
  const hasNoFilteredResults =
    !projectsLoading && projects.length > 0 && filteredProjects.length === 0;

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground">
            Projects
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your work across all clients
          </p>
        </div>

        <Button className="gap-2" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          New Project
        </Button>
      </section>

      <section className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1 space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search projects"
              className="h-10 w-full rounded-md border border-border bg-card pl-9 pr-9 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2">
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as StatusFilter)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={clientFilter} onValueChange={setClientFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Clients</SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <div className="inline-flex rounded-md border border-border bg-card p-1">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={cn(
                "inline-flex items-center gap-1 rounded px-3 py-1.5 text-xs font-medium transition-colors",
                viewMode === "grid"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-pressed={viewMode === "grid"}
            >
              <LayoutGrid className="size-3.5" />
              Grid
            </button>

            <button
              type="button"
              onClick={() => setViewMode("pipeline")}
              className={cn(
                "inline-flex items-center gap-1 rounded px-3 py-1.5 text-xs font-medium transition-colors",
                viewMode === "pipeline"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-pressed={viewMode === "pipeline"}
            >
              <Kanban className="size-3.5" />
              Pipeline
            </button>
          </div>

          {hasActiveFilters ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-8"
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
                setClientFilter(urlClientId ?? "ALL");
              }}
            >
              Clear
            </Button>
          ) : null}
        </div>
      </section>

      <section>
        {projectsLoading ? (
          <ProjectCardSkeleton />
        ) : hasNoProjectsAtAll ? (
          <div className="flex min-h-[45vh] flex-col items-center justify-center text-center">
            <FolderOpen className="size-16 text-muted-foreground/70" />
            <h2 className="mt-4 text-xl font-semibold text-foreground">
              No projects yet
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first project to start tracking your work
            </p>
            <Button className="mt-4 gap-2" onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              New Project
            </Button>
          </div>
        ) : hasNoFilteredResults ? (
          <div className="flex min-h-[45vh] flex-col items-center justify-center text-center">
            <SearchX className="size-12 text-muted-foreground/70" />
            <h2 className="mt-4 text-xl font-semibold text-foreground">
              No projects match your filters
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
            <Button
              variant="ghost"
              className="mt-3"
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
                setClientFilter(urlClientId ?? "ALL");
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                clients={clients}
              />
            ))}
          </div>
        ) : (
          <ProjectPipeline
            projects={filteredProjects}
            clients={clients}
            isLoading={projectsLoading}
          />
        )}
      </section>

      <CreateProjectDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        defaultClientId={urlClientId ?? undefined}
      />
    </div>
  );
}
