"use client";

import { FolderOpen } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjects } from "@/hooks/use-projects";
import { cn } from "@/lib/utils";

type ClientProjectsSectionProps = {
  clientId: string;
  isLoading: boolean;
};

function formatDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const PROJECT_ROW_SKELETON_KEYS = [
  "project-row-1",
  "project-row-2",
  "project-row-3",
] as const;

export default function ClientProjectsSection({
  clientId,
  isLoading,
}: ClientProjectsSectionProps) {
  const projectsQuery = useProjects(clientId);

  const projects = projectsQuery.data ?? [];
  const showLoading = isLoading || projectsQuery.isLoading;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-foreground">
              Projects
            </h2>
            <Badge variant="secondary">{projects.length}</Badge>
          </div>

          <Link href={`/projects?clientId=${clientId}`}>
            <Button variant="outline" size="sm">
              New Project
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent>
        {showLoading ? (
          <div className="space-y-3">
            {PROJECT_ROW_SKELETON_KEYS.map((key) => (
              <div key={key} className="grid grid-cols-3 gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FolderOpen className="size-4" />
            <span>No projects for this client yet</span>
            <Link
              href={`/projects?clientId=${clientId}`}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "h-auto px-1 py-0 text-primary",
              )}
            >
              Create a project →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-140 text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-2 py-2 font-medium">Project Name</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                  <th className="px-2 py-2 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr
                    key={project.id}
                    className="border-b border-border/60 last:border-0"
                  >
                    <td className="px-2 py-3">
                      <Link
                        href="/projects"
                        className="font-medium text-foreground hover:underline"
                      >
                        {project.name}
                      </Link>
                    </td>
                    <td className="px-2 py-3 text-muted-foreground">
                      {project.status}
                    </td>
                    <td className="px-2 py-3 text-muted-foreground">
                      {formatDate(project.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
