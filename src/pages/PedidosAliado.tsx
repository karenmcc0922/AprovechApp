import { useState, useEffect } from "react";
import AppNavbar from "../components/AppNavbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, User, Package } from "lucide-react";

export default function PedidosAliado() {
  const [pedidos, setPedidos] = useState<any[]>([]);

  useEffect(() => {
    const cargarPedidos = () => {
      const historial = JSON.parse(localStorage.getItem("historial_rescates") || "[]");
      setPedidos(historial);
    };

    cargarPedidos();

    // Sincronización: Detecta cambios desde otras pestañas
    window.addEventListener('storage', cargarPedidos);
    
    // Polling: Actualiza cada 2 segundos por si acaso
    const interval = setInterval(cargarPedidos, 2000);

    return () => {
      window.removeEventListener('storage', cargarPedidos);
      clearInterval(interval);
    };
  }, []);

  const marcarEntregado = (id: number) => {
    const actualizados = pedidos.map(p => 
      p.id === id ? { ...p, estado: "Completado" } : p
    );
    setPedidos(actualizados);
    localStorage.setItem("historial_rescates", JSON.stringify(actualizados));
  };

  const pedidosPendientes = pedidos.filter(p => p.estado === "Pendiente");

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNavbar />
      <main className="container mx-auto px-4 pt-28 pb-12 max-w-5xl">
        <div className="mb-10 text-center md:text-left">
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-4 py-1 mb-4 font-black">
            PANEL DE CONTROL ALIADO 🏪
          </Badge>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Pedidos por Entregar</h1>
          <p className="text-slate-500 font-medium">Valida los códigos QR de tus clientes aquí.</p>
        </div>

        {pedidosPendientes.length === 0 ? (
          <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-slate-300" />
            </div>
            <h2 className="text-xl font-bold text-slate-400">No hay pedidos pendientes por ahora.</h2>
          </div>
        ) : (
          <div className="grid gap-4">
            {pedidosPendientes.map((pedido) => (
              <Card key={pedido.id} className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white hover:shadow-md transition-all">
                <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                  
                  <div className="flex items-center gap-6 w-full">
                    <div className="h-16 w-16 bg-green-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-green-100">
                      <User className="text-white w-8 h-8" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Código: #{String(pedido.id).slice(-4)}</span>
                        <Badge variant="outline" className="text-[10px] border-slate-200 text-slate-400 font-bold uppercase">Pendiente</Badge>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 uppercase">{pedido.producto}</h3>
                      <p className="text-slate-500 font-bold text-sm">Rescatista: <span className="text-slate-900">Juan Pérez (Simulado)</span></p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full md:w-auto gap-8 border-t md:border-t-0 pt-4 md:pt-0 border-slate-50">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cobrar en local</p>
                      <p className="text-2xl font-black text-slate-900">${pedido.precio.toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => marcarEntregado(pedido.id)}
                        className="bg-slate-900 hover:bg-green-600 text-white rounded-2xl h-14 px-8 font-black transition-all group"
                      >
                        <Check className="mr-2 w-5 h-5 group-hover:scale-125 transition-transform" />
                        ENTREGAR
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}