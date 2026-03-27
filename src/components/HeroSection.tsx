import { ArrowRight, Sparkles, ShoppingCart } from "lucide-react";

export default function HeroSection() {
  const scrollToSection = (id: string) => {
    const el = document.querySelector(id);
    if (el) {
      const offset = 80;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  return (
    <section 
      id="inicio" 
      className="relative pt-32 pb-24 md:pt-48 md:pb-40 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Fondo decorativo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-green-light rounded-full blur-[120px] opacity-60"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-brand-orange-light rounded-full blur-[100px] opacity-50"></div>
      </div>

      <div className="max-w-5xl mx-auto text-center relative z-10">
        {/* Badge superior */}
        <div className="animate-fade-up inline-flex items-center gap-2 px-4 py-2 bg-brand-orange-light text-brand-orange-dark text-sm font-bold rounded-full border border-brand-orange/20 mb-8">
          <Sparkles className="w-4 h-4" />
          <span>Únete a la revolución contra el desperdicio</span>
        </div>

        {/* Título de alto impacto */}
        <h1 className="animate-fade-up [animation-delay:200ms] text-5xl md:text-7xl font-black text-gray-900 tracking-tight mb-8 leading-[1.1]">
          Comida deliciosa, <br />
          <span className="bg-gradient-to-r from-green-700 to-teal-500 bg-clip-text text-transparent">
            a mitad de precio.
          </span>
        </h1>

        {/* Subtítulo persuasivo */}
        <p className="animate-fade-up [animation-delay:400ms] text-lg md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
          Rescata excedentes de tus restaurantes favoritos y ahorra hasta un 
          <span className="text-brand-green font-bold"> 70%</span> mientras cuidas el planeta. 🌱
        </p>

        {/* Botones de acción limpia */}
        <div className="animate-fade-up [animation-delay:600ms] flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            onClick={() => scrollToSection('#registro')}
            className="group w-full sm:w-auto px-10 py-5 bg-brand-orange text-white font-black text-lg rounded-2xl hover:bg-brand-orange-dark active:scale-95 transition-all shadow-xl shadow-brand-orange/30 flex items-center justify-center gap-3"
          >
            <ShoppingCart className="w-6 h-6" />
            Empezar a ahorrar
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button
            onClick={() => scrollToSection('#problema')}
            className="w-full sm:w-auto px-10 py-5 bg-white text-green-700 font-bold text-lg rounded-2xl border-2 border-brand-green/20 hover:bg-brand-green-light hover:border-brand-green/40 active:scale-95 transition-all"
          >
            ¿Cómo funciona?
          </button>
        </div>

        {/* Métrica rápida de confianza */}
        <div className="animate-fade-up [animation-delay:800ms] mt-16 flex items-center justify-center gap-8 grayscale opacity-60">
           <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Alianzas con los mejores comercios de Colombia</p>
        </div>
      </div>
    </section>
  );
}