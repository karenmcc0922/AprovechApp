import { useState, useEffect } from "react";
import AppNavbar from "../components/AppNavbar";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  ShoppingBag, 
  User, 
  Ticket, 
  RefreshCcw, 
  Clock,
  ChevronRight
} from "lucide-react";

export default function PedidosAliado() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const user = JSON.parse(localStorage.getItem("usuario") || "{}");

  const fetchPedidos = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    setIsRefreshing(true);
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
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPedidos(true);
    const interval = setInterval(() => fetchPedidos(false), 15000); // Auto-refresh cada 15 seg
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AppNavbar />
      
      <div className="container mx-auto px-6 pt-32 pb-20 max-w-5xl">
        
        {/* Header de Gestión */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 ${isRefreshing ? 'block' : 'hidden'}`}></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Panel de Control en Vivo</p>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
              Pedidos <span className="text-green-600">Recibidos</span>
            </h1>
          </div>

          <div className="flex gap-4">
            <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 hidden sm:block">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Hoy</p>
              <p className="text-xl font-black text-slate-900">{pedidos.length} Rescates</p>
            </div>
            <button 
              onClick={() => fetchPedidos(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-2xl shadow-xl transition-all active:scale-95"
            >
              <RefreshCcw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-green-600 w-12 h-12 mb-4" />
            <p className="text-slate-400 font-bold animate-pulse">Sincronizando pedidos...</p>
          </div>
        ) : pedidos.length === 0 ? (
          <div className="bg-white p-20 rounded-[50px] text-center border-4 border-dashed border-slate-50">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase italic">Sin pedidos activos</h3>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">Los rescates que publiquen aparecerán aquí</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {pedidos.map((pedido) => (
              <div 
                key={pedido.id} 
                className="bg-white p-8 rounded-[40px] shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-transparent hover:border-green-100 transition-all flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 group"
              >
                {/* Info Cliente y Producto */}
                <div className="flex gap-6 items-center flex-1">
                  <div className="relative">
                    <div className="bg-slate-900 p-5 rounded-[28px] group-hover:bg-green-600 transition-colors">
                      <ShoppingBag className="text-white w-8 h-8" />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-4 border-white">
                      1
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[9px] uppercase px-2 py-0">
                        {pedido.id % 2 === 0 ? 'Rescate Express' : 'Rescate Estándar'}
                      </Badge>
                      <span className="text-[10px] font-bold text-slate-300 uppercase flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Hace 5 min
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-none mb-2 group-hover:text-green-600 transition-colors">
                      {pedido.nombre_producto}
                    </h3>
                    <div className="flex items-center gap-2 bg-slate-50 w-fit px-3 py-1.5 rounded-full">
                      <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                        <User className="w-3 h-3 text-slate-500" />
                      </div>
                      <span className="text-xs font-bold text-slate-600">{pedido.nombre_usuario}</span>
                    </div>
                  </div>
                </div>

                {/* Status y Código (Lado Derecho) */}
                <div className="flex flex-wrap lg:flex-nowrap items-center gap-6 w-full lg:w-auto pt-6 lg:pt-0 border-t lg:border-t-0 border-slate-50">
                  
                  <div className="flex flex-col items-start lg:items-end flex-1 lg:flex-none">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 text-right">Monto a recibir</p>
                    <span className="font-black text-2xl text-slate-900 tracking-tighter">
                      ${pedido.precio_final.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-xl shadow-slate-200 group-hover:shadow-green-100 transition-all">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Código de Entrega</span>
                        <span className="font-mono text-lg font-black tracking-[0.2em] text-green-400 uppercase">
                          {pedido.codigo_qr}
                        </span>
                      </div>
                      <Ticket className="w-6 h-6 text-slate-700" />
                    </div>
                    
                    <Badge className={`justify-center py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-none ${
                      pedido.estado === 'Pendiente' 
                      ? "bg-orange-100 text-orange-600" 
                      : "bg-green-100 text-green-600"
                    }`}>
                      {pedido.estado}
                    </Badge>
                  </div>

                  <button className="hidden lg:flex w-12 h-12 bg-slate-50 rounded-2xl items-center justify-center text-slate-300 hover:text-green-600 hover:bg-green-50 transition-all">
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}