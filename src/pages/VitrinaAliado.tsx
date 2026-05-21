import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import AppNavbar from "../components/AppNavbar";
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
        const res = await fetch(`https://aprovechapp-api.onrender.com/api/aliados/${aliadoId}/perfil`);
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
        <div className="container mx-auto max-w-5xl">
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

      {/* PRODUCTOS DISPONIBLES DE ESTE LOCAL */}
      <main className="container mx-auto px-6 py-12 max-w-5xl">
        <h2 className="text-xl font-black text-slate-900 uppercase italic mb-8 flex items-center gap-2">
          <ShoppingBag className="text-green-600" /> Ofertas de hoy
        </h2>

        {productos && productos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {productos.map((prod) => (
              <Card key={prod.id} className="border-none shadow-sm rounded-[30px] p-6 bg-white flex flex-col justify-between">
                <div>
                  <div className="h-40 w-full rounded-[20px] bg-slate-100 overflow-hidden mb-4">
                    <img 
                      src={prod.imagen_url || "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&q=80"} 
                      className="w-full h-full object-cover" 
                      alt={prod.nombre} 
                    />
                  </div>
                  <h4 className="font-black text-slate-800 text-lg uppercase tracking-tight">{prod.nombre}</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase mt-1">Disponibles: {prod.stock} u.</p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
                  <div>
                    <span className="text-xs line-through text-slate-400 block">${Number(prod.precio_original).toLocaleString()}</span>
                    <span className="text-xl font-black text-slate-900">${Number(prod.precio_rescate).toLocaleString()}</span>
                  </div>
                  <Button 
                    onClick={() => setLocation("/catalog")} // Te redirige al catálogo para que usen tu modal de rescate unificado si quieren comprar
                    className="bg-slate-900 hover:bg-green-600 text-white rounded-xl font-black text-xs uppercase px-4 py-2"
                  >
                    Ver en catálogo
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-[30px] shadow-sm max-w-md mx-auto">
            <Store className="mx-auto text-slate-300 w-12 h-12 mb-2" />
            <p className="font-black text-slate-700 uppercase text-sm">¡Sin ofertas por ahora!</p>
            <p className="text-xs text-slate-400 font-medium mt-1">Este comercio vendió todo su inventario de rescate.</p>
          </div>
        )}
      </main>
    </div>
  );
}