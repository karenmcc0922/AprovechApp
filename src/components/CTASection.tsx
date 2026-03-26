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
    <section style={{ backgroundColor: "#064E3B", color: "white", padding: "60px 20px", textAlign: "center" }}>

      <h2 style={{ fontSize: "2rem", fontWeight: "bold" }}>
        Regístrate gratis en AprovechApp
      </h2>

      <p style={{ marginTop: "10px", color: "#d1fae5" }}>
        Únete y empieza a ahorrar mientras ayudas al planeta 🌱
      </p>

      {!submitted ? (
        <form onSubmit={handleSubmit} style={{ marginTop: "30px" }}>
          
          <input
            type="text"
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              display: "block",
              margin: "10px auto",
              padding: "10px",
              width: "250px",
              borderRadius: "5px",
              border: "none"
            }}
          />

          <input
            type="email"
            placeholder="Tu correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              display: "block",
              margin: "10px auto",
              padding: "10px",
              width: "250px",
              borderRadius: "5px",
              border: "none"
            }}
          />

          <button
            type="submit"
            style={{
              marginTop: "15px",
              padding: "10px 20px",
              backgroundColor: "#059669",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Registrarme
          </button>

        </form>
      ) : (
        <p style={{ marginTop: "20px", fontWeight: "bold" }}>
          ✅ ¡Gracias por registrarte, {name}!
        </p>
      )}

    </section>
  );
}