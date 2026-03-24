"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useClients } from "@/hooks/use-clients";
import { type ProjectStatus, useCreateProject } from "@/hooks/use-projects";
import { cn } from "@/lib/utils";

const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  clientId: z.string().min(1, "Please select a client"),
  status: z
    .enum(["NOT_STARTED", "IN_PROGRESS", "IN_REVIEW", "COMPLETED"])
    .default("NOT_STARTED"),
});

type CreateProjectFormValues = z.input<typeof createProjectSchema>;

type CreateProjectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultClientId?: string;
};

const STATUS_OPTIONS: Array<{
  value: ProjectStatus;
  label: string;
  dotClass: string;
}> = [
  {
    value: "NOT_STARTED",
    label: "Not Started",
    dotClass: "bg-slate-500",
  },
  {
    value: "IN_PROGRESS",
    label: "In Progress",
    dotClass: "bg-blue-500",
  },
  {
    value: "IN_REVIEW",
    label: "In Review",
    dotClass: "bg-amber-500",
  },
  {
    value: "COMPLETED",
    label: "Completed",
    dotClass: "bg-green-500",
  },
];

export default function CreateProjectDialog({
  open,
  onOpenChange,
  defaultClientId,
}: CreateProjectDialogProps) {
  const clientsQuery = useClients();
  const createProjectMutation = useCreateProject({
    suppressDefaultToasts: true,
  });

  const form = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      clientId: defaultClientId ?? "",
      status: "NOT_STARTED",
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset({
        name: "",
        clientId: defaultClientId ?? "",
        status: "NOT_STARTED",
      });
      return;
    }

    form.setValue("clientId", defaultClientId ?? "");
  }, [open, defaultClientId, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await createProjectMutation.mutateAsync(values);
      onOpenChange(false);
      form.reset({
        name: "",
        clientId: defaultClientId ?? "",
        status: "NOT_STARTED",
      });
      toast.success("Project created successfully");
    } catch {
      toast.error("Failed to create project. Please try again.");
    }
  });

  const clients = clientsQuery.data ?? [];
  const isClientsLoading = clientsQuery.isLoading;
  const hasClients = clients.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
          <DialogDescription>
            Add a new project and assign it to a client.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="project-name"
              className="text-sm font-medium text-foreground"
            >
              Project Name
            </label>
            <input
              id="project-name"
              type="text"
              placeholder="Website redesign"
              className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              {...form.register("name")}
            />
            {form.formState.errors.name ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="project-client"
              className="text-sm font-medium text-foreground"
            >
              Client
            </label>
            <Controller
              control={form.control}
              name="clientId"
              render={({ field }) => {
                const selectedClient = clients.find(
                  (client) => client.id === field.value,
                );

                if (isClientsLoading) {
                  return (
                    <Select value="loading" disabled>
                      <SelectTrigger id="project-client">
                        Loading clients...
                      </SelectTrigger>
                    </Select>
                  );
                }

                if (!hasClients) {
                  return (
                    <Select value="empty" disabled>
                      <SelectTrigger id="project-client">
                        No clients yet — add a client first
                      </SelectTrigger>
                    </Select>
                  );
                }

                return (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="project-client">
                      {selectedClient
                        ? `${selectedClient.name}${
                            selectedClient.companyName
                              ? ` — ${selectedClient.companyName}`
                              : ""
                          }`
                        : "Select a client"}
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          <div className="flex items-center gap-1.5">
                            <span>{client.name}</span>
                            {client.companyName ? (
                              <span className="text-muted-foreground">
                                — {client.companyName}
                              </span>
                            ) : null}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                );
              }}
            />
            {form.formState.errors.clientId ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.clientId.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="project-status"
              className="text-sm font-medium text-foreground"
            >
              Status
            </label>
            <Controller
              control={form.control}
              name="status"
              render={({ field }) => {
                const activeStatus =
                  STATUS_OPTIONS.find(
                    (option) => option.value === field.value,
                  ) ?? STATUS_OPTIONS[0];

                return (
                  <Select
                    value={field.value ?? "NOT_STARTED"}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="project-status">
                      <div className="flex items-center gap-2 text-sm">
                        <span
                          className={cn(
                            "size-2 rounded-full",
                            activeStatus.dotClass,
                          )}
                          aria-hidden="true"
                        />
                        <span>{activeStatus.label}</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "size-2 rounded-full",
                                option.dotClass,
                              )}
                              aria-hidden="true"
                            />
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                );
              }}
            />
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={createProjectMutation.isPending}
              className="gap-2"
            >
              {createProjectMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
