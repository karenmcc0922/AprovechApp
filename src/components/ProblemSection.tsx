import { AlertTriangle, TrendingDown, DollarSign } from "lucide-react";
import { useScrollReveal } from "../hooks/useScrollReveal";

const stats = [
  {
    icon: AlertTriangle,
    value: "9.7M",
    label: "Toneladas desperdiciadas",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  {
    icon: TrendingDown,
    value: "34%",
    label: "Alimentos perdidos",
    color: "text-red-400",
    bg: "bg-red-400/10",
  },
  {
    icon: DollarSign,
    value: "$8B",
    label: "Pérdidas económicas",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
];

export default function ProblemSection() {
  const sectionRef = useScrollReveal(0.1);

  return (
    <section
      id="problema"
      className="relative py-20 lg:py-28 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #064E3B 0%, #065F46 50%, #047857 100%)",
      }}
    >
      {/* Fondo con punticos */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />

      <div
        ref={sectionRef}
        className="container mx-auto max-w-6xl px-6 text-center"
      >
        {/* Badge */}
        <span className="reveal inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 text-emerald-200 text-sm font-semibold rounded-full border border-white/20 mb-6">
          <AlertTriangle className="w-4 h-4" />
          El problema que nadie ve
        </span>

        {/* Título */}
        <h2 className="reveal reveal-delay-1 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
          Colombia desperdicia{" "}
          <span className="text-amber-400">9.7M toneladas</span>{" "}
          de alimentos al año
        </h2>

        {/* Texto */}
        <p className="reveal reveal-delay-2 mt-4 text-lg text-emerald-100/80 max-w-2xl mx-auto">
          Mientras millones de personas pasan hambre, toneladas de alimentos en buen estado
          terminan en la basura. Es una crisis silenciosa con impacto económico,
          social y ambiental.
        </p>

        {/* Cards */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <div
              key={stat.value}
              className={`reveal reveal-delay-${i + 1} p-6 rounded-2xl backdrop-blur-md border border-white/10 ${stat.bg} hover:scale-105 transition-transform duration-300`}
            >
              <div className="mb-3 flex justify-center">
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/10">
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>

              <h3 className={`text-3xl font-extrabold ${stat.color}`}>
                {stat.value}
              </h3>
              <p className="text-sm text-emerald-100 mt-2">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Callout */}
        <div className="reveal mt-12 p-6 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-emerald-100 text-lg">
            💡 <strong className="text-white">La oportunidad:</strong> gran parte
            del desperdicio ocurre en comercios — exactamente donde{" "}
            <span className="text-amber-400 font-semibold">
              AprovechApp
            </span>{" "}
            actúa.
          </p>
        </div>
      </div>
    </section>
  );
}