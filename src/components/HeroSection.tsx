export default function HeroSection() {
  return (
    <section 
      id="inicio" 
      className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto"
    >
      <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
        Menos desperdicio, <span className="text-emerald-600">más ahorro</span>
      </h1>

      <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
        AprovechApp conecta restaurantes con excedentes de comida con personas que quieren ahorrar hasta un <span className="font-semibold text-gray-900">70%</span>.
      </p>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-3 max-w-md mx-auto relative z-10">
        <input
          type="email"
          placeholder="Ingresa tu correo"
          className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all shadow-sm"
        />
        <button
          className="w-full sm:w-auto px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 active:scale-95 transition-all shadow-sm shadow-emerald-200"
        >
          Quiero ofertas
        </button>
      </div>

      {/* Flecha de scroll con animación */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <svg
          className="w-6 h-6 text-emerald-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
}