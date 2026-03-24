import type { LucideIcon } from "lucide-react";

type PortalEmptyStateProps = {
  icon: LucideIcon;
  heading: string;
  subtext: string;
};

export default function PortalEmptyState({
  icon: Icon,
  heading,
  subtext,
}: PortalEmptyStateProps) {
  return (
    <section className="flex min-h-[45vh] flex-col items-center justify-center px-4 text-center">
      <Icon className="size-16 text-slate-300" />
      <h2 className="mt-4 text-xl font-medium text-slate-700">{heading}</h2>
      <p className="mt-2 max-w-md text-sm text-slate-400">{subtext}</p>
    </section>
  );
}
