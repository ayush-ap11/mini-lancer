"use client";

import { UserButton } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import MobileSidebar from "@/components/layout/mobile-sidebar";
import { useSidebar } from "@/components/layout/sidebar-context";
import ThemeSwitcher from "@/components/layout/theme-switcher";
import { Button } from "@/components/ui/Button";

function getTitle(pathname: string) {
  if (pathname.startsWith("/clients/portal")) return "Client Portal";
  if (pathname.startsWith("/clients")) return "Clients";
  if (pathname.startsWith("/projects")) return "Projects";
  if (pathname.startsWith("/invoices")) return "Invoices";
  if (pathname.startsWith("/billing")) return "Billing";
  return "Dashboard";
}

export default function Navbar() {
  const pathname = usePathname();
  const { setOpen } = useSidebar();

  return (
    <>
      <header className="sticky top-0 z-30 h-16 border-b border-border bg-background">
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
            <UserButton />
          </div>
        </div>
      </header>
      <MobileSidebar />
    </>
  );
}
