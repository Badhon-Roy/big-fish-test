import Banner from "@/components/home/banner/Banner";
import CTA from "@/components/home/cta/CTA";
import HowItWorks from "@/components/home/how-it-works/HowItWorks";
import Products from "@/components/home/products/Products";
import Services from "@/components/home/services/Services";
import CustomProducts from "@/components/home/custom-products/CustomProducts";
import DesignGallery from "@/components/home/design-gallery/DesignGallery";
import CatchyPrinting from "@/components/home/catchy-printing/CatchyPrinting";
import RecentWorks from "@/components/home/recent-works/RecentWorks";

export default function Home() {
  return (
    <main className="w-full min-h-screen">
      <Banner />
      <Services />
      <Products />
      <CustomProducts />
      <CatchyPrinting />
      <HowItWorks />
      <RecentWorks />
      <DesignGallery isHomePage={true} />
      <CTA />
    </main>
  );
}
