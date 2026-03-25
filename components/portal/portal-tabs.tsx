import Link from "next/link";
import { cn } from "@/lib/utils";

type PortalTabsProps = {
  token: string;
  activeTab: "projects" | "invoices";
};

export default function PortalTabs({ token, activeTab }: PortalTabsProps) {
  return (
    <div className="rounded-full bg-slate-100 p-1">
      <div className="grid grid-cols-2 gap-1">
        <Link
          href={`/portal/${token}/projects`}
          className={cn(
            "rounded-full px-4 py-2 text-center text-sm font-medium transition-colors",
            activeTab === "projects"
              ? "bg-orange-600 text-white"
              : "text-slate-500 hover:text-slate-700",
          )}
        >
          My Projects
        </Link>

        <Link
          href={`/portal/${token}/invoices`}
          className={cn(
            "rounded-full px-4 py-2 text-center text-sm font-medium transition-colors",
            activeTab === "invoices"
              ? "bg-orange-600 text-white"
              : "text-slate-500 hover:text-slate-700",
          )}
        >
          My Invoices
        </Link>
      </div>
    </div>
  );
}
