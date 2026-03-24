import { Link2Off } from "lucide-react";
import PortalFooter from "@/components/portal/portal-footer";
import PortalHeader from "@/components/portal/portal-header";

export default function InvalidPortalPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <PortalHeader />
      <main className="flex flex-1 items-center justify-center px-4">
        <section className="max-w-xl text-center">
          <Link2Off className="mx-auto size-20 text-slate-300" />
          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-700">
            This link has expired or is invalid
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            Magic links are valid for 7 days. Please contact your freelancer to
            request a new link.
          </p>
        </section>
      </main>
      <PortalFooter />
    </div>
  );
}
