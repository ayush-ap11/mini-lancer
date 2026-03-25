"use client";

import {
  CreditCard,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Link2,
  type LucideIcon,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Clients", href: "/clients", icon: Users },
  { title: "Portal Links", href: "/clients/portal", icon: Link2 },
  { title: "Projects", href: "/projects", icon: FolderKanban },
  { title: "Invoices", href: "/invoices", icon: FileText },
  { title: "Billing", href: "/billing", icon: CreditCard },
];

export default function SidebarLinks({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group flex cursor-pointer items-center gap-3 rounded-full px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "border border-primary-fixed bg-primary-fixed text-on-primary-fixed"
                : "text-muted-foreground hover:bg-primary-fixed/20 hover:text-primary-fixed",
            )}
          >
            <Icon
              className={cn(
                "size-4 transition-colors",
                isActive
                  ? "text-on-primary-fixed"
                  : "text-muted-foreground group-hover:text-primary-fixed",
              )}
            />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
