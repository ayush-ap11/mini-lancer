import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#141409] text-[#e6e3d0]">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6">
        <Link
          href="/"
          className="mb-6 font-manrope text-3xl font-black tracking-tighter text-white"
        >
          Mini-lancer
        </Link>
        <div className="w-full">
          <Link
            href="/"
            className="mb-3 inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs font-medium text-on-surface-variant hover:text-white transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            Back
          </Link>
          <div className="flex justify-center">{children}</div>
        </div>
      </div>
    </main>
  );
}
