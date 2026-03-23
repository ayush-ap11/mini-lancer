// components/landing/features.tsx
import Image from "next/image";
import { Users, WandSparkles, ReceiptText, Timer, Lock } from "lucide-react";

export default function Features() {
  return (
    <section id="features" className="py-24 px-6 bg-surface-container-low">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Precision Tools for High-Stakes Freelancing
          </h2>
          <p className="text-on-surface-variant max-w-xl">
            Everything you need to run a professional studio without the
            overhead of complex enterprise software.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10 shadow-sm flex flex-col justify-between group">
            <div>
              <Users size={36} className="text-primary-fixed mb-6" />
              <h3 className="text-2xl font-bold mb-3">
                Client Management (CRM)
              </h3>
              <p className="text-on-surface-variant max-w-md">
                Maintain a single source of truth for every contact. Track
                history, documents, and communications in one thread.
              </p>
            </div>
            <div className="mt-12 overflow-hidden rounded-lg">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXATeMv3gwk93yuhvxZ4y98axYxhSq1s07e6YUFhEDXppSdRm2hfgDCtuetIl-9-WoCoxDnAt9FtGktcznLNEeoPxP81U9qCYiIQZPXXH4HX4Oryxj5UlwxXqMMwQMD7id3xpPped1nJVqI49ekHhuIOlY4xxpcgY1LWYGqqEtDVc7RMLoHY-CFc0WXdcjZNM3xcDvKIyXwjT7gRiM6UzCvu3S_P5wjsNlu9F8vayeur3bKrkoTJ574yzpdDnGTcTpBnCBjz94Y4DX"
                alt="Clean dashboard interface showing client contact list"
                width={1200}
                height={360}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          <div className="md:col-span-4 bg-surface-container p-8 rounded-xl border border-outline-variant/10 flex flex-col">
            <Timer size={36} className="text-secondary mb-6" />
            <h3 className="text-2xl font-bold mb-3">
              Visual Project Timelines
            </h3>
            <p className="text-on-surface-variant mb-8">
              Never miss a milestone. High-level Gantt views that your clients
              actually understand.
            </p>
            <div className="mt-auto space-y-3">
              <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-primary-fixed w-[70%]" />
              </div>
              <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-secondary w-[40%]" />
              </div>
            </div>
          </div>

          <div className="md:col-span-4 bg-surface-container p-8 rounded-xl border border-outline-variant/10">
            <ReceiptText size={36} className="text-tertiary-fixed-dim mb-6" />
            <h3 className="text-2xl font-bold mb-3">Automated Invoicing</h3>
            <p className="text-on-surface-variant">
              Set it and forget it. Recurring billing and automatic late payment
              reminders that keep cash flow healthy.
            </p>
          </div>

          <div className="md:col-span-8 bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10 flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <WandSparkles size={36} className="text-primary-fixed mb-6" />
              <h3 className="text-2xl font-bold mb-3">
                Magic Link Client Portals
              </h3>
              <p className="text-on-surface-variant">
                The ultimate client experience. No passwords, no logins—just one
                secure link to everything they need.
              </p>
            </div>
            <div className="w-full md:w-1/3 bg-surface-container-low p-4 rounded-lg border border-outline-variant/5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary-fixed/20 flex items-center justify-center">
                  <Lock size={12} className="text-primary-fixed" />
                </div>
                <div className="h-2 w-24 bg-surface-container-high rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="h-2 w-full bg-surface-container-high rounded-full" />
                <div className="h-2 w-3/4 bg-surface-container-high rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
