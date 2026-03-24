"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { type ProjectStatus, useUpdateProject } from "@/hooks/use-projects";
import { cn } from "@/lib/utils";

type StatusSelectProps = {
  projectId: string;
  currentStatus: ProjectStatus;
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

function getStatusConfig(status: ProjectStatus) {
  return (
    STATUS_OPTIONS.find((option) => option.value === status) ??
    STATUS_OPTIONS[0]
  );
}

export default function StatusSelect({
  projectId,
  currentStatus,
}: StatusSelectProps) {
  const [localStatus, setLocalStatus] = useState<ProjectStatus>(currentStatus);
  const updateProjectMutation = useUpdateProject();

  useEffect(() => {
    setLocalStatus(currentStatus);
  }, [currentStatus]);

  const handleChange = (newStatus: string) => {
    const nextStatus = newStatus as ProjectStatus;
    const previousStatus = localStatus;

    setLocalStatus(nextStatus);

    updateProjectMutation.mutate(
      {
        projectId,
        data: { status: nextStatus },
      },
      {
        onError: () => {
          setLocalStatus(previousStatus);
          toast.error("Failed to update status. Please try again.");
        },
      },
    );
  };

  const activeStatus = getStatusConfig(localStatus);

  return (
    <Select
      value={localStatus}
      onValueChange={handleChange}
      disabled={updateProjectMutation.isPending}
    >
      <SelectTrigger
        className={cn(
          "h-9 border-border/70 bg-transparent",
          updateProjectMutation.isPending && "opacity-70",
        )}
        aria-label="Update project status"
      >
        <div className="flex items-center gap-2 text-sm">
          <span
            className={cn("size-2 rounded-full", activeStatus.dotClass)}
            aria-hidden="true"
          />
          <span>{activeStatus.label}</span>
          {updateProjectMutation.isPending ? (
            <Loader2 className="ml-auto size-3.5 animate-spin text-muted-foreground" />
          ) : null}
        </div>
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-center gap-2">
              <span
                className={cn("size-2 rounded-full", option.dotClass)}
                aria-hidden="true"
              />
              <span>{option.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
