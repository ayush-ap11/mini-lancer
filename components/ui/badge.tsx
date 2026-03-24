import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      variant: {
        outline: "border-border bg-transparent text-foreground",
        secondary: "border-border bg-muted text-muted-foreground",
        warning:
          "border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-300",
        success:
          "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
        destructive:
          "border-red-500/40 bg-red-500/15 text-red-700 dark:text-red-300",
      },
    },
    defaultVariants: {
      variant: "secondary",
    },
  },
);

type BadgeProps = React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
