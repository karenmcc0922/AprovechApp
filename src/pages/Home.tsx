import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import ProblemSection from "../components/ProblemSection";
import SolutionSection from "../components/SolutionSection";
import BenefitSection from "../components/BenefitSection";
import DifferentialsSection from "../components/DifferentialsSection";
import MarketSection from "../components/MarketSection";
import CTASection from "../components/CTASection";
import FooterSection from "../components/FooterSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <BenefitSection />
        <DifferentialsSection />
        <MarketSection />
        <CTASection />
      </main>
      <FooterSection />
    </div>
  );
}