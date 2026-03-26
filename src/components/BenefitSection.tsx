export default function BenefitsSection() {
  return (
    <section id="beneficios" className="py-20 bg-gray-50 text-center">

      <h2 className="text-4xl font-extrabold text-gray-900">
        ¿Por qué usar AprovechApp?
      </h2>

      <div className="mt-10 grid sm:grid-cols-3 gap-6 max-w-5xl mx-auto">

        <div className="p-6 bg-white rounded-xl shadow">
          💰 <h3 className="font-bold">Ahorra dinero</h3>
          <p>Hasta 70% en alimentos.</p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow">
          🌱 <h3 className="font-bold">Ayuda al planeta</h3>
          <p>Reduce el desperdicio.</p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow">
          🎁 <h3 className="font-bold">Beneficios exclusivos</h3>
          <p>Descuento inicial + domicilios gratis por 1 semana.</p>
        </div>

      </div>
    </section>
  );
}