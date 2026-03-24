import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Client } from "@/hooks/use-clients";
import type { Project, ProjectStatus } from "@/hooks/use-projects";
import { cn } from "@/lib/utils";
import PipelineProjectCard from "@/components/projects/pipeline-project-card";

type ProjectPipelineProps = {
  projects: Project[];
  clients: Client[];
  isLoading: boolean;
};

const STATUS_COLUMNS: Array<{
  status: ProjectStatus;
  label: string;
  borderClassName: string;
}> = [
  {
    status: "NOT_STARTED",
    label: "Not Started",
    borderClassName: "border-slate-400",
  },
  {
    status: "IN_PROGRESS",
    label: "In Progress",
    borderClassName: "border-blue-500",
  },
  {
    status: "IN_REVIEW",
    label: "In Review",
    borderClassName: "border-amber-500",
  },
  {
    status: "COMPLETED",
    label: "Completed",
    borderClassName: "border-green-500",
  },
];

const PIPELINE_SKELETON_KEYS = ["pl-1", "pl-2", "pl-3"] as const;

export default function ProjectPipeline({
  projects,
  clients,
  isLoading,
}: ProjectPipelineProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory xl:grid xl:grid-cols-4 xl:overflow-visible">
      {STATUS_COLUMNS.map((column) => {
        const projectsInColumn = projects.filter(
          (project) => project.status === column.status,
        );

        return (
          <Card
            key={column.status}
            className="min-w-70 snap-start border-t-2 xl:min-w-0"
          >
            <CardHeader className={cn("border-t-2", column.borderClassName)}>
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-foreground">
                  {column.label}
                </h3>
                <Badge variant="secondary">{projectsInColumn.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="max-h-130 space-y-2 overflow-y-auto pr-1">
              {isLoading ? (
                PIPELINE_SKELETON_KEYS.map((key) => (
                  <Card key={key}>
                    <CardContent className="space-y-2 p-3">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-28" />
                      <Skeleton className="h-8 w-full" />
                    </CardContent>
                  </Card>
                ))
              ) : projectsInColumn.length === 0 ? (
                <div className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  No projects
                </div>
              ) : (
                projectsInColumn.map((project) => (
                  <PipelineProjectCard
                    key={project.id}
                    project={project}
                    clients={clients}
                  />
                ))
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
