import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Solución al bug clásico de Leaflet con los iconos por defecto en React
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
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapaProps {
  lat: number;
  lng: number;
  nombreLocal: string;
  direccion?: string;
}

// Sub-componente para recentrar el mapa dinámicamente si cambian las coordenadas
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 15);
  }, [lat, lng, map]);
  return null;
}

export default function MapaAliado({ lat, lng, nombreLocal, direccion }: MapaProps) {
  // Coordenadas de respaldo: centro de Pereira, Colombia
  const posicion: [number, number] = [lat || 4.8133, lng || -75.6961];

  return (
    <div className="w-full h-[300px] rounded-[30px] overflow-hidden shadow-inner border border-slate-100 relative z-10">
      <MapContainer
        center={posicion}
        zoom={15}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        {/* Capa estética de OpenStreetMap (Estilo claro y limpio) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        <Marker position={posicion}>
          <Popup>
            <div className="p-1">
              <h4 className="font-black text-slate-800 text-sm uppercase m-0 leading-tight">
                {nombreLocal}
              </h4>
              {direccion && (
                <p className="text-[10px] text-slate-500 font-bold mt-1 m-0">
                  {direccion}
                </p>
              )}
              <p className="text-[9px] text-green-600 font-black uppercase mt-1 m-0">
                ¡Punto de rescate seguro!
              </p>
            </div>
          </Popup>
        </Marker>

        <RecenterMap lat={posicion[0]} lng={posicion[1]} />
      </MapContainer>
    </div>
  );
}