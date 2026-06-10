import Footer from "@/components/common/footer";
import HeroSection from "@/components/home/heroSection";
import HowItWorkSection from "@/components/home/howItWork";
import { PricingSection } from "@/components/home/priceSection";
export default async function Home() {
  return (
    <div className="flex flex-col w-full items-center justify-center">
      <HeroSection />
      <HowItWorkSection />
      <PricingSection />
      <Footer />
    </div>
  );
}
