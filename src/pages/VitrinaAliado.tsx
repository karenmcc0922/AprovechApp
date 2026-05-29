import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import AppNavbar from "../components/AppNavbar";
import { API_BASE } from "../lib/api";
import MapaAliado from "../components/MapaAliado";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, ShoppingBag, ArrowLeft, Loader2, Store, ExternalLink } from "lucide-react";

export default function VitrinaAliado() {
  const [, params] = useRoute("/aliado-publico/:id");
  const aliadoId = params?.id;
  const [, setLocation] = useLocation();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ aliado: any; productos: any[] } | null>(null);

  useEffect(() => {
    const cargarVitrina = async () => {
      try {
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

  const abrirEnMaps = (direccion: string) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`, "_blank");
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white gap-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30 pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-green-600 w-12 h-12" />
        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] animate-pulse">Cargando vitrina de ofertas...</p>
      </div>
    </div>
  );

  if (!data) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white gap-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20 pointer-events-none" />
      <p className="font-black text-slate-700 uppercase relative z-10">No se encontró el comercio.</p>
      <Button onClick={() => setLocation("/catalog")} className="bg-slate-900 text-white rounded-xl relative z-10">Volver al catálogo</Button>
    </div>
  );

  const { aliado, productos } = data;

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      <AppNavbar />
      
      {/* REJILLA TECNOLÓGICA SUTIL */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

      {/* HALOS DE LUZ AMBIENTAL */}
      <div className="absolute top-[-5%] left-[-5%] w-[500px] h-[500px] rounded-full bg-emerald-100/30 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-5%] w-[450px] h-[450px] rounded-full bg-blue-100/20 blur-[130px] pointer-events-none" />

      {/* HEADER DE LA VITRINA */}
      <div className="bg-slate-950 pt-36 pb-20 px-6 text-white relative shadow-lg shadow-slate-950/20 rounded-b-[40px] sm:rounded-b-[60px] overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[size:1.5rem_1.5rem]" />
        <div className="container mx-auto max-w-6xl relative z-10">
          <button 
            onClick={() => setLocation("/catalog")} 
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-green-400 mb-6 transition-colors group"
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" /> Volver al catálogo
          </button>
          
          <h1 className="text-4xl sm:text-5xl font-black uppercase italic tracking-tighter text-white">
            {aliado.nombre_local || "Comercio Aliado"}
          </h1>
          
          <button 
            onClick={() => abrirEnMaps(aliado.direccion)}
            className="flex items-center gap-2 text-slate-300 font-bold text-sm mt-4 hover:text-green-400 transition-colors text-left group bg-white/5 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/5 w-fit"
          >
            <MapPin size={16} className="text-green-500 flex-shrink-0" />
            <span className="truncate max-w-xs sm:max-w-md">{aliado.direccion || "Dirección no disponible"}</span>
            <ExternalLink size={12} className="opacity-40 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>

      {/* CUERPO DE LA VITRINA EN REJILLA */}
      <main className="flex-grow container mx-auto px-6 py-16 max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* COLUMNA IZQUIERDA: INTEGRACIÓN DEL MAPA EN VIVO */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border border-slate-100/80 shadow-[0_15px_50px_rgba(0,0,0,0.02)] rounded-[35px] p-6 bg-white/90 backdrop-blur-md space-y-5">
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Ubicación de Rescate
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Visualiza aquí el punto de recogida exacto para este comercio aliado.
                </p>
              </div>

              {/* Contenedor del componente del mapa */}
              <div className="rounded-[24px] overflow-hidden shadow-inner border border-slate-100">
                <MapaAliado
                  lat={aliado.latitud ? Number(aliado.latitud) : 4.8133}
                  lng={aliado.longitud ? Number(aliado.longitud) : -75.6961}
                  nombreLocal={aliado.nombre_local || "Comercio Aliado"}
                  direccion={aliado.direccion}
                />
              </div>
              
              <div className="pt-2">
                <Button 
                  onClick={() => abrirEnMaps(aliado.direccion)}
                  className="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-[18px] font-black text-[10px] uppercase tracking-wider py-6 flex items-center justify-center gap-2 border border-slate-100 shadow-none transition-all active:scale-[0.98]"
                >
                  Abrir GPS externo <ExternalLink size={12} className="text-slate-400" />
                </Button>
              </div>
            </Card>
          </div>

          {/* COLUMNA DERECHA: GRILLA DE PRODUCTOS DISPONIBLES */}
          <div className="lg:col-span-8 space-y-6">
            <h2 className="text-2xl font-black text-slate-900 uppercase italic mb-6 flex items-center gap-2.5 px-1 tracking-tighter">
              <ShoppingBag className="text-green-600 w-6 h-6" /> Ofertas de hoy
            </h2>

            {productos && productos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {productos.map((prod) => (
                  <Card key={prod.id} className="border border-slate-100/80 shadow-[0_15px_45px_rgba(0,0,0,0.02)] rounded-[32px] p-6 bg-white flex flex-col justify-between hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all group">
                    <div>
                      <div className="h-44 w-full rounded-[22px] bg-slate-50 overflow-hidden mb-5 relative">
                        <img 
                          src={prod.imagen_url || "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&q=80"} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                          alt={prod.nombre} 
                        />
                        {/* Indicador de porcentaje de ahorro */}
                        {prod.precio_original && prod.precio_rescate && prod.precio_original > prod.precio_rescate && (
                          <div className="absolute top-3 right-3 bg-green-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg shadow-green-500/20 italic">
                            -{Math.round(((prod.precio_original - prod.precio_rescate) / prod.precio_original) * 100)}% DTO
                          </div>
                        )}
                      </div>
                      <h4 className="font-black text-slate-900 text-xl uppercase tracking-tight leading-none mb-2">{prod.nombre}</h4>
                      <span className="inline-flex bg-amber-50 text-amber-700 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider">
                        Disponibles: {prod.stock} u.
                      </span>
                    </div>
                    
                    <div className="mt-8 pt-5 border-t border-slate-100 flex justify-between items-center">
                      <div>
                        <span className="text-xs line-through text-slate-400 block font-semibold">${Number(prod.precio_original).toLocaleString()}</span>
                        <span className="text-2xl font-black text-slate-900 tracking-tight">${Number(prod.precio_rescate).toLocaleString()}</span>
                      </div>
                      <Button 
                        onClick={() => setLocation("/catalog")}
                        disabled={prod.stock <= 0}
                        className="bg-slate-900 hover:bg-green-600 text-white rounded-[18px] font-black text-[10px] uppercase tracking-widest px-5 py-5 h-auto shadow-md transition-all active:scale-95"
                      >
                        {prod.stock > 0 ? "Ver en catálogo" : "Agotado"}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white/80 backdrop-blur-md rounded-[40px] shadow-sm max-w-md mx-auto border border-dashed border-slate-200 p-8">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Store className="text-slate-400 w-6 h-6" />
                </div>
                <p className="font-black text-slate-800 uppercase text-sm tracking-tight">¡Sin ofertas por ahora!</p>
                <p className="text-xs text-slate-400 font-medium mt-1.5 leading-relaxed">
                  Este comercio ha vendido todo su inventario de rescate programado para hoy.
                </p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}