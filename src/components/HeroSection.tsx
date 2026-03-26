import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="pt-24 pb-20 bg-gradient-to-br from-emerald-50 to-white text-center">

      <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900">
        Menos desperdicio. <span className="text-emerald-600">Más ahorro.</span>
      </h1>

      <p className="mt-4 text-gray-600 max-w-xl mx-auto">
        Conecta comercios con excedentes de alimentos con personas que quieren ahorrar hasta un 70%.
      </p>

      {/* BENEFICIO CLAVE */}
      <p className="mt-4 text-amber-600 font-semibold">
        🎁 Descuento en tu primera compra + domicilios GRATIS por 1 semana
      </p>

      <button
        onClick={() => document.querySelector("#registro")?.scrollIntoView({ behavior: "smooth" })}
        className="mt-6 px-6 py-3 bg-emerald-600 text-white rounded-xl flex items-center gap-2 mx-auto hover:bg-emerald-700"
      >
        Únete gratis <ArrowRight size={18} />
      </button>
    </section>
  );
}