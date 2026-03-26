export default function SolutionSection() {
  return (
    <section id="solucion" className="py-20 text-center bg-white">

      <h2 className="text-4xl font-extrabold text-gray-900">
        ¿Cómo funciona?
      </h2>

      <div className="mt-10 grid sm:grid-cols-3 gap-6 max-w-5xl mx-auto">

        <div className="p-6 border rounded-xl">
          <h3 className="text-emerald-600 font-bold">1. Comercios publican</h3>
          <p>Suben alimentos que no lograron vender.</p>
        </div>

        <div className="p-6 border rounded-xl">
          <h3 className="text-amber-500 font-bold">2. Usuarios descubren</h3>
          <p>Encuentran ofertas cercanas.</p>
        </div>

        <div className="p-6 border rounded-xl">
          <h3 className="text-teal-600 font-bold">3. Compran</h3>
          <p>Ahorran dinero y ayudan al planeta.</p>
        </div>

      </div>
    </section>
  );
}