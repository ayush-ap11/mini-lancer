"use client";

import { UserButton } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import ThemeSwitcher from "@/components/layout/theme-switcher";
import MobileSidebar from "@/components/layout/mobile-sidebar";
import { Button } from "@/components/ui/Button";
import { useSidebar } from "@/components/layout/sidebar-context";

function getTitle(pathname: string) {
  if (pathname.startsWith("/dashboard/clients")) return "Clients";
  if (pathname.startsWith("/dashboard/projects")) return "Projects";
  if (pathname.startsWith("/dashboard/invoices")) return "Invoices";
  if (pathname.startsWith("/dashboard/billing")) return "Billing";
  return "Dashboard";
}

export default function Navbar() {
  const pathname = usePathname();
  const { setOpen } = useSidebar();

  return (
    <>
      <header className="sticky top-0 z-30 h-16 border-b border-border bg-white dark:bg-slate-900 dark:border-slate-800">
        <div className="flex h-full items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </Button>
            <p className="hidden md:block text-sm font-semibold text-foreground">
              {getTitle(pathname)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </div>
      </header>
      <MobileSidebar />
    </>
  );
}
