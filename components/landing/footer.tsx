// components/landing/footer.tsx
import Link from "next/link";

export default function Footer() {
  const links = [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Security", href: "/security" },
    { label: "Status", href: "/status" },
    { label: "Contact Support", href: "mailto:support@mini-lancer.com" },
    { label: "Twitter", href: "https://twitter.com" },
    { label: "LinkedIn", href: "https://linkedin.com" },
  ] as const;

  return (
    <footer className="w-full border-t border-border bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-8 py-12 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col gap-4 text-center md:text-left">
          <div className="font-manrope text-lg font-bold text-foreground">
            Mini-lancer
          </div>
          <p className="font-inter text-xs text-muted-foreground">
            &copy; 2026 Mini-lancer SaaS. Editorial precision for the
            high-stakes freelancer.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={link.href.startsWith("http") ? "noreferrer" : undefined}
              className="font-inter text-xs text-muted-foreground hover:text-primary transition-all duration-300 hover:underline decoration-primary underline-offset-4"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
