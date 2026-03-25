export default function HeroSection() {
  return (
    <section style={{ padding: "80px 20px", textAlign: "center" }}>
      
      <h1 style={{ fontSize: "2.5rem", fontWeight: "bold" }}>
        Menos desperdicio, <span style={{ color: "#059669" }}>más ahorro</span>
      </h1>

      <p style={{ fontSize: "1.2rem", marginTop: "10px", color: "#555" }}>
        AprovechApp conecta restaurantes con excedentes de comida
        con personas que quieren ahorrar hasta un 70%.
      </p>

      <div style={{ marginTop: "20px" }}>
        <input
          type="email"
          placeholder="Ingresa tu correo"
          style={{
            padding: "10px",
            width: "250px",
            marginRight: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc"
          }}
        />

        <button
          style={{
            padding: "10px 20px",
            backgroundColor: "#059669",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Quiero ofertas
        </button>
      </div>

    </section>
  );
}