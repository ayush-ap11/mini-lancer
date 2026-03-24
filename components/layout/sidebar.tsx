"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import SidebarLinks from "@/components/layout/sidebar-links";

export default function Sidebar() {
  const { user } = useUser();
  const plan = "FREE";

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-border bg-card md:flex md:flex-col">
      <div className="flex h-16 items-center border-b border-border px-6">
        <span className="font-manrope text-2xl font-black tracking-tighter text-foreground">
          Mini-lancer
        </span>
      </div>

      <div className="flex-1 px-4 py-5">
        <SidebarLinks />
      </div>

      <div className="border-t border-border p-4">
        <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2">
          <span className="text-xs font-semibold text-muted-foreground">
            Plan
          </span>
          <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold text-muted-foreground">
            {plan}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <UserButton />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {user?.fullName ?? user?.firstName ?? "User"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
