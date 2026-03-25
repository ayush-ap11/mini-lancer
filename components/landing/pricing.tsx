// components/landing/pricing.tsx
import Link from "next/link";
import { CircleCheck } from "lucide-react";

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 px-6 bg-surface-container-low">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h2 className="text-4xl font-bold mb-4">
          Scalable Pricing for Every Stage
        </h2>
        <p className="text-on-surface-variant">
          Start for free, upgrade as your studio grows.
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-surface-container-lowest p-10 rounded-xl border border-outline-variant/10 flex flex-col h-full">
          <div className="mb-8">
            <p className="text-on-surface-variant font-bold uppercase tracking-widest text-xs mb-2">
              Starter
            </p>
            <h3 className="text-4xl font-black mb-4">
              ₹0{" "}
              <span className="text-lg font-normal text-on-surface-variant">
                /mo
              </span>
            </h3>
            <p className="text-sm text-on-surface-variant">
              For freelancers just starting their professional journey.
            </p>
          </div>

          <ul className="space-y-4 mb-10 grow">
            <li className="flex items-center gap-3 text-sm">
              <CircleCheck size={18} className="text-primary-fixed" />
              Up to 3 active clients
            </li>
            <li className="flex items-center gap-3 text-sm">
              <CircleCheck size={18} className="text-primary-fixed" />
              Magic Link Portals
            </li>
            <li className="flex items-center gap-3 text-sm">
              <CircleCheck size={18} className="text-primary-fixed" />
              Basic Invoicing
            </li>
          </ul>
          <Link
            href="/sign-up"
            className="w-full inline-flex items-center justify-center py-4 border border-outline bg-transparent rounded-md font-bold hover:bg-surface-container-highest transition-all"
          >
            Get Started
          </Link>
        </div>

        <div className="bg-surface-container-lowest p-10 rounded-xl border-2 border-primary-fixed flex flex-col h-full relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-primary-fixed text-on-primary-fixed px-4 py-1 text-xs font-bold rounded-bl-lg">
            POPULAR
          </div>
          <div className="mb-8">
            <p className="text-primary-fixed font-bold uppercase tracking-widest text-xs mb-2">
              Pro
            </p>
            <h3 className="text-4xl font-black mb-4">
              ₹499{" "}
              <span className="text-lg font-normal text-on-surface-variant">
                /mo
              </span>
            </h3>
            <p className="text-sm text-on-surface-variant">
              For high-stakes studios requiring absolute precision.
            </p>
          </div>

          <ul className="space-y-4 mb-10 grow">
            <li className="flex items-center gap-3 text-sm">
              <CircleCheck size={18} className="text-primary-fixed" />
              Unlimited Clients
            </li>
            <li className="flex items-center gap-3 text-sm">
              <CircleCheck size={18} className="text-primary-fixed" />
              Priority 24/7 Support
            </li>
            <li className="flex items-center gap-3 text-sm">
              <CircleCheck size={18} className="text-primary-fixed" />
              White-label Branding
            </li>
            <li className="flex items-center gap-3 text-sm">
              <CircleCheck size={18} className="text-primary-fixed" />
              Advanced Reporting
            </li>
          </ul>
          <Link
            href="/sign-up"
            className="w-full inline-flex items-center justify-center py-4 bg-primary-fixed text-on-primary-fixed rounded-md font-bold hover:shadow-lg transition-all"
          >
            Go Pro
          </Link>
        </div>
      </div>
    </section>
  );
}
