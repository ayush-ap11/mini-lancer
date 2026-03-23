// components/landing/cta.tsx
import Link from "next/link";

export default function CTA() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto bg-linear-to-br from-surface-container-high to-surface-container rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-8 tracking-tighter">
            Ready to scale your freelance business?
          </h2>
          <p className="text-on-surface-variant text-lg mb-12 max-w-xl mx-auto">
            Join thousands of high-stakes freelancers who manage their entire
            empire with editorial precision.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center px-10 py-5 bg-primary-fixed text-on-primary-fixed font-black rounded-md text-xl hover:scale-95 transition-all"
          >
            Get Started Now
          </Link>
        </div>

        <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay">
          <svg height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
            <filter id="noise">
              <feTurbulence
                baseFrequency="0.65"
                numOctaves="3"
                stitchTiles="stitch"
                type="fractalNoise"
              ></feTurbulence>
            </filter>
            <rect filter="url(#noise)" height="100%" width="100%"></rect>
          </svg>
        </div>
      </div>
    </section>
  );
}
