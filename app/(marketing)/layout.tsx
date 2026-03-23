// app/(marketing)/layout.tsx
import type { ReactNode } from "react";

export const metadata = {
  title: "Mini-lancer | The Freelance Operating System",
  description: "Mini-lancer marketing landing page",
};

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <main className="dark antialiased bg-[#141409] text-on-background">
      {children}
    </main>
  );
}
