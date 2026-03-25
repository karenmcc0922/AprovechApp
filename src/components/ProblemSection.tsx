export default function ProblemSection() {
  return (
    <section style={{ backgroundColor: "#064E3B", color: "white", padding: "60px 20px", textAlign: "center" }}>

      <h2 style={{ fontSize: "2rem", fontWeight: "bold" }}>
        Colombia desperdicia <span style={{ color: "#FBBF24" }}>9.7M toneladas</span> de alimentos al año
      </h2>

      <p style={{ marginTop: "15px", maxWidth: "600px", marginInline: "auto", color: "#d1fae5" }}>
        Mientras millones de personas pasan hambre, toneladas de comida en buen estado
        terminan en la basura. Es una crisis silenciosa con impacto económico, social y ambiental.
      </p>

      <div style={{ marginTop: "30px", display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
        
        <div style={{ background: "#065F46", padding: "15px", borderRadius: "10px", width: "200px" }}>
          <h3 style={{ color: "#FBBF24" }}>9.7M</h3>
          <p>Toneladas desperdiciadas</p>
        </div>

        <div style={{ background: "#065F46", padding: "15px", borderRadius: "10px", width: "200px" }}>
          <h3 style={{ color: "#F87171" }}>34%</h3>
          <p>Alimentos perdidos</p>
        </div>

        <div style={{ background: "#065F46", padding: "15px", borderRadius: "10px", width: "200px" }}>
          <h3 style={{ color: "#34D399" }}>$8B</h3>
          <p>Pérdidas económicas</p>
        </div>

      </div>

    </section>
  );
}