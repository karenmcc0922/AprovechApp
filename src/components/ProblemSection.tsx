export default function ProblemSection() {
  return (
    <section id="problema" className="py-20 bg-emerald-900 text-white text-center">

      <h2 className="text-4xl font-extrabold">
        Colombia desperdicia millones de alimentos
      </h2>

      <p className="mt-4 max-w-xl mx-auto text-emerald-100">
        Mientras muchas personas pasan hambre, toneladas de comida en buen estado se pierden.
      </p>

      <div className="mt-10 grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div>
          <h3 className="text-3xl font-bold text-amber-400">9.7M</h3>
          <p>Toneladas desperdiciadas</p>
        </div>
        <div>
          <h3 className="text-3xl font-bold text-red-400">34%</h3>
          <p>Alimentos perdidos</p>
        </div>
        <div>
          <h3 className="text-3xl font-bold text-green-400">$8B</h3>
          <p>Pérdidas económicas</p>
        </div>
      </div>
    </section>
  );
}