"use client";

import SidebarLinks from "@/components/layout/sidebar-links";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useSidebar } from "@/components/layout/sidebar-context";

export default function MobileSidebar() {
  const { open, setOpen } = useSidebar();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="left"
        className="w-72 p-0 bg-card border-r border-border"
      >
        <div className="flex h-16 items-center border-b border-border px-6">
          <span className="font-manrope text-xl font-black tracking-tighter text-foreground">
            Mini-lancer
          </span>
        </div>
        <div className="p-4">
          <SidebarLinks onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
