export const API_BASE = "https://aprovechapp-api.onrender.com";

// Dispara un ping al arrancar la app para despertar el servidor de Render
// (free tier duerme tras 15min de inactividad y tarda ~30-60s en despertar)
export const warmupServer = () => {
  fetch(`${API_BASE}/api/ping`).catch(() => {});
};
