import { useState } from "react";

export default function CTASection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!name || !email) return;
    setSubmitted(true);
  };

  return (
    <section id="registro" className="py-20 bg-gradient-to-br from-emerald-700 to-emerald-900 text-center text-white">

      <div className="max-w-xl mx-auto px-6">

        <h2 className="text-3xl sm:text-4xl font-extrabold">
          Regístrate gratis en AprovechApp
        </h2>

        <p className="mt-4 text-emerald-100">
          Únete y empieza a ahorrar mientras ayudas al planeta 🌱
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">

            <input
              type="text"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-4 py-3 rounded-xl text-gray-900 outline-none focus:ring-2 focus:ring-emerald-400"
            />

            <input
              type="email"
              placeholder="Tu correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-3 rounded-xl text-gray-900 outline-none focus:ring-2 focus:ring-emerald-400"
            />

            <button
              type="submit"
              className="mt-2 px-6 py-3 bg-amber-400 text-gray-900 font-bold rounded-xl hover:bg-amber-300 transition"
            >
              Registrarme
            </button>
          </form>
        ) : (
          <p className="mt-6 text-lg font-semibold">
            ✅ ¡Gracias por registrarte, {name}!
          </p>
        )}
      </div>
    </section>
  );
}