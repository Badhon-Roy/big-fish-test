import Banner from "@/components/home/banner/Banner";
import CTA from "@/components/home/cta/CTA";
import HowItWorks from "@/components/home/how-it-works/HowItWorks";
import Products from "@/components/home/products/Products";
import Services from "@/components/home/services/Services";

export default function Home() {
  return (
    <main className="w-full min-h-screen">
      <Banner />
      <Services />
      <Products />
      <HowItWorks />
      <CTA />
    </main>
  );
}
