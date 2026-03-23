// components/landing/footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-8 py-12 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col gap-4 text-center md:text-left">
          <div className="font-manrope text-lg font-bold text-slate-900 dark:text-white">
            Mini-lancer
          </div>
          <p className="font-inter text-xs text-slate-500 dark:text-slate-400">
            © 2024 Mini-lancer SaaS. Editorial precision for the high-stakes
            freelancer.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {[
            "Privacy Policy",
            "Terms of Service",
            "Security",
            "Status",
            "Contact Support",
            "Twitter",
            "LinkedIn",
          ].map((t) => (
            <Link
              key={t}
              href="#"
              className="font-inter text-xs text-slate-500 hover:text-yellow-500 dark:hover:text-yellow-400 transition-all duration-300 hover:underline decoration-yellow-500 underline-offset-4"
            >
              {t}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
