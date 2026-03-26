import { useEffect, useState } from "react";
import { ArrowRight, Star, Users, Store } from "lucide-react";

const HERO_IMAGE_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663469748319/hSWpkg6xAYnmeA5tWzyZDV/aprovechapp-hero-YCiCFE7SiVReiJo8t6Heq2.webp";

const socialProof = [
  { icon: Store, label: "Comercios registrados", value: "500+" },
  { icon: Users, label: "Usuarios activos", value: "12K+" },
  { icon: Star, label: "Calificación promedio", value: "4.8" },
];

export default function HeroSection() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleCTAClick = () => {
    document.querySelector("#registro")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLearnMoreClick = () => {
    document.querySelector("#problema")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-gray-50">
      
      {/* Blur background */}
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-emerald-300/20 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-amber-200/20 rounded-full blur-2xl" />

      <div className="container mx-auto max-w-7xl px-6 pt-28 pb-16 grid lg:grid-cols-2 gap-12 items-center">

        {/* LEFT */}
        <div className="flex flex-col gap-6">

          {/* Badge */}
          <span className={`inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-full border border-emerald-200 transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}>
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Impacto ambiental · Social · Económico
          </span>

          {/* Title */}
          <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight transition-all duration-700 delay-100 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}>
            Menos desperdicio.{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-green-400 bg-clip-text text-transparent">
              Más ahorro.
            </span>{" "}
            Mejor planeta.
          </h1>

          {/* Subtitle */}
          <p className={`text-lg text-gray-600 max-w-lg transition-all duration-700 delay-200 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}>
            <strong>AprovechApp</strong> conecta comercios con excedentes de alimentos con personas que quieren ahorrar hasta un <strong className="text-emerald-600">70%</strong>.
          </p>

          {/* CTA */}
          <div className={`flex gap-3 flex-col sm:flex-row transition-all duration-700 delay-300 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}>
            <button
              onClick={handleCTAClick}
              className="group px-7 py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-300 hover:bg-emerald-700 hover:shadow-emerald-400 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Únete gratis
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>

            <button
              onClick={handleLearnMoreClick}
              className="px-7 py-4 border border-gray-200 rounded-2xl text-gray-700 hover:border-emerald-300 hover:text-emerald-600 transition"
            >
              Conocer más
            </button>
          </div>

          {/* Social proof */}
          <div className={`flex gap-6 pt-2 transition-all duration-700 delay-500 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}>
            {socialProof.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Icon className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-bold">{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className={`flex justify-center transition-all duration-1000 ${
          visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"
        }`}>
          <div className="relative group">

            {/* Glow */}
            <div className="absolute inset-0 bg-emerald-200/30 blur-2xl rounded-3xl group-hover:scale-105 transition" />

            <img
              src={HERO_IMAGE_URL}
              className="relative rounded-3xl shadow-2xl w-full max-w-md transition-transform duration-500 group-hover:scale-105"
            />

            {/* Badge */}
            <div className="absolute -top-4 -left-4 bg-white p-3 rounded-xl shadow-lg">
              <p className="text-xs text-gray-500">Descuento</p>
              <p className="font-bold text-amber-600">hasta 70%</p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}