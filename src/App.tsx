{/*import Navbar from "./components/Navbar";*/}
import HeroSection from "./components/HeroSection";
import ProblemSection from "./components/ProblemSection";
import SolutionSection from "./components/SolutionSection";
import BenefitsSection from "./components/BenefitSection";
import CTASection from "./components/CTASection";

function App() {
  return (
    <div className="App">
      {/* Navbar siempre arriba */}
      {/*<Navbar />*/}

      {/* Secciones */}
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <BenefitsSection />
      <CTASection />
    </div>
  );
}

export default App;