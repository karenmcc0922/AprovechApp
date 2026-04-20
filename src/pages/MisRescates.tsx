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
  History
} from "lucide-react";

export default function MisRescates() {
  const [rescates, setRescates] = useState<any[]>([]);
  const [filter, setFilter] = useState<"pendientes" | "completados">("pendientes");

  useEffect(() => {
    const guardados = JSON.parse(localStorage.getItem("historial_rescates") || "[]");
    setRescates(guardados);
  }, []);

  // Función para simular que el usuario ya recogió el producto
  const completarRecogida = (id: number) => {
    const actualizados = rescates.map(r => 
      r.id === id ? { ...r, estado: "Completado" } : r
    );
    setRescates(actualizados);
    localStorage.setItem("historial_rescates", JSON.stringify(actualizados));
  };

  const pendientes = rescates.filter(r => r.estado === "Pendiente");
  const completados = rescates.filter(r => r.estado === "Completado");

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNavbar />
      
      <main className="container mx-auto px-4 pt-28 pb-12 max-w-4xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Mis Compras 🛍️</h1>
            <p className="text-slate-500 font-medium mt-1">Gestiona tus rescates y códigos de recogida.</p>
          </div>
          
          <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
            <button 
              onClick={() => setFilter("pendientes")}
              className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${filter === "pendientes" ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"}`}
            >
              Activos ({pendientes.length})
            </button>
            <button 
              onClick={() => setFilter("completados")}
              className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${filter === "completados" ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"}`}
            >
              Historial
            </button>
          </div>
        </div>

        {filter === "pendientes" ? (
          <div className="space-y-6">
            {pendientes.length > 0 ? (
              pendientes.map((rescate) => (
                <Card key={rescate.id} className="border-none shadow-xl rounded-[40px] overflow-hidden bg-white">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="bg-slate-900 p-10 flex flex-col items-center justify-center text-white md:w-72">
                        <div className="bg-white p-4 rounded-[32px] mb-4 shadow-2xl">
                          <QrCode className="w-32 h-32 text-slate-900" />
                        </div>
                        <p className="font-mono font-bold tracking-[0.3em] text-lg uppercase">
                          #{String(rescate.id).slice(-4)}
                        </p>
                        <Badge className="mt-4 bg-green-500/20 text-green-400 border-none px-4 py-1 font-black">
                          LISTO PARA RECOGER
                        </Badge>
                      </div>

                      <div className="p-8 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="text-green-600 font-black text-xs uppercase tracking-widest mb-1">{rescate.local}</p>
                              <h3 className="text-2xl font-black text-slate-900">{rescate.producto}</h3>
                            </div>
                            <p className="text-2xl font-black text-slate-900">${rescate.precio.toLocaleString()}</p>
                          </div>
                          
                          <div className="space-y-3 mb-8">
                            <div className="flex items-center gap-3 text-slate-500 font-medium">
                              <MapPin className="w-5 h-5 text-slate-300" />
                              <span className="text-sm">{rescate.direccion || "Pereira, Risaralda"}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-500 font-medium">
                              <Clock className="w-5 h-5 text-slate-300" />
                              <span className="text-sm">Recoger antes de las 8:00 PM</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button 
                            onClick={() => completarRecogida(rescate.id)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-2xl py-6 font-black shadow-lg shadow-green-100"
                          >
                            MARCAR RECOGIDO ✅
                          </Button>
                        </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completados.length > 0 ? (
              completados.map((rescate) => (
                <Card key={rescate.id} className="border-none shadow-sm rounded-[32px] bg-white p-6 hover:shadow-md transition-all border border-slate-50">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-slate-50 p-3 rounded-2xl">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                    <Badge variant="outline" className="text-slate-400 border-slate-100 font-bold">
                      {rescate.fecha}
                    </Badge>
                  </div>
                  <h4 className="font-black text-slate-800 uppercase text-sm mb-1">{rescate.producto}</h4>
                  <p className="text-xs font-bold text-slate-400 mb-4">{rescate.local}</p>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                    <span className="font-black text-slate-900">${rescate.precio.toLocaleString()}</span>
                    <Badge className="bg-slate-100 text-slate-500 border-none font-bold">ENTREGADO</Badge>
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
    <div className="text-center py-20 bg-white rounded-[48px] border-2 border-dashed border-slate-100">
      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
        {icon}
      </div>
      <p className="text-slate-500 font-bold">{message}</p>
      <Button variant="link" className="text-green-600 font-black mt-2" onClick={() => window.location.href='/catalog'}>
        Ir al catálogo ahora
      </Button>
    </div>
  );
}