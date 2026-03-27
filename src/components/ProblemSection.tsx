import { useState, useEffect, useRef } from "react";
import { AlertTriangle, TrendingDown, DollarSign } from "lucide-react";

export default function ProblemSection() {
  const [counts, setCounts] = useState({ desperdiciadas: 0, perdidos: 0, perdidas: 0 });
  const sectionRef = useRef(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    const duration = 2000; // 2 segundos de animación
    const frameRate = 1000 / 60;
    const totalFrames = duration / frameRate;

    let frame = 0;
    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      
      // Función de easing para que frene suavemente
      const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
      const currentProgress = easeOut(progress);

      setCounts({
        desperdiciadas: currentProgress * 9.7,
        perdidos: Math.round(currentProgress * 34),
        perdidas: currentProgress * 8,
      });

      if (frame >= totalFrames) clearInterval(timer);
    }, frameRate);

    return () => clearInterval(timer);
  }, [hasStarted]);

  return (
    <section 
      id="problema" 
      ref={sectionRef} 
      className="bg-brand-green-dark py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      {/* Decoración de fondo */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange opacity-5 blur-[120px] rounded-full"></div>

      <div className="max-w-6xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-500/10 text-red-400 text-sm font-bold rounded-full border border-red-500/20 mb-8">
          <AlertTriangle className="w-4 h-4" />
          <span>La crisis invisible en Colombia</span>
        </div>

        <h2 className="text-3xl md:text-5xl font-black text-white mb-8 leading-tight">
          Colombia desperdicia <br className="hidden md:block" />
          <span className="text-brand-orange">
            {counts.desperdiciadas.toFixed(1)} Millones de toneladas
          </span>{" "}
          de alimentos al año
        </h2>

        <p className="text-brand-green-light/70 max-w-3xl mx-auto text-lg md:text-xl mb-16 leading-relaxed">
          Mientras millones enfrentan inseguridad alimentaria, comida en perfecto estado termina en la basura. 
          <span className="text-white font-semibold"> Es hora de cambiar las reglas del juego.</span>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="group bg-white/5 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-all duration-500">
            <div className="w-14 h-14 bg-brand-orange/20 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
              <TrendingDown className="w-7 h-7 text-brand-orange" />
            </div>
            <h3 className="text-5xl font-black text-white mb-3">
              {counts.desperdiciadas.toFixed(1)}M
            </h3>
            <p className="text-brand-green-light font-bold uppercase tracking-widest text-xs">
              Toneladas al año
            </p>
          </div>

          {/* Card 2 */}
          <div className="group bg-white/5 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-all duration-500">
            <div className="w-14 h-14 bg-red-500/20 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-7 h-7 text-red-400" />
            </div>
            <h3 className="text-5xl font-black text-white mb-3">
              {counts.perdidos}%
            </h3>
            <p className="text-brand-green-light font-bold uppercase tracking-widest text-xs">
              De la producción total
            </p>
          </div>

          {/* Card 3 */}
          <div className="group bg-white/5 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-all duration-500">
            <div className="w-14 h-14 bg-brand-green/20 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
              <DollarSign className="w-7 h-7 text-brand-green" />
            </div>
            <h3 className="text-5xl font-black text-white mb-3">
              ${counts.perdidas.toFixed(1)}B
            </h3>
            <p className="text-brand-green-light font-bold uppercase tracking-widest text-xs">
              Pérdida en la economía
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}