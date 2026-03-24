"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
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

type PipelineProjectCardProps = {
  project: Project;
  clients: Client[];
};

export default function PipelineProjectCard({
  project,
  clients,
}: PipelineProjectCardProps) {
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
    <Card className="hover:shadow-sm">
      <CardContent className="space-y-3 p-3">
        <p className="truncate text-sm font-semibold text-foreground">
          {project.name}
        </p>
        <p className="truncate text-xs text-muted-foreground">{clientName}</p>

        <StatusSelect projectId={project.id} currentStatus={project.status} />

        <div className="flex justify-end">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                aria-label={`Delete ${project.name}`}
              >
                <Trash2 className="size-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Project?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete {project.name}. Any invoices
                  linked to this project will remain but lose the project
                  association.
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
      </CardContent>
    </Card>
  );
}
