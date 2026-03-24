import { BriefcaseBusiness } from "lucide-react";
import Link from "next/link";

export default function PortalHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 w-full max-w-3xl items-center px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-base font-bold tracking-tight text-slate-900"
        >
          <BriefcaseBusiness className="size-4" />
          <span>Mini-lancer</span>
        </Link>
      </div>
    </header>
  );
}
