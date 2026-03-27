// components/landing/client-experience.tsx
import Image from "next/image";
import { BadgeCheck, Bolt, Check } from "lucide-react";

export default function ClientExperience() {
  return (
    <section id="how-it-works" className="py-32 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="order-2 lg:order-1 relative">
          <div className="relative z-10 bg-surface-container-lowest rounded-xl shadow-2xl overflow-hidden border border-outline-variant/10">
            <div className="bg-surface-container-high px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-container-highest text-foreground flex items-center justify-center font-bold text-xs">
                  JD
                </div>
                <div>
                  <p className="text-xs font-bold">John's Design Studio</p>
                  <p className="text-[10px] text-on-surface-variant">
                    Client Portal: Acme Corp
                  </p>
                </div>
              </div>
              <BadgeCheck size={20} className="text-secondary" />
            </div>

            <div className="p-8">
              <Image
                src="https://res.cloudinary.com/dc4yjx0dc/image/upload/v1774424357/Screenshot_2026-03-25_121526_ptxbtu.png"
                alt="Screenshot of a clean client portal dashboard with project progress and invoices"
                width={1200}
                height={700}
                className="w-full rounded-lg mb-8 shadow-sm"
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-surface-container-low rounded-lg">
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant mb-1">
                    Total Paid
                  </p>
                  <p className="text-xl font-bold">₹12,400</p>
                </div>
                <div className="p-4 bg-surface-container-low rounded-lg">
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant mb-1">
                    Active Projects
                  </p>
                  <p className="text-xl font-bold">2</p>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-6 -right-6 z-20 bg-secondary text-on-secondary px-6 py-4 rounded-xl shadow-xl hidden md:block">
            <div className="flex items-center gap-3">
              <Bolt size={20} />
              <div>
                <p className="text-xs font-bold">Paid via Magic Link</p>
                <p className="text-[10px] opacity-80">2 minutes ago</p>
              </div>
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-8 leading-tight">
            The Client <br />
            <span className="text-secondary">Experience</span> Redefined.
          </h2>
          <p className="text-on-surface-variant text-lg mb-10 leading-relaxed">
            Stop making your clients jump through hoops. With Mini-lancer, you
            provide a frictionless "Magic Link" portal.
          </p>

          <ul className="space-y-6">
            <li className="flex gap-4">
              <div className="w-6 h-6 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                <Check size={12} className="text-on-secondary-container" />
              </div>
              <div>
                <p className="font-bold">No Signups Required</p>
                <p className="text-sm text-on-surface-variant">
                  Clients access their dashboard via a secure, unique link in
                  their email.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="w-6 h-6 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                <Check size={12} className="text-on-secondary-container" />
              </div>
              <div>
                <p className="font-bold">One-Click Payments</p>
                <p className="text-sm text-on-surface-variant">
                  Direct integration with Stripe for instant, effortless
                  settlements.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="w-6 h-6 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                <Check size={12} className="text-on-secondary-container" />
              </div>
              <div>
                <p className="font-bold">Live Status Tracking</p>
                <p className="text-sm text-on-surface-variant">
                  Real-time transparency on deliverables, reducing "Where's my
                  project?" emails.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
