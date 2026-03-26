import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

export default function CTASection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    setSubmitted(true);
  };

  return (
    <section id="registro" className="bg-emerald-900 py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Círculos decorativos de fondo */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-800 rounded-full mix-blend-multiply filter blur-3xl opacity-50 transform -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-800 rounded-full mix-blend-multiply filter blur-3xl opacity-50 transform translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-3xl mx-auto text-center relative z-10">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
          Regístrate gratis en AprovechApp
        </h2>
        <p className="text-lg text-emerald-100 mb-10">
          Únete a la comunidad y empieza a ahorrar mientras ayudas al planeta 🌱
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row justify-center gap-4 max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full sm:w-1/3 px-5 py-3 rounded-xl border-none focus:ring-4 focus:ring-emerald-500/50 outline-none transition-all text-gray-900"
            />
            <input
              type="email"
              placeholder="Tu correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full sm:w-1/3 px-5 py-3 rounded-xl border-none focus:ring-4 focus:ring-emerald-500/50 outline-none transition-all text-gray-900"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-400 active:scale-95 transition-all shadow-lg hover:shadow-amber-500/30"
            >
              Registrarme
            </button>
          </form>
        ) : (
          <div className="bg-emerald-800/50 backdrop-blur-sm p-8 rounded-2xl border border-emerald-700 max-w-md mx-auto animate-fade-in-up">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <p className="text-2xl font-bold text-white mb-2">
              ¡Gracias, {name}!
            </p>
            <p className="text-emerald-100">
              Te avisaremos en cuanto tengamos ofertas cerca de ti.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}