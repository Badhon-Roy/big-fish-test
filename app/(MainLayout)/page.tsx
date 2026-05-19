import { HeroSection } from "@/components/home/HeroSection";
import { Categories } from "@/components/home/Categories";
import { HowItWorks } from "@/components/home/HowItWorks";
import { FeaturedTemplates } from "@/components/home/FeaturedTemplates";
import { LivePreview } from "@/components/home/LivePreview";
import { Testimonials } from "@/components/home/Testimonials";
import { TrustedBrands } from "@/components/home/TrustedBrands";
import { Pricing } from "@/components/home/Pricing";
import { FAQ } from "@/components/home/FAQ";

export default function Home() {
  return (
    <main className="min-h-screen bg-white overflow-x-hidden font-sans selection:bg-red-500/30 selection:text-red-900">
      <HeroSection />
      <TrustedBrands />
      <FeaturedTemplates />
      <Categories />
      <HowItWorks />
      <LivePreview />
      <Testimonials />
      <Pricing />
      <FAQ />
    </main>
  );
}
