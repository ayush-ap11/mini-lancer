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
        className="w-72 p-0 bg-white dark:bg-slate-900 border-r border-border dark:border-slate-800"
      >
        <div className="flex h-16 items-center border-b border-border px-6 dark:border-slate-800">
          <span className="font-manrope text-xl font-black tracking-tighter text-slate-900 dark:text-white">
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
