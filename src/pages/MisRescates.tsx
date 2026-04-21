import { useState, useEffect } from "react";
import AppNavbar from "../components/AppNavbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  QrCode, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  ShoppingBag,
  History,
  ArrowRight,
  Ticket,
  Loader2
} from "lucide-react";

export default function MisRescates() {
  const [rescates, setRescates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pendientes" | "completados">("pendientes");

  const fetchRescates = async () => {
    const stored = localStorage.getItem("usuario");
    if (!stored) {
      setLoading(false);
      return;
    }
    
    const user = JSON.parse(stored);

    try {
      const response = await fetch(`https://aprovechapp-api.onrender.com/api/pedidos/usuario/${user.id}`);
      const data = await response.json();
      
      if (response.ok) {
        const datosFormateados = data.map((r: any) => ({
          ...r,
          estado: r.estado || "Pendiente"
        }));
        setRescates(datosFormateados);
      }
    } catch (error) {
      console.error("Error cargando rescates:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRescates();
  }, []);

  // FUNCIÓN CRÍTICA: Actualiza la DB y el estado local
  const completarRecogidaLocal = async (id: number) => {
    try {
      const response = await fetch(`https://aprovechapp-api.onrender.com/api/pedidos/${id}/estado`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: 'Completado' }),
      });

      if (response.ok) {
        // Actualización optimista en la interfaz
        setRescates(prev => 
          prev.map(r => r.id === id ? { ...r, estado: "Completado" } : r)
        );
      } else {
        console.error("Error al actualizar en el servidor");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
    }
  };

  const pendientes = rescates.filter(r => r.estado === "Pendiente");
  const completados = rescates.filter(r => r.estado === "Completado");

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AppNavbar />
      
      <main className="container mx-auto px-6 pt-32 pb-20 max-w-4xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-1 bg-green-500 rounded-full" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tu impacto positivo</p>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
              Mis <span className="text-green-600">Rescates</span>
            </h1>
          </div>
          
          <div className="flex bg-slate-200/50 p-1.5 rounded-[24px] backdrop-blur-sm">
            <button 
              onClick={() => setFilter("pendientes")}
              className={`px-8 py-3 rounded-[20px] text-[11px] font-black uppercase tracking-widest transition-all ${
                filter === "pendientes" 
                ? "bg-white text-slate-900 shadow-xl scale-105" 
                : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Activos ({pendientes.length})
            </button>
            <button 
              onClick={() => setFilter("completados")}
              className={`px-8 py-3 rounded-[20px] text-[11px] font-black uppercase tracking-widest transition-all ${
                filter === "completados" 
                ? "bg-white text-slate-900 shadow-xl scale-105" 
                : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Historial ({completados.length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sincronizando con la red...</p>
          </div>
        ) : filter === "pendientes" ? (
          <div className="space-y-8">
            {pendientes.length > 0 ? (
              pendientes.map((rescate) => (
                <Card key={rescate.id} className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[45px] overflow-hidden bg-white">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Sección Ticket / QR */}
                      <div className="bg-slate-900 p-10 flex flex-col items-center justify-center text-white md:w-80 relative">
                        <div className="absolute top-0 bottom-0 -right-3 hidden md:flex flex-col justify-around py-4">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="w-6 h-6 rounded-full bg-[#F8FAFC]" />
                            ))}
                        </div>

                        <div className="bg-white p-5 rounded-[35px] mb-6 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
                          <QrCode className="w-36 h-36 text-slate-900" />
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">CÓDIGO DE RESCATE</p>
                          <p className="font-mono text-2xl font-black tracking-widest text-green-400 uppercase">
                            {rescate.codigo_qr}
                          </p>
                        </div>
                      </div>

                      <div className="p-10 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-6">
                            <div>
                              <Badge className="bg-green-100 text-green-700 border-none px-3 py-1 text-[10px] font-black uppercase tracking-wider mb-3">
                                LISTO PARA ENTREGA
                              </Badge>
                              <h3 className="text-3xl font-black text-slate-900 leading-tight tracking-tighter uppercase italic">
                                {rescate.nombre_producto || rescate.producto}
                              </h3>
                              <p className="text-blue-600 font-bold text-sm mt-1 flex items-center gap-1">
                                <Ticket className="w-4 h-4" /> {rescate.nombre_aliado || rescate.local}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-3xl font-black text-slate-900 tracking-tighter">
                                ${Number(rescate.precio_final || rescate.precio).toLocaleString()}
                              </p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">PAGADO</p>
                            </div>
                          </div>
                          
                          <div className="space-y-4 py-6 border-y border-slate-50">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-slate-400" />
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase">Punto de recogida</p>
                                <p className="text-sm font-bold text-slate-700">{rescate.direccion_aliado || rescate.direccion}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-slate-400" />
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase">Horario límite</p>
                                <p className="text-sm font-bold text-slate-700">Hoy antes del cierre del local</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Button 
                          onClick={() => completarRecogidaLocal(rescate.id)}
                          className="w-full mt-8 bg-green-600 hover:bg-slate-900 text-white rounded-[25px] py-8 font-black text-xs uppercase tracking-widest shadow-xl shadow-green-100 transition-all hover:scale-[1.02] active:scale-95"
                        >
                          Confirmar que ya lo tengo ✅
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <EmptyState icon={<ShoppingBag />} message="No tienes rescates activos en este momento." />
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {completados.length > 0 ? (
              completados.map((rescate) => (
                <Card key={rescate.id} className="border-none shadow-sm rounded-[35px] bg-white p-8 hover:shadow-xl transition-all group border border-transparent hover:border-slate-100">
                  <div className="flex justify-between items-center mb-6">
                    <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">RESCATADO</span>
                  </div>
                  <h4 className="font-black text-slate-900 uppercase text-lg tracking-tighter italic mb-1">
                    {rescate.nombre_producto || rescate.producto}
                  </h4>
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-6">
                    {rescate.nombre_aliado || rescate.local}
                  </p>
                  
                  <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Valor</p>
                      <span className="font-black text-slate-900 text-xl">
                        ${Number(rescate.precio_final || rescate.precio).toLocaleString()}
                      </span>
                    </div>
                    <Badge className="bg-slate-100 text-slate-500 border-none font-black text-[9px] px-3 py-1 uppercase">Historial</Badge>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full">
                <EmptyState icon={<History />} message="Aún no tienes un historial de rescates." />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function EmptyState({ icon, message }: { icon: React.ReactNode, message: string }) {
  return (
    <div className="text-center py-24 bg-white rounded-[50px] border-4 border-dashed border-slate-50">
      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 shadow-inner">
        {icon}
      </div>
      <p className="text-slate-400 font-black uppercase tracking-widest text-xs mb-6 px-10 leading-relaxed">{message}</p>
      <Button 
        onClick={() => window.location.href='/catalog'}
        className="bg-slate-900 hover:bg-green-600 text-white rounded-full px-10 py-6 font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-3 mx-auto"
      >
        Ir al catálogo <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}