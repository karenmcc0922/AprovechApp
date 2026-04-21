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
  Phone,
  CheckCircle2
} from "lucide-react";

export default function PedidosAliado() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Obtenemos el usuario del aliado
  const stored = localStorage.getItem("usuario");
  const user = stored ? JSON.parse(stored) : null;

  const fetchPedidos = async (showLoader = false) => {
    if (!user?.id) return;
    if (showLoader) setLoading(true);
    setIsRefreshing(true);
    
    try {
      // Usamos la nueva ruta que creamos en el backend
      const res = await fetch(`https://aprovechapp-api.onrender.com/api/pedidos/aliado/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setPedidos(data);
      }
    } catch (error) {
      console.error("Error cargando pedidos del aliado:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPedidos(true);
    const interval = setInterval(() => fetchPedidos(false), 20000); // Cada 20 seg
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AppNavbar />
      
      <div className="container mx-auto px-6 pt-32 pb-20 max-w-5xl">
        
        {/* Header con Stats */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75`}></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Panel de Gestión Aliado</p>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
              Pedidos <span className="text-green-600">Recibidos</span>
            </h1>
          </div>

          <div className="flex gap-4">
            <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pendientes</p>
              <p className="text-xl font-black text-slate-900">
                {pedidos.filter(p => p.estado === 'Pendiente').length}
              </p>
            </div>
            <button 
              onClick={() => fetchPedidos(true)}
              className="bg-slate-900 hover:bg-green-600 text-white p-4 rounded-2xl shadow-xl transition-all"
            >
              <RefreshCcw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-green-600 w-12 h-12 mb-4" />
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Cargando rescates...</p>
          </div>
        ) : pedidos.length === 0 ? (
          <div className="bg-white p-20 rounded-[50px] text-center border-4 border-dashed border-slate-50">
            <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-black text-slate-900 uppercase italic">Aún no hay ventas</h3>
            <p className="text-slate-400 font-bold text-xs uppercase mt-2">Los pedidos de los clientes aparecerán aquí</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {pedidos.map((pedido) => (
              <div 
                key={pedido.id} 
                className="bg-white p-8 rounded-[40px] shadow-[0_15px_40px_rgba(0,0,0,0.02)] border border-slate-50 hover:border-green-200 transition-all flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 group"
              >
                {/* Info Cliente */}
                <div className="flex gap-6 items-center flex-1">
                  <div className="bg-slate-50 p-6 rounded-[30px] group-hover:bg-green-50 transition-colors">
                    <ShoppingBag className="text-slate-400 group-hover:text-green-600 w-8 h-8" />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`border-none font-black text-[9px] uppercase px-2 py-0.5 ${
                        pedido.estado === 'Pendiente' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {pedido.estado}
                      </Badge>
                      <span className="text-[10px] font-bold text-slate-300 uppercase flex items-center gap-1">
                        <Clock className="w-3 h-3" /> ID: #{pedido.id}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-none mb-3">
                      {pedido.nombre_producto}
                    </h3>
                    
                    {/* Datos del Usuario */}
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                        <User className="w-3 h-3 text-slate-400" />
                        <span className="text-xs font-bold text-slate-600">{pedido.nombre_usuario}</span>
                      </div>
                      {pedido.usuario_telefono && (
                        <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                          <Phone className="w-3 h-3 text-green-600" />
                          <span className="text-xs font-bold text-green-700">{pedido.usuario_telefono}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Acciones y Código */}
                <div className="flex flex-wrap lg:flex-nowrap items-center gap-6 w-full lg:w-auto pt-6 lg:pt-0 border-t lg:border-t-0 border-slate-50">
                  <div className="text-left lg:text-right">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Cobrar en local</p>
                    <span className="font-black text-2xl text-slate-900 tracking-tighter">
                      ${Number(pedido.precio_final).toLocaleString()}
                    </span>
                  </div>

                  <div className="bg-slate-900 text-white px-6 py-4 rounded-3xl shadow-xl flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">Validar Código</span>
                      <span className="font-mono text-xl font-black text-green-400 tracking-widest">
                        {pedido.codigo_qr}
                      </span>
                    </div>
                    <Ticket className="w-6 h-6 text-slate-600" />
                  </div>
                  
                  {/* Botón de acción rápida si está pendiente */}
                  {pedido.estado === 'Pendiente' && (
                    <button className="w-12 h-12 bg-green-600 text-white rounded-2xl flex items-center justify-center hover:bg-slate-900 transition-all shadow-lg shadow-green-100">
                      <CheckCircle2 className="w-6 h-6" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}