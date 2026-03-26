export default function SolutionSection() {
  return (
    <section style={{ padding: "60px 20px", textAlign: "center" }}>
      
      <h2 style={{ fontSize: "2rem", fontWeight: "bold" }}>
        ¿Cómo funciona AprovechApp?
      </h2>

      <p style={{ marginTop: "10px", color: "#555" }}>
        Conectamos comercios con personas que quieren ahorrar y reducir el desperdicio.
      </p>

      <div style={{
        marginTop: "40px",
        display: "flex",
        justifyContent: "center",
        gap: "20px",
        flexWrap: "wrap"
      }}>

        {/* Paso 1 */}
        <div style={{ width: "250px", padding: "20px", border: "1px solid #ddd", borderRadius: "10px" }}>
          <h3 style={{ color: "#059669" }}>1. Comercios publican</h3>
          <p>
            Restaurantes y supermercados publican alimentos que no lograron vender.
          </p>
        </div>

        {/* Paso 2 */}
        <div style={{ width: "250px", padding: "20px", border: "1px solid #ddd", borderRadius: "10px" }}>
          <h3 style={{ color: "#F59E0B" }}>2. Usuarios descubren</h3>
          <p>
            Las personas encuentran ofertas cerca de su ubicación.
          </p>
        </div>

        {/* Paso 3 */}
        <div style={{ width: "250px", padding: "20px", border: "1px solid #ddd", borderRadius: "10px" }}>
          <h3 style={{ color: "#0D9488" }}>3. Compran y recogen</h3>
          <p>
            Compran a bajo precio y recogen su pedido fácilmente.
          </p>
        </div>

      </div>

    </section>
  );
}