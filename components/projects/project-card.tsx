"use client";

import { Loader2, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { toast } from "sonner";
import ProjectStatusBadge from "@/components/projects/project-status-badge";
import StatusSelect from "@/components/projects/status-select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import type { Client } from "@/hooks/use-clients";
import { type Project, useDeleteProject } from "@/hooks/use-projects";

type ProjectCardProps = {
  project: Project;
  clients: Client[];
};

function formatDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ProjectCard({ project, clients }: ProjectCardProps) {
  const deleteProjectMutation = useDeleteProject();

  const clientName = useMemo(() => {
    return (
      clients.find((client) => client.id === project.clientId)?.name ??
      "Unknown client"
    );
  }, [clients, project.clientId]);

  const handleDelete = async () => {
    try {
      await deleteProjectMutation.mutateAsync(project.id);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete project";
      toast.error(message);
    }
  };

  return (
    <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-base font-semibold text-foreground">
            {project.name}
          </h3>
          <ProjectStatusBadge status={project.status} />
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="size-4" />
            <span>{clientName}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Created {formatDate(project.createdAt)}
          </p>
        </div>

        <StatusSelect projectId={project.id} currentStatus={project.status} />
      </CardContent>

      <div className="flex items-center justify-between border-t border-border px-5 py-3">
        <Link
          href={`/clients/${project.clientId}`}
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {clientName}
        </Link>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              aria-label={`Delete ${project.name}`}
            >
              <Trash2 className="size-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Project?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete {project.name}. Any invoices linked
                to this project will remain but lose the project association.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteProjectMutation.isPending}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(event) => {
                  event.preventDefault();
                  void handleDelete();
                }}
                disabled={deleteProjectMutation.isPending}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                {deleteProjectMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  );
}
