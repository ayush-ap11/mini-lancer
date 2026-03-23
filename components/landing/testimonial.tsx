// components/landing/testimonial.tsx
import Image from "next/image";
import { Quote } from "lucide-react";

export default function Testimonial() {
  return (
    <section id="testimonials" className="py-32 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <Quote size={64} className="text-primary-fixed/30 mx-auto mb-8" />
        <p className="text-2xl md:text-4xl font-headline font-bold mb-12 italic leading-tight">
          "Mini-lancer turned my chaotic spreadsheet business into a streamlined
          studio. My clients are impressed, and I'm finally getting paid on
          time."
        </p>

        <div className="flex items-center justify-center gap-4">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2MWJ_U58VHSKT-McumXy-j1YKYxG7xEkP--3cqydUtOqJMOSsgRTtTbCn6lDMnL_pxw5W3k7Fvn8nQGrdDpBpR1QFEfgQitn53WD3NV9aeZacHkWtttOvp9C3ACg7T6gTJQhUQafR9g_FKmN8YYbFkiceXRp-ikTAYDN7eiaBA605ax4kOtvCFcYiss3Lhnwz-4kFhL6cgmZvUkOKh61TmKd6ov0RezpUZ0pTSo7VcaL7SZHr1CI5uG-G1YKapc0WYSNvDdmBHfsB"
            alt="Portrait of a professional creative freelancer"
            width={64}
            height={64}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div className="text-left">
            <p className="font-bold">Alex Rivera</p>
            <p className="text-sm text-on-surface-variant">
              Brand Strategist &amp; Creative Director
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
