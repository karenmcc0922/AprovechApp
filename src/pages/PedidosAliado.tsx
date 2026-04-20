import { useState, useEffect } from "react";
import AppNavbar from "../components/AppNavbar";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShoppingBag, User, Ticket } from "lucide-react";

export default function PedidosAliado() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("usuario") || "{}");

  const fetchPedidos = async () => {
    try {
      const res = await fetch(`https://aprovechapp-api.onrender.com/api/pedidos/aliado/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setPedidos(data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
    const interval = setInterval(fetchPedidos, 10000); // Auto-refresh cada 10 seg
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNavbar />
      <div className="container mx-auto px-4 py-24">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900">Pedidos Recibidos 🏪</h1>
          <p className="text-slate-500">Gestiona las reservas de tus clientes</p>
        </div>

        {loading ? (
          <div className="flex justify-center"><Loader2 className="animate-spin text-green-600" /></div>
        ) : pedidos.length === 0 ? (
          <div className="bg-white p-12 rounded-[32px] text-center border-2 border-dashed">
            <p className="text-slate-400 font-bold">Aún no tienes pedidos hoy.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {pedidos.map((pedido) => (
              <div key={pedido.id} className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex gap-4 items-center">
                  <div className="bg-green-100 p-3 rounded-2xl">
                    <ShoppingBag className="text-green-600 w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 uppercase">{pedido.nombre_producto}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500 font-bold">
                      <User className="w-3 h-3" /> {pedido.nombre_usuario}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl font-mono text-sm">
                    <Ticket className="w-4 h-4" /> {pedido.codigo_qr}
                  </div>
                  <Badge className={pedido.estado === 'Pendiente' ? "bg-orange-500" : "bg-green-600"}>
                    {pedido.estado}
                  </Badge>
                  <span className="font-black text-lg text-slate-900">${pedido.precio_final.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}