import { Store, Search, ShoppingCart } from "lucide-react";

const steps = [
  {
    icon: Store,
    title: "Comercios publican",
    desc: "Restaurantes y supermercados publican alimentos que no lograron vender.",
    color: "text-emerald-600",
    bg: "bg-emerald-100",
  },
  {
    icon: Search,
    title: "Usuarios descubren",
    desc: "Las personas encuentran ofertas cerca de su ubicación.",
    color: "text-amber-500",
    bg: "bg-amber-100",
  },
  {
    icon: ShoppingCart,
    title: "Compran y recogen",
    desc: "Compran a bajo precio y recogen su pedido fácilmente.",
    color: "text-teal-600",
    bg: "bg-teal-100",
  },
];

export default function SolutionSection() {
  return (
    <section id="solucion" className="py-20 bg-white">
      <div className="container mx-auto max-w-6xl px-6 text-center">

        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
          ¿Cómo funciona AprovechApp?
        </h2>

        <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
          Conectamos comercios con personas que quieren ahorrar y reducir el desperdicio.
        </p>

        <div className="mt-12 grid sm:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all"
            >
              <div className={`w-12 h-12 mx-auto flex items-center justify-center rounded-xl ${step.bg}`}>
                <step.icon className={`w-6 h-6 ${step.color}`} />
              </div>

              <h3 className="mt-4 text-lg font-bold text-gray-900">
                {step.title}
              </h3>

              <p className="mt-2 text-gray-500 text-sm">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}