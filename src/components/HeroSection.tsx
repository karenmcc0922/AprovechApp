import { ArrowRight, Sparkles } from "lucide-react";

export default function HeroSection() {
  return (
    <section 
      id="inicio" 
      className="relative pt-32 pb-24 md:pt-44 md:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Elementos decorativos de fondo (Verde y Naranja muy suaves) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-green-light rounded-full blur-[120px] opacity-60"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-brand-orange-light rounded-full blur-[100px] opacity-50"></div>
      </div>

      <div className="max-w-5xl mx-auto text-center relative z-10">
        {/* Badge de Novedad con Naranja */}
        <div className="animate-fade-up inline-flex items-center gap-2 px-4 py-2 bg-brand-orange-light text-brand-orange-dark text-sm font-bold rounded-full border border-brand-orange/20 mb-8">
          <Sparkles className="w-4 h-4" />
          <span>¡Nuevo en Colombia! Ahorra y ayuda</span>
        </div>

        {/* Título Principal con Degradado Verde */}
        <h1 className="animate-fade-up [animation-delay:200ms] text-5xl md:text-7xl font-black text-gray-900 tracking-tight mb-8 leading-[1.1]">
          Menos desperdicio, <br />
          <span className="bg-gradient-to-r from-brand-green to-teal-500 bg-clip-text text-transparent">
            más ahorro real
          </span>
        </h1>

        {/* Subtítulo */}
        <p className="animate-fade-up [animation-delay:400ms] text-lg md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
          Conectamos restaurantes con excedentes de comida y personas que quieren ahorrar hasta un 
          <span className="text-brand-green font-bold"> 70%</span> en sus pedidos. 🌱
        </p>

        {/* Formulario de Registro (El Botón ahora es NARANJA) */}
        <div className="animate-fade-up [animation-delay:600ms] flex flex-col sm:flex-row justify-center items-center gap-3 max-w-lg mx-auto bg-white p-2 rounded-2xl shadow-xl shadow-brand-green/5 border border-gray-100">
          <input
            type="email"
            placeholder="Tu mejor correo..."
            className="w-full px-5 py-4 rounded-xl border-none focus:ring-0 outline-none text-gray-900 font-medium"
          />
          <button
            className="w-full sm:w-auto px-8 py-4 bg-brand-orange text-white font-black rounded-xl hover:bg-brand-orange-dark active:scale-95 transition-all shadow-lg shadow-brand-orange/20 flex items-center justify-center gap-2 group"
          >
            Quiero ofertas
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Flecha de scroll más elegante */}
        <div className="mt-20 animate-bounce hidden md:block">
          <div className="w-6 h-10 border-2 border-brand-green/30 rounded-full mx-auto flex justify-center pt-2">
            <div className="w-1.5 h-1.5 bg-brand-green rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
}