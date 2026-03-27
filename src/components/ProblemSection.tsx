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

    const duration = 2000;
    const frameRate = 1000 / 60;
    const totalFrames = duration / frameRate;

    let frame = 0;
    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
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
      className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
      /* Degradado de verde vibrante a verde marca */
      style={{ 
        background: "linear-gradient(135deg, #00da00 0%, #30f100 100%)" 
      }}
    >
      {/* Círculos decorativos para dar textura al fondo */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-brand-orange/10 rounded-full blur-[80px]"></div>

      <div className="max-w-6xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/10 text-white text-sm font-black rounded-full border border-white/20 mb-8 backdrop-blur-md">
          <AlertTriangle className="w-4 h-4 text-brand-orange" />
          <span className="uppercase tracking-wider">La realidad en Colombia</span>
        </div>

        <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight drop-shadow-sm">
          Desperdiciamos <br className="hidden md:block" />
          <span className="text-brand-orange drop-shadow-md">
            {counts.desperdiciadas.toFixed(1)}M de toneladas
          </span>
        </h2>

        <p className="text-emerald-50 max-w-3xl mx-auto text-xl md:text-2xl mb-16 leading-relaxed opacity-90">
          Mientras millones pasan hambre, comida en buen estado termina en la basura. 
          <span className="block mt-4 font-black text-white italic underline decoration-brand-orange decoration-4 underline-offset-8">
            ¡Esto tiene que parar!
          </span>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="group bg-white/15 backdrop-blur-xl p-10 rounded-[3rem] border border-white/20 hover:bg-white/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl shadow-emerald-900/20">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg group-hover:rotate-6 transition-transform">
              <TrendingDown className="w-8 h-8 text-brand-green" />
            </div>
            <h3 className="text-5xl font-black text-white mb-3 tracking-tighter">
              {counts.desperdiciadas.toFixed(1)}M
            </h3>
            <p className="text-emerald-100 font-bold uppercase tracking-widest text-xs opacity-80">
              Toneladas al año
            </p>
          </div>

          {/* Card 2 */}
          <div className="group bg-white/15 backdrop-blur-xl p-10 rounded-[3rem] border border-white/20 hover:bg-white/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl shadow-emerald-900/20">
            <div className="w-16 h-16 bg-brand-orange rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg group-hover:-rotate-6 transition-transform">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-5xl font-black text-white mb-3 tracking-tighter">
              {counts.perdidos}%
            </h3>
            <p className="text-emerald-100 font-bold uppercase tracking-widest text-xs opacity-80">
              Producción total
            </p>
          </div>

          {/* Card 3 */}
          <div className="group bg-white/15 backdrop-blur-xl p-10 rounded-[3rem] border border-white/20 hover:bg-white/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl shadow-emerald-900/20">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg group-hover:rotate-6 transition-transform">
              <DollarSign className="w-8 h-8 text-brand-green" />
            </div>
            <h3 className="text-5xl font-black text-white mb-3 tracking-tighter">
              ${counts.perdidas.toFixed(1)}B
            </h3>
            <p className="text-emerald-100 font-bold uppercase tracking-widest text-xs opacity-80">
              Pérdidas económicas
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}