// app/(marketing)/page.tsx
import Navbar from "../../components/landing/navbar";
import Hero from "../../components/landing/hero";
import Features from "../../components/landing/features";
import ClientExperience from "../../components/landing/client-experience";
import Pricing from "../../components/landing/pricing";
import Testimonial from "../../components/landing/testimonial";
import CTA from "../../components/landing/cta";
import Footer from "../../components/landing/footer";

export default function Page() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <Hero />
        <Features />
        <ClientExperience />
        <Pricing />
        <Testimonial />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
