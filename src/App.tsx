import './App.css';
// Importamos todos tus componentes de la imagen
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import ProblemSection from "./components/ProblemSection";
import SolutionSection from "./components/SolutionSection";
import BenefitSection from "./components/BenefitSection";
import DifferentialsSection from "./components/DifferentialsSection";
import CTASection from "./components/CTASection";
import FooterSection from "./components/FooterSection"; 

function App() {
  return (
    <div className="min-h-screen bg-white font-sans antialiased text-gray-900">
      {/* 1. La barra de navegación (Fija arriba) */}
      <Navbar />

      <main>
        {/* 2. El gancho inicial */}
        <HeroSection />

        {/* 3. Por qué existimos (El dolor del desperdicio) */}
        <ProblemSection />

        {/* 4. Nuestra propuesta (Cómo lo arreglamos) */}
        <SolutionSection />

        {/* 5. ¿Qué gana el usuario? (Ahorro, planeta, etc.) */}
        <BenefitSection />

        {/* 6. Por qué somos mejores que otros (Lo de Manus) */}
        <DifferentialsSection />

        {/* 7. El empujón final (Registro + Regalos) */}
        <CTASection />
      </main>

      {/* 8. Información de contacto y links */}
      <FooterSection />
    </div>
  );
}

export default App;