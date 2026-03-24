import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ProjectStatusBadgeProps = {
  status: "NOT_STARTED" | "IN_PROGRESS" | "IN_REVIEW" | "COMPLETED";
  size?: "sm" | "default";
};

function getStatusConfig(status: ProjectStatusBadgeProps["status"]) {
  if (status === "NOT_STARTED") {
    return {
      label: "Not Started",
      className:
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    };
  }

  if (status === "IN_PROGRESS") {
    return {
      label: "In Progress",
      className:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    };
  }

  if (status === "IN_REVIEW") {
    return {
      label: "In Review",
      className:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    };
  }

  return {
    label: "Completed",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  };
}

export default function ProjectStatusBadge({
  status,
  size = "default",
}: ProjectStatusBadgeProps) {
  const config = getStatusConfig(status);

  return (
    <Badge
      variant="outline"
      className={cn(
        "border-transparent",
        size === "sm" ? "px-2 py-0 text-[10px]" : "px-2.5 py-0.5 text-xs",
        config.className,
      )}
    >
      {config.label}
    </Badge>
  );
}
