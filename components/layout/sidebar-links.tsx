"use client";

import {
  CreditCard,
  FileText,
  FolderKanban,
  LayoutDashboard,
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
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-full px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary-fixed/25 text-on-primary-fixed border border-primary-fixed/50"
                : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
            )}
          >
            <Icon
              className={cn(
                "size-4",
                isActive ? "text-on-primary-fixed" : "text-muted-foreground",
              )}
            />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
