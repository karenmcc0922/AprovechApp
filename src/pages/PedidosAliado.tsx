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
  Search,
  CheckCircle2,
  Check,
  Truck,
  CircleX,
  Timer,
  PackageCheck
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

  const entregados = pedidos.filter(p => ["entregado","completado"].includes((p.estado||"").toLowerCase())).length;
  const enCamino   = pedidos.filter(p => (p.estado||"").toLowerCase() === "en_camino").length;
  const pendientes = pedidos.filter(p => ["pagado","pendiente","reservado"].includes((p.estado||"").toLowerCase())).length;
  const expirados  = pedidos.filter(p => (p.estado||"").toLowerCase() === "expirado").length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AppNavbar />

      <div className="flex-grow container mx-auto px-4 pt-24 pb-16 max-w-5xl">

        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 ${isRefreshing ? '' : 'hidden'}`}/>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"/>
              </span>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Panel de control en vivo</p>
            </div>
            <h1 className="text-2xl font-black text-slate-900">
              Pedidos <span className="text-green-600">recibidos</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
              <p className="text-xs text-slate-400 font-medium">Total</p>
              <p className="text-lg font-black text-slate-900">{pedidos.length} Rescates</p>
            </div>
            <button
              onClick={() => fetchPedidos(true)}
              className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-xl shadow-sm transition-all active:scale-95"
            >
              <RefreshCcw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* ── CHECKPOINT QR ── */}
        <div className="mb-5">
          <div className="bg-slate-900 rounded-2xl p-5 shadow-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-white font-bold text-sm mb-0.5">Checkpoint de rescate</h3>
                <p className="text-slate-400 text-xs">Valida el código de entrega para completar el rescate.</p>
              </div>

              <div className="flex gap-2 w-full sm:w-auto max-w-sm">
                <div className="relative flex-1">
                  <Input
                    placeholder="Ingresa el código de rescate"
                    className="h-11 rounded-xl border-none bg-white/10 text-white placeholder:text-slate-500 font-semibold pl-10 uppercase tracking-wider focus-visible:ring-1 focus-visible:ring-white/20 text-sm"
                    value={codigoBusqueda}
                    onChange={(e) => setCodigoBusqueda(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && buscarPedidoPorCodigo()}
                  />
                  <Ticket className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
                </div>
                <Button
                  onClick={buscarPedidoPorCodigo}
                  disabled={buscando}
                  className="h-11 px-4 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-sm"
                >
                  {buscando ? <Loader2 className="animate-spin w-4 h-4" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {pedidoEncontrado && (
              <div className="mt-4 p-4 bg-white rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-50 p-2.5 rounded-xl">
                    <CheckCircle2 className="text-green-600 w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Cliente: <strong>{pedidoEncontrado.nombre_usuario}</strong> · <span className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">{pedidoEncontrado.codigo || `#${pedidoEncontrado.id}`}</span></p>
                    <h4 className="text-sm font-bold text-slate-900">{pedidoEncontrado.nombre_producto}</h4>
                    {pedidoEncontrado.tipo_entrega === 'domicilio' && (
                      <span className="flex items-center gap-1 text-[10px] text-blue-600 font-semibold mt-0.5">
                        <Truck size={10} /> Domicilio
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button onClick={() => setPedidoEncontrado(null)} className="text-slate-400 hover:text-red-500 text-xs font-semibold transition-colors">
                    Cancelar
                  </button>
                  {pedidoEncontrado.tipo_entrega !== 'domicilio' &&
                   !["entregado","completado"].includes(pedidoEncontrado.estado?.toLowerCase() || "") ? (
                    <Button onClick={() => ejecutarEntregaFinal(pedidoEncontrado.id)} className="bg-slate-900 text-white hover:bg-green-600 rounded-xl px-5 font-bold text-sm h-9 transition-colors">
                      Confirmar Entrega
                    </Button>
                  ) : (
                    <Badge className="bg-slate-100 text-slate-500 py-2 px-4 rounded-lg font-semibold border-none text-xs">
                      {pedidoEncontrado.tipo_entrega === 'domicilio' ? 'Domicilio — repartidor' : 'Ya entregado'}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── STATS CHIPS ── */}
        <div className="flex flex-wrap gap-2 mb-5">
          {[
            { icon: <PackageCheck size={14}/>, label: "Rescates totales", val: pedidos.length, cls: "bg-white border-slate-200 text-slate-700" },
            { icon: <CheckCircle2 size={14} className="text-green-600"/>, label: "Entregados", val: entregados, cls: "bg-green-50 border-green-200 text-green-700" },
            { icon: <Truck size={14} className="text-blue-500"/>, label: "En camino", val: enCamino, cls: "bg-blue-50 border-blue-200 text-blue-700" },
            { icon: <Timer size={14} className="text-amber-500"/>, label: "Pendientes", val: pendientes, cls: "bg-amber-50 border-amber-200 text-amber-700" },
            { icon: <CircleX size={14} className="text-red-500"/>, label: "Expirados", val: expirados, cls: "bg-red-50 border-red-200 text-red-600" },
          ].map((chip, i) => (
            <div key={i} className={`flex items-center gap-2 px-3 py-2 border rounded-xl text-xs font-semibold ${chip.cls}`}>
              {chip.icon} {chip.label} <span className="font-black">{chip.val}</span>
            </div>
          ))}
        </div>

        {/* ── ORDER LIST ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="animate-spin text-green-600 w-8 h-8 mb-3" />
            <p className="text-slate-400 text-sm font-semibold">Sincronizando pedidos...</p>
          </div>
        ) : pedidos.length === 0 ? (
          <div className="bg-white py-16 rounded-2xl text-center border border-dashed border-slate-200">
            <ShoppingBag className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">Sin pedidos activos</h3>
            <p className="text-slate-400 text-sm mt-1">Los rescates que los clientes compren aparecerán aquí</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Historial de hoy</p>
            {pedidos.map((pedido) => {
              const estadoNorm = (pedido.estado || "pendiente").toLowerCase();
              const esEntregado = ["entregado","completado"].includes(estadoNorm);
              const esDomicilio = pedido.tipo_entrega === "domicilio";
              const esExpirado = estadoNorm === "expirado";
              const esEnCamino = estadoNorm === "en_camino";

              const statusInfo = esEntregado
                ? { label: "Entregado", cls: "bg-green-100 text-green-700" }
                : esEnCamino
                ? { label: "En camino", cls: "bg-blue-100 text-blue-700" }
                : esExpirado
                ? { label: "Expirado", cls: "bg-red-100 text-red-600" }
                : { label: "Pendiente", cls: "bg-amber-100 text-amber-700" };

              return (
                <div
                  key={pedido.id}
                  className={`bg-white border rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all ${esEntregado || esExpirado ? 'border-slate-200 opacity-80' : 'border-slate-200 hover:border-green-200 hover:shadow-sm'}`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`p-2.5 rounded-xl shrink-0 ${esEntregado ? 'bg-slate-100 text-slate-400' : esDomicilio ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-700'}`}>
                      {esDomicilio ? <Truck size={18}/> : <ShoppingBag size={18}/>}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                        <Badge className={`border-none text-[10px] font-semibold px-2 py-0.5 ${esDomicilio ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-700'}`}>
                          {esDomicilio ? "Domicilio" : "Retiro en local"}
                        </Badge>
                        <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                          <Clock size={10}/> {pedido.fecha ? new Date(pedido.fecha).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}) : "—"}
                        </span>
                      </div>
                      <h3 className={`text-sm font-bold truncate ${esEntregado || esExpirado ? 'text-slate-400' : 'text-slate-900'}`}>
                        {pedido.nombre_producto}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <User size={10}/> {pedido.nombre_usuario}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap justify-between sm:justify-end w-full sm:w-auto">
                    <div className="text-right">
                      <p className="text-xs text-slate-400 font-medium">Monto</p>
                      <span className={`text-base font-black ${esEntregado || esExpirado ? 'text-slate-400' : 'text-slate-900'}`}>
                        ${Number(pedido.precio_final||0).toLocaleString()}
                      </span>
                    </div>

                    <div className="bg-slate-900 text-white px-3 py-2 rounded-xl flex items-center gap-2 min-w-[130px]">
                      <div>
                        <p className="text-[9px] text-slate-500 font-medium">Código QR</p>
                        <p className={`font-mono text-xs font-black tracking-wider ${esEntregado ? 'text-slate-400' : 'text-green-400'}`}>
                          {pedido.codigo || `#${pedido.id}`}
                        </p>
                      </div>
                      <Ticket size={14} className="text-slate-600 ml-auto" />
                    </div>

                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusInfo.cls}`}>
                      {statusInfo.label}
                    </span>

                    {!esDomicilio && !esEntregado && !esExpirado ? (
                      <Button
                        onClick={() => ejecutarEntregaFinal(pedido.id)}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-4 h-9 rounded-xl flex items-center gap-1.5 transition-all active:scale-95"
                      >
                        <Check size={13} strokeWidth={3} /> Entregar
                      </Button>
                    ) : esDomicilio && !esEntregado && !esExpirado ? (
                      <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 text-blue-600 text-xs font-semibold">
                        <Truck size={12}/> Repartidor
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── BOTTOM BANNERS ── */}
        {pedidos.length > 0 && entregados === pedidos.length && (
          <div className="mt-6 bg-green-50 border border-green-100 rounded-2xl p-5 flex items-center justify-between gap-4">
            <div>
              <p className="font-bold text-slate-800 text-sm">¿Todo entregado? 🎉</p>
              <p className="text-xs text-slate-500 mt-0.5">¡Excelente trabajo! Tu compromiso reduce el desperdicio de alimentos.</p>
            </div>
            <button className="text-xs font-semibold text-green-700 bg-white px-4 py-2 rounded-xl border border-green-200 hover:bg-green-50 transition-colors">
              Ver mis estadísticas
            </button>
          </div>
        )}

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">?</div>
            <div>
              <p className="text-sm font-semibold text-slate-700">¿Necesitas ayuda?</p>
              <p className="text-xs text-slate-400">Consulta nuestras guías o contáctanos</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 bg-white border border-slate-200 rounded-2xl py-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">Ver guías</button>
            <button className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-2xl py-3 text-xs font-semibold transition-colors">Contactar soporte</button>
          </div>
        </div>
      </div>
    </div>
  );
}