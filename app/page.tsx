import Footer from "@/components/common/footer";
import HeroSection from "@/components/home/heroSection";
import HowItWorkSection from "@/components/home/howItWork";
import { PricingSection } from "@/components/home/priceSection";
// import { syncUser } from "@/lib/sync-user";

export default async function Home() {
//   const user = await syncUser();
// if (user instanceof Error) {
//     console.error("User sync error:", user);
//   }
  return (
    <div className="flex flex-col w-full items-center justify-center">
      <HeroSection />
      <HowItWorkSection />
      <PricingSection />
      <Footer />
    </div>
  );
}
