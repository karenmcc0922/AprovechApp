import './App.css';
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import ProblemSection from "./components/ProblemSection";
import SolutionSection from "./components/SolutionSection";
import BenefitsSection from "./components/BenefitSection";
import CTASection from "./components/CTASection";
import Footer from "./components/FooterSection"; 

function App() {
  return (
    <div className="App font-sans antialiased text-gray-900 bg-white">
      {/* Navbar siempre arriba */}
      <Navbar />

      {/* Secciones */}
      <main>
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <BenefitsSection />
        <CTASection />
      </main>

      {/* Footer al final */}
      <Footer />
    </div>
  );
}

export default App;