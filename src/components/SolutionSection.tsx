import { Store, MapPin, ShoppingBag } from "lucide-react";

export default function SolutionSection() {
  const steps = [
    {
      icon: <Store className="w-8 h-8 text-emerald-600" />,
      title: "1. Comercios publican",
      description: "Restaurantes y supermercados publican alimentos en perfecto estado que no lograron vender en el día.",
      color: "bg-emerald-100"
    },
    {
      icon: <MapPin className="w-8 h-8 text-amber-500" />,
      title: "2. Usuarios descubren",
      description: "Exploras el mapa en la app y encuentras ofertas irresistibles muy cerca de tu ubicación.",
      color: "bg-amber-100"
    },
    {
      icon: <ShoppingBag className="w-8 h-8 text-teal-600" />,
      title: "3. Compras y recoges",
      description: "Pagas a un precio súper bajo desde la app y pasas a recoger tu pedido directamente al local.",
      color: "bg-teal-100"
    }
  ];

  return (
    <section id="solucion" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
          ¿Cómo funciona AprovechApp?
        </h2>
        <p className="text-lg text-gray-600 mb-16 max-w-2xl mx-auto">
          Conectamos comercios con personas que quieren ahorrar y reducir el desperdicio en tres sencillos pasos.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="group bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center"
            >
              <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}