import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type InvoiceStatusBadgeProps = {
  status: "DRAFT" | "PENDING" | "PAID" | "OVERDUE";
  size?: "sm" | "default" | "lg";
};

function getStatusConfig(status: InvoiceStatusBadgeProps["status"]) {
  if (status === "DRAFT") {
    return {
      label: "Draft",
      className:
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    };
  }

  if (status === "PENDING") {
    return {
      label: "Pending",
      className:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    };
  }

  if (status === "PAID") {
    return {
      label: "Paid",
      className:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    };
  }

  return {
    label: "Overdue",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };
}

export default function InvoiceStatusBadge({
  status,
  size = "default",
}: InvoiceStatusBadgeProps) {
  const config = getStatusConfig(status);

  return (
    <Badge
      variant="outline"
      className={cn(
        "border-transparent",
        size === "sm" && "px-2 py-0 text-[10px]",
        size === "default" && "px-2.5 py-0.5 text-xs",
        size === "lg" && "px-3 py-1 text-sm",
        config.className,
      )}
    >
      {config.label}
    </Badge>
  );
}
