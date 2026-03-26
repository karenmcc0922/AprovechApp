import './App.css';
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import DifferentialsSection from "./components/DifferentialsSection"; // La sección de Manus
import ProblemSection from "./components/ProblemSection";
import CTASection from "./components/CTASection"; // La sección con los regalos
import Footer from "./components/FooterSection";

function App() {
  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      {/* 1. Navegación siempre arriba */}
      <Navbar />

      <main>
        {/* 2. Impacto inicial */}
        <HeroSection />

        {/* 3. El problema que resolvemos (Contexto) */}
        <ProblemSection />

        {/* 4. Por qué somos diferentes (Lo que me pasaste de Manus) */}
        <DifferentialsSection />

        {/* 5. Gancho final y Registro (Con el descuento y envíos gratis) */}
        <CTASection />
      </main>

      {/* 6. Pie de página */}
      <Footer />
    </div>
  );
}

export default App;