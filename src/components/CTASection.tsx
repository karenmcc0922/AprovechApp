import { useState } from "react";

export default function CTASection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!name || !email) return;
    setDone(true);
  };

  return (
    <section id="registro" className="py-20 bg-emerald-700 text-white text-center">

      <h2 className="text-4xl font-extrabold">
        Regístrate gratis
      </h2>

      <p className="mt-4 text-emerald-100">
        🎁 Obtén descuento en tu primera compra + domicilios gratis por 1 semana
      </p>

      {!done ? (
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 max-w-sm mx-auto">

          <input
            placeholder="Nombre"
            className="p-3 rounded text-black"
            onChange={(e) => setName(e.target.value)}
          />

          <input
            placeholder="Correo"
            className="p-3 rounded text-black"
            onChange={(e) => setEmail(e.target.value)}
          />

          <button className="bg-amber-400 text-black p-3 rounded font-bold">
            Registrarme
          </button>

        </form>
      ) : (
        <p className="mt-6 font-bold">
          ✅ ¡Gracias {name}! Revisa tu correo 🎉
        </p>
      )}
    </section>
  );
}