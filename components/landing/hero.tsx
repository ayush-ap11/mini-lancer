// components/landing/hero.tsx
import { PlayCircle, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative px-6 pt-24 pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-semibold mb-8">
          <Sparkles size={14} className="text-sm" />
          The Next-Gen Freelance OS
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
          The Freelance <br />
          <span className="text-primary-fixed">Operating System.</span>
        </h1>

        <p className="max-w-2xl mx-auto text-on-surface-variant text-lg md:text-xl mb-12 leading-relaxed">
          Manage clients, projects, and invoices in one seamless workflow. Give
          your clients a professional portal they'll love.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/sign-up"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-primary-fixed text-on-primary-fixed font-bold rounded-md text-lg hover:shadow-xl transition-all"
          >
            Start for Free
          </Link>
          <button className="w-full sm:w-auto px-8 py-4 bg-surface-container-high text-on-surface font-bold rounded-md text-lg flex items-center justify-center gap-2 hover:bg-surface-container-highest transition-all">
            <PlayCircle size={18} />
            Watch Demo
          </button>
        </div>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full z-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 right-0 w-125 h-125 bg-primary-fixed/30 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-125 h-125 bg-secondary-fixed/20 blur-[120px] rounded-full" />
      </div>
    </section>
  );
}
