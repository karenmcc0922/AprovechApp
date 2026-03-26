import './App.css';
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import ProblemSection from "./components/ProblemSection";
import SolutionSection from "./components/SolutionSection";
import BenefitSection from "./components/BenefitSection";
import DifferentialsSection from "./components/DifferentialsSection";
import MarketSection from "./components/MarketSection"; // <-- El nuevo integrante
import CTASection from "./components/CTASection";
import FooterSection from "./components/FooterSection"; 

function App() {
  return (
    <div className="min-h-screen bg-white font-sans antialiased text-gray-900">
      {/* 1. Barra de navegación fija */}
      <Navbar />

      <main>
        {/* 2. Impacto visual y propuesta de valor */}
        <HeroSection />

        {/* 3. Empatía con el problema del desperdicio */}
        <ProblemSection />

        {/* 4. Presentación de la App como solución */}
        <SolutionSection />

        {/* 5. Ventajas para el usuario final */}
        <BenefitSection />

        {/* 6. Lo que nos hace únicos frente a otros */}
        <DifferentialsSection />

        {/* 7. Datos de mercado: Por qué es el momento de LATAM */}
        <MarketSection />

        {/* 8. Cierre con registro y beneficios (Regalo/Envío gratis) */}
        <CTASection />
      </main>

      {/* 9. Información final */}
      <FooterSection />
    </div>
  );
}

export default App;