import HeroSection from "./components/HeroSection";
import ProblemSection from "./components/ProblemSection";
import SolutionSection from "./components/SolutionSection";
import BenefitsSection from "./components/BenefitSection";
import CTASection from "./components/CTASection";
import Navbar from "./components/Navbar";

function App() {
  return (
    <div>
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <BenefitsSection />
      <CTASection />
      <Navbar/>
    </div>
  );
}

export default App;