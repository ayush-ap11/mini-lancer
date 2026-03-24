import type { ReactNode } from "react";
import PortalFooter from "@/components/portal/portal-footer";
import PortalHeader from "@/components/portal/portal-header";

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <PortalHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl px-4 py-6">{children}</div>
      </main>
      <PortalFooter />
    </div>
  );
}
