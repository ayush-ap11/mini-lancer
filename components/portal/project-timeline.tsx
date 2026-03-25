import { Check, CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { PortalProject, PortalProjectStatus } from "@/hooks/use-portal";
import { cn } from "@/lib/utils";

type ProjectTimelineProps = {
  projects: PortalProject[];
};

type ProjectFilter = "ALL" | "REMAINING" | "COMPLETED";

type StageConfig = {
  status: PortalProjectStatus;
  label: string;
};

const STAGES: StageConfig[] = [
  { status: "NOT_STARTED", label: "Not Started" },
  { status: "IN_PROGRESS", label: "In Progress" },
  { status: "IN_REVIEW", label: "In Review" },
  { status: "COMPLETED", label: "Completed" },
];

const STATUS_ORDER: Record<PortalProjectStatus, number> = {
  NOT_STARTED: 0,
  IN_PROGRESS: 1,
  IN_REVIEW: 2,
  COMPLETED: 3,
};

function getStatusMeta(status: PortalProjectStatus) {
  if (status === "NOT_STARTED") {
    return {
      dotClass: "bg-slate-400",
      cardClass: "border-l-slate-400",
      label: "Not Started",
      labelClass: "bg-slate-100 text-slate-600",
    };
  }

  if (status === "IN_PROGRESS") {
    return {
      dotClass: "bg-blue-500",
      cardClass: "border-l-blue-500",
      label: "In Progress",
      labelClass: "bg-blue-100 text-blue-700",
    };
  }

  if (status === "IN_REVIEW") {
    return {
      dotClass: "bg-amber-500",
      cardClass: "border-l-amber-500",
      label: "In Review",
      labelClass: "bg-amber-100 text-amber-700",
    };
  }

  return {
    dotClass: "bg-green-600",
    cardClass: "border-l-green-600",
    label: "Completed",
    labelClass: "bg-green-100 text-green-700",
  };
}

function formatCreatedDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ProjectStatusBadge({ status }: { status: PortalProjectStatus }) {
  const meta = getStatusMeta(status);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        meta.labelClass,
      )}
    >
      {meta.label}
    </span>
  );
}

function isCompletedProject(project: PortalProject) {
  return project.status === "COMPLETED";
}

function compareByStatusThenCreatedAt(a: PortalProject, b: PortalProject) {
  const statusDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];

  if (statusDiff !== 0) {
    return statusDiff;
  }

  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
}

function getFilteredProjects(projects: PortalProject[], filter: ProjectFilter) {
  if (filter === "REMAINING") {
    return projects.filter((project) => !isCompletedProject(project));
  }

  if (filter === "COMPLETED") {
    return projects.filter((project) => isCompletedProject(project));
  }

  return projects;
}

export default function ProjectTimeline({ projects }: ProjectTimelineProps) {
  const [filter, setFilter] = useState<ProjectFilter>("ALL");

  const orderedProjects = useMemo(() => {
    const remaining = projects
      .filter((project) => !isCompletedProject(project))
      .sort(compareByStatusThenCreatedAt);
    const completed = projects
      .filter((project) => isCompletedProject(project))
      .sort(compareByStatusThenCreatedAt);

    return [...remaining, ...completed];
  }, [projects]);

  const visibleProjects = useMemo(() => {
    return getFilteredProjects(orderedProjects, filter);
  }, [orderedProjects, filter]);

  const timelineSourceProjects = useMemo(() => {
    const remaining = orderedProjects.filter(
      (project) => !isCompletedProject(project),
    );

    if (remaining.length > 0) {
      return remaining;
    }

    return orderedProjects;
  }, [orderedProjects]);

  const currentStageOrder = timelineSourceProjects.reduce(
    (maxOrder, project) => {
      return Math.max(maxOrder, STATUS_ORDER[project.status]);
    },
    0,
  );

  const remainingCount = orderedProjects.filter(
    (project) => !isCompletedProject(project),
  ).length;
  const completedCount = orderedProjects.length - remainingCount;

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              filter === "ALL"
                ? "bg-orange-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            )}
          >
            All ({orderedProjects.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("REMAINING")}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              filter === "REMAINING"
                ? "bg-orange-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            )}
          >
            Remaining ({remainingCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("COMPLETED")}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              filter === "COMPLETED"
                ? "bg-orange-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            )}
          >
            Completed ({completedCount})
          </button>
        </div>
      </section>

      <div className="hidden rounded-xl border border-slate-200 bg-white p-5 md:block">
        <div className="flex items-start">
          {STAGES.map((stage, index) => {
            const stageOrder = STATUS_ORDER[stage.status];
            const reached = stageOrder <= currentStageOrder;
            const isCurrent = stageOrder === currentStageOrder;

            return (
              <div key={stage.status} className="flex flex-1 items-start">
                <div className="flex w-full flex-col items-center">
                  <div
                    className={cn(
                      "flex size-8 items-center justify-center rounded-full border-2",
                      reached
                        ? "border-orange-600 bg-orange-600 text-white"
                        : "border-slate-300 bg-white text-slate-300",
                      isCurrent &&
                        "ring-2 ring-orange-600 ring-offset-2 ring-offset-white animate-pulse",
                    )}
                  >
                    {reached ? <Check className="size-4" /> : null}
                  </div>
                  <p className="mt-2 text-xs font-medium text-slate-600">
                    {stage.label}
                  </p>
                </div>
                {index < STAGES.length - 1 ? (
                  <div
                    className={cn(
                      "mt-4 h-0.5 flex-1",
                      reached
                        ? "bg-orange-600"
                        : "border-t border-dashed border-slate-200",
                    )}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 md:hidden">
        <div className="space-y-4">
          {STAGES.map((stage, index) => {
            const stageOrder = STATUS_ORDER[stage.status];
            const reached = stageOrder <= currentStageOrder;
            const isCurrent = stageOrder === currentStageOrder;

            return (
              <div key={`${stage.status}-mobile`} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex size-6 items-center justify-center rounded-full border-2",
                      reached
                        ? "border-orange-600 bg-orange-600 text-white"
                        : "border-slate-300 bg-white text-slate-300",
                      isCurrent &&
                        "ring-2 ring-orange-600 ring-offset-2 ring-offset-white animate-pulse",
                    )}
                  >
                    {reached ? <Check className="size-3.5" /> : null}
                  </div>
                  {index < STAGES.length - 1 ? (
                    <div
                      className={cn(
                        "mt-1 h-8 w-0.5",
                        reached
                          ? "bg-orange-600"
                          : "border-l border-dashed border-slate-300",
                      )}
                    />
                  ) : null}
                </div>
                <p className="pt-1 text-sm font-medium text-slate-700">
                  {stage.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        {visibleProjects.map((project) => {
          const meta = getStatusMeta(project.status);
          const isCompleted = project.status === "COMPLETED";

          return (
            <article
              key={project.id}
              className={cn(
                "rounded-xl border border-slate-200 border-l-4 bg-white p-4 shadow-sm",
                meta.cardClass,
                isCompleted && "bg-green-50",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-block size-3 rounded-full",
                        meta.dotClass,
                      )}
                    />
                    <h3 className="text-base font-semibold text-slate-900">
                      {project.name}
                    </h3>
                  </div>

                  <p className="text-sm text-slate-500">
                    Created {formatCreatedDate(project.createdAt)}
                  </p>

                  {isCompleted ? (
                    <p className="inline-flex items-center gap-1 text-sm font-medium text-green-700">
                      Completed <CheckCircle2 className="size-4" />
                    </p>
                  ) : null}
                </div>

                <ProjectStatusBadge status={project.status} />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
