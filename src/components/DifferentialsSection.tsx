import { Truck, Bell, MapPin, ShieldCheck, Smartphone, Zap } from "lucide-react";

const differentials = [
  {
    icon: Truck,
    emoji: "🛵",
    title: "Domicilios integrados",
    description: "No necesitas salir de casa. Solicita domicilio directamente desde la app y recibe tus alimentos con descuento en la puerta.",
    tag: "Exclusivo",
    tagColor: "bg-emerald-100 text-emerald-700",
    iconBg: "bg-green-700",
    highlight: true,
  },
  {
    icon: Bell,
    emoji: "🔔",
    title: "Notificaciones inteligentes",
    description: "Algoritmo que aprende tus preferencias: tipo de comida, presupuesto y horarios. Recibe solo lo que realmente te interesa.",
    tag: "IA personalizada",
    tagColor: "bg-amber-100 text-amber-700",
    iconBg: "bg-amber-500",
    highlight: false,
  },
  {
    icon: MapPin,
    emoji: "📍",
    title: "Ofertas cercanas a ti",
    description: "Mapa interactivo en tiempo real con comercios activos cerca de tu ubicación. Filtra por distancia y tipo de alimento.",
    tag: "Geolocalización",
    tagColor: "bg-teal-100 text-teal-700",
    iconBg: "bg-teal-600",
    highlight: false,
  },
  {
    icon: ShieldCheck,
    emoji: "🔒",
    title: "Pagos 100% seguros",
    description: "Acepta tarjetas, PSE, Nequi y Daviplata. Tu dinero está protegido con nuestra garantía de reembolso integral.",
    tag: "Seguridad",
    tagColor: "bg-blue-100 text-blue-700",
    iconBg: "bg-blue-600",
    highlight: false,
  },
  {
    icon: Smartphone,
    emoji: "📱",
    title: "App iOS y Android",
    description: "Experiencia fluida y rápida diseñada para que encontrar y comprar comida sea tan fácil como dar tres toques.",
    tag: "Multiplataforma",
    tagColor: "bg-purple-100 text-purple-700",
    iconBg: "bg-purple-600",
    highlight: false,
  },
  {
    icon: Zap,
    emoji: "⚡",
    title: "Publicación en 2 min",
    description: "Los comercios publican sus excedentes en tiempo récord. Sin complicaciones técnicas ni curvas de aprendizaje.",
    tag: "Simplicidad",
    tagColor: "bg-orange-100 text-orange-700",
    iconBg: "bg-orange-500",
    highlight: false,
  },
];

export default function DifferentialsSection() {
  return (
    <section id="beneficios" className="py-20 lg:py-28 bg-white">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header con el degradado de Manus */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-bold rounded-full border border-emerald-100 mb-6">
            ✨ ¿Por qué elegirnos?
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
            ¿Por qué elegir{" "}
            <span className="bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
              AprovechApp?
            </span>
          </h2>
          <p className="mt-6 text-lg text-gray-600 leading-relaxed">
            No somos solo otra app de descuentos. Combinamos tecnología y sostenibilidad 
            diseñada específicamente para el contexto colombiano.
          </p>
        </div>

        {/* Grid de Diferenciales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {differentials.map((diff) => (
            <div
              key={diff.title}
              className={`group relative p-8 rounded-3xl border transition-all duration-500 hover:-translate-y-2 ${
                diff.highlight
                  ? "bg-emerald-600 border-emerald-500 text-white shadow-2xl shadow-emerald-200"
                  : "bg-white border-gray-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-50/50"
              }`}
            >
              {/* Icono y Tag */}
              <div className="flex items-start justify-between mb-6">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${
                    diff.highlight ? "bg-white/20" : diff.iconBg
                  }`}
                >
                  <diff.icon className="w-7 h-7 text-white" />
                </div>
                <span
                  className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-lg ${
                    diff.highlight ? "bg-white/20 text-white" : diff.tagColor
                  }`}
                >
                  {diff.tag}
                </span>
              </div>

              {/* Texto */}
              <h3 className={`text-xl font-bold mb-3 ${diff.highlight ? "text-white" : "text-gray-900"}`}>
                {diff.emoji} {diff.title}
              </h3>
              <p className={`text-sm leading-relaxed ${diff.highlight ? "text-emerald-50" : "text-gray-500"}`}>
                {diff.description}
              </p>

              {/* Línea decorativa inferior (solo para las blancas) */}
              {!diff.highlight && (
                <div className="absolute bottom-0 left-8 right-8 h-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}