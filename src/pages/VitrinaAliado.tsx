import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import AppNavbar from "../components/AppNavbar";
import { API_BASE } from "../lib/api";
import MapaAliado from "../components/MapaAliado"; // Importamos tu nuevo mapa interactivo
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, ShoppingBag, ArrowLeft, Loader2, Store, ExternalLink } from "lucide-react";

export default function VitrinaAliado() {
  // 1. Capturamos el ID del aliado desde la URL gracias a wouter
  const [, params] = useRoute("/aliado-publico/:id");
  const aliadoId = params?.id;
  const [, setLocation] = useLocation();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ aliado: any; productos: any[] } | null>(null);

  useEffect(() => {
    const cargarVitrina = async () => {
      try {
        // 2. Llamamos al backend para traer la info de este comercio específico y sus productos activos
        const res = await fetch(`${API_BASE}/api/aliados/${aliadoId}/perfil`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (error) {
        console.error("Error al cargar la vitrina del aliado:", error);
      } finally {
        setLoading(false);
      }
    };
    if (aliadoId) cargarVitrina();
  }, [aliadoId]);

  // Corregido el template string que apuntaba a una URL rota
  const abrirEnMaps = (direccion: string) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`, "_blank");
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#F8FAFC]">
      <Loader2 className="animate-spin text-green-600 w-10 h-10" />
    </div>
  );

  if (!data) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#F8FAFC] gap-4">
      <p className="font-black text-slate-700 uppercase">No se encontró el comercio.</p>
      <Button onClick={() => setLocation("/catalog")} className="bg-slate-900 text-white rounded-xl">Volver al catálogo</Button>
    </div>
  );

  const { aliado, productos } = data;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AppNavbar />
      
      {/* HEADER DE LA VITRINA */}
      <div className="bg-slate-900 pt-32 pb-16 px-6 text-white relative">
        <div className="container mx-auto max-w-6xl">
          <button onClick={() => setLocation("/catalog")} className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 hover:text-green-400 mb-6 transition-colors">
            <ArrowLeft size={14} /> Volver al catálogo
          </button>
          
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white">
            {aliado.nombre_local || "Comercio Aliado"}
          </h1>
          
          <button 
            onClick={() => abrirEnMaps(aliado.direccion)}
            className="flex items-center gap-2 text-slate-300 font-bold text-sm mt-3 hover:text-green-400 transition-colors text-left"
          >
            <MapPin size={16} className="text-green-500 flex-shrink-0" />
            <span>{aliado.direccion || "Dirección no disponible"}</span>
            <ExternalLink size={12} className="opacity-60" />
          </button>
        </div>
      </div>

      {/* CUERPO DE LA VITRINA EN REJILLA */}
      <main className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* COLUMNA IZQUIERDA: INTEGRACIÓN DEL MAPA EN VIVO (RF-11) */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-none shadow-sm rounded-[30px] p-6 bg-white space-y-4">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-1">
                  Ubicación de Rescate
                </h3>
                <p className="text-[11px] text-slate-400 font-bold leading-tight">
                  Visualiza aquí el punto de recogida exacto para este comercio aliado.
                </p>
              </div>

              {/* Llamado al nuevo componente Leaflet pasando las coordenadas dinámicas */}
              <MapaAliado
                lat={aliado.latitud ? Number(aliado.latitud) : 4.8133}
                lng={aliado.longitud ? Number(aliado.longitud) : -75.6961}
                nombreLocal={aliado.nombre_local || "Comercio Aliado"}
                direccion={aliado.direccion}
              />
              
              <div className="pt-2">
                <Button 
                  onClick={() => abrirEnMaps(aliado.direccion)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase py-3 flex items-center justify-center gap-2 border-none shadow-none transition-all"
                >
                  Abrir GPS externo <ExternalLink size={12} />
                </Button>
              </div>
            </Card>
          </div>

          {/* COLUMNA DERECHA: GRILLA DE PRODUCTOS DISPONIBLES */}
          <div className="lg:col-span-8 space-y-6">
            <h2 className="text-xl font-black text-slate-900 uppercase italic mb-4 flex items-center gap-2 px-1">
              <ShoppingBag className="text-green-600" /> Ofertas de hoy
            </h2>

            {productos && productos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {productos.map((prod) => (
                  <Card key={prod.id} className="border-none shadow-sm rounded-[30px] p-6 bg-white flex flex-col justify-between hover:shadow-md transition-all">
                    <div>
                      <div className="h-40 w-full rounded-[20px] bg-slate-100 overflow-hidden mb-4 relative">
                        <img 
                          src={prod.imagen_url || "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&q=80"} 
                          className="w-full h-full object-cover" 
                          alt={prod.nombre} 
                        />
                        {/* Indicador de porcentaje de ahorro si aplica */}
                        {prod.precio_original && prod.precio_rescate && prod.precio_original > prod.precio_rescate && (
                          <div className="absolute top-3 right-3 bg-green-600 text-white text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-xl shadow-sm italic">
                            -{Math.round(((prod.precio_original - prod.precio_rescate) / prod.precio_original) * 100)}% DTO
                          </div>
                        )}
                      </div>
                      <h4 className="font-black text-slate-800 text-lg uppercase tracking-tight leading-tight">{prod.nombre}</h4>
                      <p className="text-xs font-black text-amber-600 uppercase mt-1">Disponibles: {prod.stock} unidades</p>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
                      <div>
                        <span className="text-xs line-through text-slate-400 block">${Number(prod.precio_original).toLocaleString()}</span>
                        <span className="text-xl font-black text-slate-900">${Number(prod.precio_rescate).toLocaleString()}</span>
                      </div>
                      <Button 
                        onClick={() => setLocation("/catalog")} // Mantiene tu redirección al catálogo unificado
                        disabled={prod.stock <= 0}
                        className="bg-slate-900 hover:bg-green-600 text-white rounded-xl font-black text-xs uppercase px-4 py-2 shadow-sm transition-colors"
                      >
                        {prod.stock > 0 ? "Ver en catálogo" : "Agotado"}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-[30px] shadow-sm max-w-md mx-auto border border-dashed border-slate-200">
                <Store className="mx-auto text-slate-300 w-12 h-12 mb-2" />
                <p className="font-black text-slate-700 uppercase text-sm">¡Sin ofertas por ahora!</p>
                <p className="text-xs text-slate-400 font-medium mt-1">Este comercio vendió todo su inventario de rescate.</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}