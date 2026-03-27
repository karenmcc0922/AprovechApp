import { Globe, TrendingUp, Target, Users } from "lucide-react";

const marketStats = [
  {
    value: "$8.4B",
    label: "Tamaño del mercado global",
    sublabel: "de apps de reducción de desperdicio para 2028",
    icon: Globe,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  {
    value: "28%",
    label: "Crecimiento anual (CAGR)",
    sublabel: "del mercado de foodtech en Latinoamérica",
    icon: TrendingUp,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
  {
    value: "650M",
    label: "Personas en Latinoamérica",
    sublabel: "mercado potencial sin soluciones consolidadas",
    icon: Users,
    color: "text-teal-600",
    bg: "bg-teal-50",
    border: "border-teal-100",
  },
  {
    value: "0",
    label: "Competidores dominantes",
    sublabel: "en el mercado colombiano con esta propuesta",
    icon: Target,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-100",
  },
];

const globalPlayers = [
  { name: "Too Good To Go", region: "Europa", presence: 85, color: "bg-emerald-600" },
  { name: "Foodsi", region: "Polonia", presence: 60, color: "bg-emerald-400" },
  { name: "Food for All", region: "Estados Unidos", presence: 45, color: "bg-teal-400" },
  { name: "AprovechApp", region: "Colombia", presence: 15, color: "bg-amber-500", isUs: true },
];

export default function MarketSection() {
  return (
    <section id="oportunidad" className="py-20 lg:py-28 bg-gray-50/50">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-bold rounded-full border border-emerald-200 mb-6">
            📈 Oportunidad de mercado
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
            Colombia está{" "}
            <span className="bg-gradient-to-r from-green-700 to-green-500 bg-clip-text text-transparent">
              esperando
            </span>{" "}
            esta solución
          </h2>
          <p className="mt-6 text-lg text-gray-600 leading-relaxed">
            Mientras en Europa estas apps ya tienen millones de usuarios, 
            en nuestra región no existe un jugador dominante. AprovechApp llega para liderar.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {marketStats.map((stat) => (
            <div
              key={stat.value}
              className={`p-8 rounded-3xl bg-white border ${stat.border} shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <p className={`text-4xl font-black mb-2 ${stat.color}`}>
                {stat.value}
              </p>
              <p className="text-gray-900 font-bold text-base mb-1">{stat.label}</p>
              <p className="text-gray-500 text-sm leading-relaxed">{stat.sublabel}</p>
            </div>
          ))}
        </div>

        {/* Market comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Gráfico de Barras */}
          <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Presencia en el mercado
            </h3>
            <p className="text-gray-500 text-sm mb-8">
              Índice de penetración por región y competidor
            </p>
            <div className="space-y-8">
              {globalPlayers.map((player) => (
                <div key={player.name}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${player.isUs ? "text-amber-600" : "text-gray-700"}`}>
                        {player.name}
                      </span>
                      {player.isUs && (
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md font-black uppercase">
                          Nosotros
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-tighter">{player.region}</span>
                  </div>
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${player.color}`}
                      style={{ width: `${player.presence}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tarjetas de Argumentos */}
          <div className="space-y-4">
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 flex gap-4">
              <span className="text-2xl shrink-0">🌎</span>
              <div>
                <h4 className="font-bold text-emerald-900 text-lg mb-1">Iniciativa en Colombia</h4>
                <p className="text-emerald-700/80 text-sm leading-relaxed">
                  No existe una solución consolidada en la región. AprovechApp define la categoría desde cero.
                </p>
              </div>
            </div>
            
            <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
              <span className="text-2xl shrink-0">🏙️</span>
              <div>
                <h4 className="font-bold text-amber-900 text-lg mb-1">Ciudades con alto potencial</h4>
                <p className="text-amber-700/80 text-sm leading-relaxed">
                  Bogotá, Medellín y Cali concentran el 60% de los comercios. El modelo es 100% escalable.
                </p>
              </div>
            </div>

            <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex gap-4">
              <span className="text-2xl shrink-0">📋</span>
              <div>
                <h4 className="font-bold text-blue-900 text-lg mb-1">Regulación favorable</h4>
                <p className="text-blue-700/80 text-sm leading-relaxed">
                  La Ley 1990 de 2019 en Colombia castiga el desperdicio, impulsando nuestro crecimiento.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}