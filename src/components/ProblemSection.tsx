import { useState, useEffect, useRef } from "react";

export default function ProblemSection() {
  const [counts, setCounts] = useState({ desperdiciadas: 0, perdidos: 0, perdidas: 0 });
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Iniciar animación de contadores
          const desperdiciadasInterval = setInterval(() => {
            setCounts((prev) => ({
              ...prev,
              desperdiciadas: Math.min(prev.desperdiciadas + 0.1, 9.7),
            }));
          }, 50);

          const perdidosInterval = setInterval(() => {
            setCounts((prev) => ({
              ...prev,
              perdidos: Math.min(prev.perdidos + 1, 34),
            }));
          }, 50);

          const perdidasInterval = setInterval(() => {
            setCounts((prev) => ({
              ...prev,
              perdidas: Math.min(prev.perdidas + 0.2, 8),
            }));
          }, 50);

          // Limpiar intervalos
          return () => {
            clearInterval(desperdiciadasInterval);
            clearInterval(perdidosInterval);
            clearInterval(perdidasInterval);
          };
        }
      },
      { threshold: 0.5 } // Se activa cuando el 50% de la sección es visible
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section id="problema" ref={sectionRef} className="bg-emerald-900 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Colombia desperdicia <span className="text-amber-400">{counts.desperdiciadas.toFixed(1)}M toneladas</span> de alimentos al año
        </h2>

        <p className="text-emerald-100 max-w-3xl mx-auto text-lg mb-12">
          Mientras millones de personas pasan hambre, toneladas de comida en buen estado terminan en la basura. Es una crisis silenciosa con impacto económico, social y ambiental.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-emerald-800/50 backdrop-blur-sm p-8 rounded-2xl border border-emerald-700 hover:border-emerald-500 transition-colors">
            <h3 className="text-4xl font-extrabold text-amber-400 mb-2">{counts.desperdiciadas.toFixed(1)}M</h3>
            <p className="text-emerald-50 font-medium">Toneladas desperdiciadas</p>
          </div>

          <div className="bg-emerald-800/50 backdrop-blur-sm p-8 rounded-2xl border border-emerald-700 hover:border-emerald-500 transition-colors">
            <h3 className="text-4xl font-extrabold text-red-400 mb-2">{counts.perdidos}%</h3>
            <p className="text-emerald-50 font-medium">Alimentos perdidos</p>
          </div>

          <div className="bg-emerald-800/50 backdrop-blur-sm p-8 rounded-2xl border border-emerald-700 hover:border-emerald-500 transition-colors">
            <h3 className="text-4xl font-extrabold text-emerald-400 mb-2">${counts.perdidas.toFixed(1)}B</h3>
            <p className="text-emerald-50 font-medium">Pérdidas económicas</p>
          </div>
        </div>
      </div>
    </section>
  );
}