import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import iconMarker from "leaflet/dist/images/marker-icon.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: iconMarker,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export interface TiendaMapa {
  aliado_id: number;
  nombre: string;
  direccion: string;
  lat: number;
  lng: number;
  productos: number;
}

function AjustarVista({ tiendas }: { tiendas: TiendaMapa[] }) {
  const map = useMap();
  useEffect(() => {
    if (tiendas.length === 0) return;
    if (tiendas.length === 1) {
      map.setView([tiendas[0].lat, tiendas[0].lng], 15);
    } else {
      const bounds = L.latLngBounds(tiendas.map((t) => [t.lat, t.lng]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [tiendas, map]);
  return null;
}

interface Props {
  tiendas: TiendaMapa[];
  onVerVitrina: (aliadoId: number) => void;
}

export default function MapaCatalogo({ tiendas, onVerVitrina }: Props) {
  const centroPereira: [number, number] = [4.8133, -75.6961];

  return (
    <MapContainer
      center={centroPereira}
      zoom={13}
      scrollWheelZoom
      className="w-full h-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      {tiendas.map((tienda) => (
        <Marker key={tienda.aliado_id} position={[tienda.lat, tienda.lng]}>
          <Popup>
            <div style={{ minWidth: 160, padding: 4 }}>
              <p style={{ fontWeight: 900, fontSize: 13, margin: "0 0 4px", color: "#1e293b" }}>
                {tienda.nombre}
              </p>
              <p style={{ fontSize: 10, margin: "0 0 4px", color: "#64748b" }}>
                {tienda.direccion}
              </p>
              <p style={{ fontSize: 10, margin: "0 0 8px", color: "#16a34a", fontWeight: 700 }}>
                {tienda.productos} producto{tienda.productos !== 1 ? "s" : ""} disponible{tienda.productos !== 1 ? "s" : ""}
              </p>
              <button
                onClick={() => onVerVitrina(tienda.aliado_id)}
                style={{
                  width: "100%",
                  background: "#16a34a",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "6px 12px",
                  fontSize: 10,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Ver ofertas →
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
      <AjustarVista tiendas={tiendas} />
    </MapContainer>
  );
}
