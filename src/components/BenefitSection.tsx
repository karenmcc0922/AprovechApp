export default function BenefitsSection() {
  return (
    <section style={{ padding: "60px 20px", textAlign: "center", backgroundColor: "#f9fafb" }}>
      
      <h2 style={{ fontSize: "2rem", fontWeight: "bold" }}>
        Todos ganan con AprovechApp
      </h2>

      <div style={{
        marginTop: "40px",
        display: "flex",
        justifyContent: "center",
        gap: "20px",
        flexWrap: "wrap"
      }}>

        {/* Comercios */}
        <div style={{ width: "250px", padding: "20px", background: "white", borderRadius: "10px", border: "1px solid #ddd" }}>
          <h3>🏪 Comercios</h3>
          <p>Recuperan ingresos de productos que no lograron vender.</p>
          <p>Reducen pérdidas y mejoran su negocio.</p>
        </div>

        {/* Usuarios */}
        <div style={{ width: "250px", padding: "20px", background: "white", borderRadius: "10px", border: "1px solid #ddd" }}>
          <h3>👤 Usuarios</h3>
          <p>Acceden a comida de calidad a precios más bajos.</p>
          <p>Ahorro de hasta el 70% en alimentos.</p>
        </div>

        {/* Planeta */}
        <div style={{ width: "250px", padding: "20px", background: "white", borderRadius: "10px", border: "1px solid #ddd" }}>
          <h3>🌍 Planeta</h3>
          <p>Se reduce el desperdicio de alimentos.</p>
          <p>Menor impacto ambiental y menos CO₂.</p>
        </div>

      </div>

    </section>
  );
}