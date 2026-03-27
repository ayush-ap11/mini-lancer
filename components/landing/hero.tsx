// components/landing/hero.tsx
"use client";

import { PlayCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const DEMO_VIDEO_URL =
  "https://ik.imagekit.io/cy2oyywbb/2026-03-26%2009-56-30%20(1).mp4";

export default function Hero() {
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  useEffect(() => {
    if (!isDemoOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDemoOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isDemoOpen]);

  return (
    <>
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
            Manage clients, projects, and invoices in one seamless workflow.
            Give your clients a professional portal they'll love.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-primary-fixed text-on-primary-fixed font-bold rounded-md text-lg hover:shadow-xl transition-all"
            >
              Start for Free
            </Link>
            <button
              type="button"
              onClick={() => setIsDemoOpen(true)}
              className="w-full sm:w-auto px-8 py-4 bg-surface-container-high text-on-surface font-bold rounded-md text-lg flex items-center justify-center gap-2 hover:bg-surface-container-highest transition-all"
            >
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

      {isDemoOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-md"
          onClick={() => setIsDemoOpen(false)}
          aria-hidden="true"
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-xl border border-white/20 bg-black shadow-2xl"
            onClick={(event) => event.stopPropagation()}
            aria-modal="true"
            role="dialog"
          >
            <button
              type="button"
              onClick={() => setIsDemoOpen(false)}
              className="absolute right-3 top-3 z-10 rounded-full bg-black/70 px-3 py-1 text-sm font-semibold text-white hover:bg-black"
            >
              Close
            </button>
            <video
              className="aspect-video w-full"
              src={DEMO_VIDEO_URL}
              controls
              autoPlay
              playsInline
            >
              <track kind="captions" />
            </video>
          </div>
        </div>
      ) : null}
    </>
  );
}
