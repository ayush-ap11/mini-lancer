// components/landing/navbar.tsx
"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl shadow-sm dark:shadow-none">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-6 h-20">
        <div className="font-manrope text-2xl font-black tracking-tighter text-slate-900 dark:text-white">
          <Link href="/">Mini-lancer</Link>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <Link
            className="font-manrope text-sm font-semibold tracking-tight text-yellow-600 dark:text-yellow-400 border-b-2 border-yellow-500 pb-1"
            href="/#features"
          >
            Features
          </Link>
          <Link
            className="font-manrope text-sm font-semibold tracking-tight text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            href="/#how-it-works"
          >
            How it Works
          </Link>
          <Link
            className="font-manrope text-sm font-semibold tracking-tight text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            href="/#pricing"
          >
            Pricing
          </Link>
          <Link
            className="font-manrope text-sm font-semibold tracking-tight text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            href="/#testimonials"
          >
            Testimonials
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/sign-in"
            className="font-manrope text-sm font-semibold tracking-tight text-slate-600 dark:text-slate-400 hover:text-slate-900 px-4 py-2 transition-all"
          >
            Login
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center rounded-md font-semibold bg-primary-fixed text-on-primary-fixed px-6 py-2.5 hover:scale-95 duration-150 ease-in-out transition-all"
          >
            Get Started
          </Link>
          <button
            className="md:hidden p-2 rounded-md"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-surface p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col gap-3">
            <Link href="/#features" onClick={() => setOpen(false)}>
              Features
            </Link>
            <Link href="/#how-it-works" onClick={() => setOpen(false)}>
              How it Works
            </Link>
            <Link href="/#pricing" onClick={() => setOpen(false)}>
              Pricing
            </Link>
            <Link href="/#testimonials" onClick={() => setOpen(false)}>
              Testimonials
            </Link>
            <Link href="/sign-in" onClick={() => setOpen(false)}>
              Login
            </Link>
            <Link href="/sign-up" onClick={() => setOpen(false)}>
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
