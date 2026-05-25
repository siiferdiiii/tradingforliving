import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import ProblemSection from "@/components/landing/ProblemSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import StatsSection from "@/components/landing/StatsSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import RevealWrapper from "@/components/landing/RevealWrapper";

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <HeroSection />

      <RevealWrapper>
        <ProblemSection />
      </RevealWrapper>

      <RevealWrapper>
        <FeaturesSection />
      </RevealWrapper>

      <RevealWrapper>
        <HowItWorksSection />
      </RevealWrapper>

      <RevealWrapper>
        <StatsSection />
      </RevealWrapper>

      <RevealWrapper>
        <CTASection />
      </RevealWrapper>

      <Footer />
    </main>
  );
}
