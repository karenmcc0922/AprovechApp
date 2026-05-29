import { useState, useEffect } from "react";
import AppNavbar from "../components/AppNavbar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ShoppingBag,
  User,
  Ticket,
  RefreshCcw,
  Clock,
  ChevronRight,
  Search,
  CheckCircle2,
  Check,
  Truck
} from "lucide-react";
import { toast } from "sonner";
import { API_BASE } from "../lib/api";

export default function PedidosAliado() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [codigoBusqueda, setCodigoBusqueda] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [pedidoEncontrado, setPedidoEncontrado] = useState<any>(null);

  const user = JSON.parse(localStorage.getItem("usuario") || "{}");

  const fetchPedidos = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    setIsRefreshing(true);
    try {
      const res = await fetch(`${API_BASE}/api/pedidos/aliado/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setPedidos(data);
      }
    } catch (error) {
      console.error("Error cargando pedidos:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPedidos(true);
    const interval = setInterval(() => fetchPedidos(false), 15000);
    return () => clearInterval(interval);
  }, []);

  const buscarPedidoPorCodigo = async () => {
    if (!codigoBusqueda.trim()) return;
    setBuscando(true);
    setPedidoEncontrado(null);
    try {
      const res = await fetch(`${API_BASE}/api/pedidos/validar/${codigoBusqueda.trim().toUpperCase()}/${user.id}`);
      if (res.ok) {
        setPedidoEncontrado(await res.json());
      } else {
        toast.error("Código no encontrado o no pertenece a este local");
      }
    } catch {
      toast.error("Error en la búsqueda. Revisa tu conexión.");
    } finally {
      setBuscando(false);
    }
  };

  const ejecutarEntregaFinal = async (pedidoId: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/pedidos/${pedidoId}/entregar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        toast.success("¡Rescate entregado con éxito!");
        setPedidoEncontrado(null);
        setCodigoBusqueda("");
        fetchPedidos(false);
      } else {
        toast.error("No se pudo actualizar el estado en el servidor");
      }
    } catch {
      toast.error("Error al confirmar la entrega");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AppNavbar />

      <div className="container mx-auto px-6 pt-32 pb-20 max-w-5xl">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
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
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</p>
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

        {/* CHECKPOINT QR */}
        <div className="mb-12">
          <div className="bg-slate-900 rounded-[35px] p-8 shadow-2xl shadow-slate-200 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <h3 className="text-white font-black text-xl uppercase italic tracking-tighter mb-1">Checkpoint de Rescate</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Valida el código de entrega aquí</p>
              </div>

              <div className="flex gap-2 w-full md:w-auto max-w-md">
                <div className="relative flex-1">
                  <Input
                    placeholder="Código de rescate..."
                    className="h-14 rounded-2xl border-none bg-white/10 text-white placeholder:text-slate-500 font-black pl-12 uppercase tracking-wider"
                    value={codigoBusqueda}
                    onChange={(e) => setCodigoBusqueda(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && buscarPedidoPorCodigo()}
                  />
                  <Ticket className="absolute left-4 top-4 text-slate-500 w-6 h-6" />
                </div>
                <Button
                  onClick={buscarPedidoPorCodigo}
                  disabled={buscando}
                  className="h-14 px-8 rounded-2xl bg-green-600 hover:bg-green-500 text-white font-black uppercase text-xs"
                >
                  {buscando ? <Loader2 className="animate-spin" /> : <Search />}
                </Button>
              </div>
            </div>

            {pedidoEncontrado && (
              <div className="mt-8 p-6 bg-white rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 animate-in zoom-in duration-300">
                <div className="flex items-center gap-5">
                  <div className="bg-green-100 p-4 rounded-2xl">
                    <CheckCircle2 className="text-green-600 w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-[10px] font-black text-slate-400 uppercase">Cliente: {pedidoEncontrado.nombre_usuario}</p>
                      <span className="bg-slate-100 text-slate-700 font-mono text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                        Cód: {pedidoEncontrado.codigo || `##${pedidoEncontrado.id}`}
                      </span>
                    </div>
                    <h4 className="text-lg font-black text-slate-900 uppercase italic">{pedidoEncontrado.nombre_producto}</h4>
                    {pedidoEncontrado.tipo_entrega === 'domicilio' && (
                      <span className="flex items-center gap-1 text-[9px] font-black text-blue-600 uppercase mt-1">
                        <Truck size={10} /> Domicilio — será recogido por repartidor
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setPedidoEncontrado(null)}
                    className="text-slate-400 hover:text-red-500 font-black text-[10px] uppercase tracking-widest"
                  >
                    Cancelar
                  </button>
                  {pedidoEncontrado.tipo_entrega !== 'domicilio' &&
                   pedidoEncontrado.estado?.toLowerCase() !== 'entregado' &&
                   pedidoEncontrado.estado?.toLowerCase() !== 'completado' ? (
                    <Button
                      onClick={() => ejecutarEntregaFinal(pedidoEncontrado.id)}
                      className="bg-slate-900 text-white hover:bg-green-600 rounded-2xl px-10 font-black uppercase text-xs h-12"
                    >
                      Confirmar Entrega
                    </Button>
                  ) : (
                    <Badge className="bg-slate-100 text-slate-400 py-3 px-6 rounded-xl font-black border-none">
                      {pedidoEncontrado.tipo_entrega === 'domicilio' ? 'DOMICILIO — REPARTIDOR' : 'YA ENTREGADO'}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* LISTADO */}
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
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-2 px-4">Historial de Hoy</h2>
            {pedidos.map((pedido) => {
              const estadoNorm = pedido.estado ? String(pedido.estado).toLowerCase() : 'pendiente';
              const esEntregado = estadoNorm === 'entregado' || estadoNorm === 'completado' || estadoNorm === 'en_camino';
              const esDomicilio = pedido.tipo_entrega === 'domicilio';

              return (
                <div
                  key={pedido.id}
                  className="bg-white p-8 rounded-[40px] shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-transparent hover:border-green-100 transition-all flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 group"
                >
                  <div className="flex gap-6 items-center flex-1">
                    <div className="relative">
                      <div className={`p-5 rounded-[28px] text-white transition-colors ${esEntregado ? 'bg-slate-200 text-slate-400' : esDomicilio ? 'bg-blue-600 group-hover:bg-blue-500' : 'bg-slate-900 group-hover:bg-green-600'}`}>
                        {esDomicilio ? <Truck className="w-8 h-8" /> : <ShoppingBag className="w-8 h-8" />}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`border-none font-black text-[9px] uppercase px-2 py-0 ${esEntregado ? 'bg-slate-100 text-slate-400' : esDomicilio ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                          {esDomicilio ? 'Domicilio' : 'Retiro en local'}
                        </Badge>
                        <span className="text-[10px] font-bold text-slate-300 uppercase flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {pedido.fecha ? new Date(pedido.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "En proceso"}
                        </span>
                      </div>
                      <h3 className={`text-2xl font-black uppercase italic tracking-tighter leading-none mb-2 transition-colors ${esEntregado ? 'text-slate-400 line-through' : 'text-slate-900 group-hover:text-green-600'}`}>
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

                  <div className="flex flex-wrap lg:flex-nowrap items-center gap-6 w-full lg:w-auto pt-6 lg:pt-0 border-t lg:border-t-0 border-slate-50 justify-between lg:justify-end">
                    <div className="flex flex-col items-start lg:items-end">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Monto</p>
                      <span className={`font-black text-2xl tracking-tighter ${esEntregado ? 'text-slate-400' : 'text-slate-900'}`}>
                        ${Number(pedido.precio_final || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 min-w-[140px]">
                      <div className="flex items-center justify-between gap-3 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-md">
                        <div className="flex flex-col">
                          <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Código QR</span>
                          <span className="font-mono text-sm font-black tracking-wider text-green-400 uppercase">
                            {pedido.codigo || `##${pedido.id}`}
                          </span>
                        </div>
                        <Ticket className="w-4 h-4 text-slate-600" />
                      </div>

                      <Badge className={`justify-center py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border-none ${
                        esEntregado
                          ? "bg-slate-100 text-slate-400"
                          : estadoNorm === 'pagado'
                          ? "bg-green-100 text-green-600"
                          : "bg-orange-100 text-orange-600"
                      }`}>
                        {estadoNorm === 'en_camino' ? 'En camino' : pedido.estado || "Pendiente"}
                      </Badge>
                    </div>

                    {/* Acción directa solo para retiro en local */}
                    <div className="w-full lg:w-auto">
                      {!esDomicilio && !esEntregado ? (
                        <Button
                          onClick={() => ejecutarEntregaFinal(pedido.id)}
                          className="w-full lg:w-auto bg-green-600 hover:bg-slate-900 text-white font-black text-[10px] uppercase px-5 h-12 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                        >
                          <Check size={14} strokeWidth={3} /> Entregar
                        </Button>
                      ) : esDomicilio && !esEntregado ? (
                        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2.5 rounded-2xl border border-blue-100">
                          <Truck size={14} className="text-blue-500 flex-shrink-0" />
                          <span className="text-[9px] font-black text-blue-600 uppercase tracking-wider">Repartidor lo recoge</span>
                        </div>
                      ) : (
                        <div className="hidden lg:flex w-12 h-12 bg-slate-50 rounded-2xl items-center justify-center text-slate-300">
                          <ChevronRight className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
