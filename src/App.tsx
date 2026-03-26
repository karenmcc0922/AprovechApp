import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import ProblemSection from "./components/ProblemSection";
import SolutionSection from "./components/SolutionSection";
import BenefitsSection from "./components/BenefitSection";
import CTASection from "./components/CTASection";

function App() {
  return (
    <div>
      {/* Navbar siempre arriba */}
      <Navbar />

      {/* Secciones principales */}
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <BenefitsSection />
      <CTASection />

      {/* Footer (si tienes uno) */}
      {/* <Footer /> */}
    </div>
  );
}

export default App;