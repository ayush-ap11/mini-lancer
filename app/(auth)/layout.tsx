import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6">
        <Link
          href="/"
          className="mb-6 font-manrope text-3xl font-black tracking-tighter text-foreground"
        >
          Mini-lancer
        </Link>
        <div className="w-full">
          <Link
            href="/"
            className="mb-3 inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs font-medium text-on-surface-variant hover:text-foreground transition-colors"
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
