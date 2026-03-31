import { useState } from "react";
import { CheckCircle2, Gift, Truck, Loader2 } from "lucide-react"; // Añadí Loader2 para el efecto de carga

export default function CTASection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false); // Nuevo estado para saber si se está enviando

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setLoading(true); // Empezamos a cargar

    try {
      // 🚀 CONEXIÓN REAL CON TU SERVIDOR NODE.JS
      const response = await fetch("http://localhost:3306/api/registro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nombre: name, correo: email }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const errorData = await response.json();
        alert("Error: " + errorData.error);
      }
    } catch (error) {
      console.error("Error al conectar con el servidor:", error);
      alert("No se pudo conectar con el servidor. ¿Olvidaste encenderlo con 'node index.js'?");
    } finally {
      setLoading(false); // Terminamos de cargar
    }
  };

  return (
    <section id="registro" className="bg-green-700 py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decoración de fondo */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-800 rounded-full mix-blend-multiply filter blur-3xl opacity-50 transform -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-800 rounded-full mix-blend-multiply filter blur-3xl opacity-50 transform translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
          ¡Únete y recibe tus beneficios! 🎁
        </h2>
        <p className="text-lg md:text-xl text-emerald-100 mb-10 max-w-2xl mx-auto">
          Regístrate hoy en AprovechApp y empieza a ahorrar con estas ventajas exclusivas de bienvenida:
        </p>

        {/* Tarjetas de Beneficios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12 max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-2xl flex items-center gap-4 text-left">
            <div className="w-12 h-12 bg-[#FFA832] rounded-full flex items-center justify-center shrink-0 shadow-lg">
              <Gift className="text-emerald-900 w-6 h-6" />
            </div>
            <div>
              <p className="text-white font-bold">DTO. Especial</p>
              <p className="text-emerald-200 text-sm">En tu primera compra</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-2xl flex items-center gap-4 text-left">
            <div className="w-12 h-12 bg-emerald-400 rounded-full flex items-center justify-center shrink-0 shadow-lg">
              <Truck className="text-emerald-900 w-6 h-6" />
            </div>
            <div>
              <p className="text-white font-bold">Domicilios Gratis</p>
              <p className="text-emerald-200 text-sm">Toda tu primera semana</p>
            </div>
          </div>
        </div>

        {!submitted ? (
          <div className="bg-white/5 p-2 rounded-2xl backdrop-blur-sm border border-white/10 max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row justify-center gap-3 p-4">
              <input
                type="text"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                /* Clases actualizadas para ver el BORDE */
                className="w-full sm:w-1/3 px-5 py-4 rounded-xl bg-black/20 border-2 border-white/40 text-white placeholder:text-white/60 outline-none focus:border-[#FFA832] transition-all font-medium"
              />
              <input
                type="email"
                placeholder="Tu correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                /* Clases actualizadas para ver el BORDE */
                className="w-full sm:w-1/3 px-5 py-4 rounded-xl bg-black/20 border-2 border-white/40 text-white placeholder:text-white/60 outline-none focus:border-[#FFA832] transition-all font-medium"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-4 bg-[#FFA832] text-green-950 font-black text-lg rounded-xl hover:bg-amber-400 active:scale-95 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "¡Lo quiero!"}
              </button>
            </form>
          </div>
        ) : (
          /* Mensaje de éxito */
          <div className="bg-green-800/50 backdrop-blur-md p-10 rounded-3xl border-2 border-green-400/30 max-w-md mx-auto shadow-2xl animate-in zoom-in duration-300">
            <CheckCircle2 className="w-20 h-20 text-green-400 mx-auto mb-6" />
            <p className="text-3xl font-black text-white mb-2">
              ¡Bienvenido, {name}!
            </p>
            <p className="text-green-100 text-lg">
              Te hemos registrado con éxito en nuestra base de datos. ✨
            </p>
          </div>
        )}
        
        <p className="mt-8 text-green-400/60 text-xs uppercase tracking-widest font-bold">
          Oferta limitada para los primeros 500 usuarios
        </p>
      </div>
    </section>
  );
}