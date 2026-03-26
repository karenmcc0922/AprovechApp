import { Building2, Users, Globe2 } from "lucide-react";

export default function BenefitsSection() {
  const benefits = [
    {
      icon: <Building2 className="w-10 h-10 text-blue-600" />,
      title: "Comercios",
      points: ["Recuperan costos de producción", "Reducen pérdidas operativas", "Atraen nuevos clientes al local"]
    },
    {
      icon: <Users className="w-10 h-10 text-emerald-600" />,
      title: "Usuarios",
      points: ["Comida de calidad garantizada", "Ahorro de hasta el 70%", "Descubren nuevos restaurantes"]
    },
    {
      icon: <Globe2 className="w-10 h-10 text-amber-500" />,
      title: "Planeta",
      points: ["Menos alimentos en vertederos", "Reducción de huella de carbono", "Uso eficiente de recursos"]
    }
  ];

  return (
    <section id="beneficios" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-16">
          Todos ganan con AprovechApp
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all duration-300"
            >
              <div className="flex justify-center mb-6">
                {benefit.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">{benefit.title}</h3>
              <ul className="space-y-4">
                {benefit.points.map((point, i) => (
                  <li key={i} className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}