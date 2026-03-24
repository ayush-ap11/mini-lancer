import Link from "next/link";

export default function PortalFooter() {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 text-center text-sm text-slate-400">
        <Link href="/" className="transition-colors hover:text-slate-500">
          Powered by Mini-lancer
        </Link>
      </div>
    </footer>
  );
}
