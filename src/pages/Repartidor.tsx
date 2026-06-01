import { useState, useEffect } from "react";
import AppNavbar from "../components/AppNavbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, MapPin, Package2, Bike, RefreshCcw, CheckCircle2,
  Navigation, Store, User, Phone, ChevronRight, Clock,
  History, Wallet, TrendingUp, ShoppingBag, Star,
} from "lucide-react";
import { toast } from "sonner";
import { API_BASE } from "../lib/api";
import { Input } from "@/components/ui/input";

interface PedidoEntrega {
  id: number;
  nombre_producto: string;
  precio_final: number;
  costo_domicilio: number;
  codigo_qr: string;
  estado: string;
  tipo_entrega: string;
  fecha?: string;
  nombre_local: string;
  direccion_aliado: string;
  nombre_cliente: string;
  direccion_cliente: string;
  telefono_cliente: string;
}

interface Stats {
  total_entregas: number;
  total_ganado: number;
  entregas_semana: number;
  ganado_semana: number;
}

export default function Repartidor() {
  const [disponibles, setDisponibles] = useState<PedidoEntrega[]>([]);
  const [enCamino, setEnCamino] = useState<PedidoEntrega[]>([]);
  const [historial, setHistorial] = useState<PedidoEntrega[]>([]);
  const [stats, setStats] = useState<Stats>({ total_entregas: 0, total_ganado: 0, entregas_semana: 0, ganado_semana: 0 });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tab, setTab] = useState<"disponibles" | "en_camino" | "historial">("disponibles");
  const [procesando, setProcesando] = useState<number | null>(null);
  const [confirmandoId, setConfirmandoId] = useState<number | null>(null);
  const [codigoIngresado, setCodigoIngresado] = useState("");

  const fetchTodo = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    setIsRefreshing(true);
    try {
      const [resDisp, resEnC, resHist, resStats] = await Promise.all([
        fetch(`${API_BASE}/api/entregas/disponibles`),
        fetch(`${API_BASE}/api/entregas/en-camino`),
        fetch(`${API_BASE}/api/entregas/historial`),
        fetch(`${API_BASE}/api/entregas/estadisticas`),
      ]);
      if (resDisp.ok) setDisponibles(await resDisp.json());
      if (resEnC.ok) setEnCamino(await resEnC.json());
      if (resHist.ok) setHistorial(await resHist.json());
      if (resStats.ok) setStats(await resStats.json());
    } catch (error) {
      console.error("Error cargando entregas:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTodo(true);
    const interval = setInterval(() => fetchTodo(false), 15000);
    return () => clearInterval(interval);
  }, []);

  const aceptarEntrega = async (pedidoId: number) => {
    setProcesando(pedidoId);
    try {
      const res = await fetch(`${API_BASE}/api/pedidos/${pedidoId}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "en_camino" }),
      });
      if (res.ok) {
        toast.success("¡Entrega aceptada! Ve al comercio a recoger el pedido.");
        setTab("en_camino");
        fetchTodo(false);
      } else {
        toast.error("No se pudo aceptar la entrega.");
      }
    } catch {
      toast.error("Error de conexión.");
    } finally {
      setProcesando(null);
    }
  };

  const confirmarRecogida = async (pedidoId: number) => {
    setProcesando(pedidoId);
    try {
      const res = await fetch(`${API_BASE}/api/pedidos/${pedidoId}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "recogido" }),
      });
      if (res.ok) {
        toast.success("¡Perfecto! El cliente fue notificado de que estás en camino.");
        fetchTodo(false);
      } else {
        toast.error("No se pudo confirmar la recogida.");
      }
    } catch {
      toast.error("Error de conexión.");
    } finally {
      setProcesando(null);
    }
  };

  const confirmarEntrega = async (pedido: PedidoEntrega) => {
    if (codigoIngresado.trim().toUpperCase() !== pedido.codigo_qr.toUpperCase()) {
      toast.error("Código incorrecto. Pídele al cliente que te muestre su código.");
      return;
    }
    setProcesando(pedido.id);
    try {
      const res = await fetch(`${API_BASE}/api/pedidos/${pedido.id}/entregar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        toast.success("¡Entrega completada! Buen trabajo 🎉");
        setConfirmandoId(null);
        setCodigoIngresado("");
        fetchTodo(false);
      } else {
        const data = await res.json();
        toast.error(data.error || "No se pudo confirmar la entrega.");
      }
    } catch {
      toast.error("Error de conexión.");
    } finally {
      setProcesando(null);
    }
  };

  const abrirNavegacion = (direccion: string) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(direccion + ", Pereira, Colombia")}`, "_blank");
  };

  const formatFecha = (fecha?: string) => {
    if (!fecha) return "—";
    try {
      return new Date(fecha.replace(" ", "T")).toLocaleDateString("es-CO", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
    } catch { return "—"; }
  };

  const lista = tab === "disponibles" ? disponibles : tab === "en_camino" ? enCamino : historial;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AppNavbar />

      <div className="container mx-auto px-6 pt-32 pb-20 max-w-4xl">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 ${isRefreshing ? "block" : "hidden"}`} />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500" />
              </span>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Panel en Vivo — Actualiza cada 15s</p>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
              Panel de <span className="text-blue-600">Repartidor</span>
            </h1>
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-slate-100 text-center min-w-[80px]">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Disponibles</p>
              <p className="text-2xl font-black text-slate-900">{disponibles.length}</p>
            </div>
            <div className="bg-blue-600 px-4 py-3 rounded-2xl shadow-sm text-center min-w-[80px]">
              <p className="text-[9px] font-black text-blue-200 uppercase tracking-widest">En Curso</p>
              <p className="text-2xl font-black text-white">{enCamino.length}</p>
            </div>
            <div className="bg-green-600 px-4 py-3 rounded-2xl shadow-sm text-center min-w-[80px]">
              <p className="text-[9px] font-black text-green-100 uppercase tracking-widest">Completadas</p>
              <p className="text-2xl font-black text-white">{historial.length}</p>
            </div>
            <button
              onClick={() => fetchTodo(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-2xl shadow-xl transition-all active:scale-95"
            >
              <RefreshCcw className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Balance cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { icon: <Wallet size={16} className="text-green-600" />, label: "Balance total", value: `$${Number(stats.total_ganado).toLocaleString()}`, bg: "bg-green-50" },
            { icon: <TrendingUp size={16} className="text-blue-600" />, label: "Esta semana", value: `$${Number(stats.ganado_semana).toLocaleString()}`, bg: "bg-blue-50" },
            { icon: <CheckCircle2 size={16} className="text-purple-600" />, label: "Total entregas", value: stats.total_entregas, bg: "bg-purple-50" },
            { icon: <Star size={16} className="text-amber-500" />, label: "Entregas semana", value: stats.entregas_semana, bg: "bg-amber-50" },
          ].map((item, i) => (
            <div key={i} className={`${item.bg} rounded-2xl p-4`}>
              <div className="mb-2">{item.icon}</div>
              <p className="text-lg font-black text-slate-900">{item.value}</p>
              <p className="text-[10px] text-slate-500 font-semibold leading-tight">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-200/50 p-1.5 rounded-[24px] backdrop-blur-sm mb-8 w-fit gap-1">
          {([
            { key: "disponibles", label: `Disponibles (${disponibles.length})`, active: "bg-white text-slate-900 shadow-xl scale-105", inactive: "text-slate-500 hover:text-slate-700" },
            { key: "en_camino", label: `En Curso (${enCamino.length})`, active: "bg-blue-600 text-white shadow-xl scale-105", inactive: "text-slate-500 hover:text-slate-700" },
            { key: "historial", label: `Historial (${historial.length})`, active: "bg-green-600 text-white shadow-xl scale-105", inactive: "text-slate-500 hover:text-slate-700" },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-6 py-3 rounded-[20px] text-[11px] font-black uppercase tracking-widest transition-all relative ${tab === t.key ? t.active : t.inactive}`}
            >
              {t.label}
              {t.key === "en_camino" && enCamino.length > 0 && tab !== "en_camino" && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full text-white text-[8px] font-black flex items-center justify-center">
                  {enCamino.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <p className="font-black text-slate-400 uppercase text-xs tracking-widest">Sincronizando...</p>
          </div>
        ) : tab === "historial" ? (
          /* ── HISTORIAL ── */
          historial.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-[50px] border-4 border-dashed border-slate-50">
              <History className="w-10 h-10 text-slate-200 mx-auto mb-4" />
              <p className="font-black text-slate-400 uppercase tracking-[0.2em] text-xs">Aún no tienes entregas completadas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {historial.map((pedido) => (
                <div key={pedido.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
                  <div className="h-1 w-full bg-green-500" />
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-mono font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase">
                          #{pedido.codigo_qr}
                        </span>
                        <Badge className="bg-green-100 text-green-700 border-none text-[9px] font-black uppercase px-2">
                          ✓ Entregado
                        </Badge>
                      </div>
                      <h4 className="font-black text-slate-900 text-sm uppercase truncate">{pedido.nombre_producto}</h4>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Store size={10} className="text-green-600" /> {pedido.nombre_local}
                        </span>
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <User size={10} className="text-blue-500" /> {pedido.nombre_cliente}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock size={10} /> {formatFecha(pedido.fecha)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ganaste</p>
                      <p className="text-xl font-black text-green-600">
                        ${Number(pedido.costo_domicilio || 0).toLocaleString()}
                      </p>
                      <button
                        onClick={() => abrirNavegacion(pedido.direccion_cliente)}
                        className="text-[9px] text-slate-400 hover:text-blue-600 font-semibold flex items-center gap-1 mt-1 ml-auto transition-colors"
                      >
                        <MapPin size={9} /> {pedido.direccion_cliente || "—"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : lista.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[50px] border-4 border-dashed border-slate-50">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              {tab === "disponibles" ? <Package2 className="w-10 h-10 text-slate-200" /> : <Bike className="w-10 h-10 text-slate-200" />}
            </div>
            <p className="font-black text-slate-400 uppercase tracking-[0.2em] text-xs">
              {tab === "disponibles" ? "No hay entregas disponibles en este momento" : "No tienes entregas en curso"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {lista.map((pedido) => (
              <div
                key={pedido.id}
                className="bg-white rounded-[40px] shadow-[0_15px_40px_rgba(0,0,0,0.04)] border border-transparent hover:border-blue-100 transition-all overflow-hidden"
              >
                <div className={`h-1.5 w-full ${pedido.estado === "recogido" ? "bg-amber-500" : tab === "en_camino" ? "bg-blue-500" : "bg-green-500"}`} />

                <div className="p-8">
                  {/* Encabezado del pedido */}
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge className={`border-none font-black text-[9px] uppercase px-3 py-1 ${
                          pedido.estado === "recogido"
                            ? "bg-amber-100 text-amber-700"
                            : tab === "en_camino"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}>
                          {pedido.estado === "recogido" ? "🛵 Tengo el pedido" : tab === "en_camino" ? "📍 Yendo al comercio" : "📦 Listo para recoger"}
                        </Badge>
                        <span className="text-[9px] font-mono font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md uppercase">
                          #{pedido.codigo_qr}
                        </span>
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-tight">
                        {pedido.nombre_producto}
                      </h3>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Valor</p>
                      <p className="text-2xl font-black text-slate-900">${Number(pedido.precio_final).toLocaleString()}</p>
                      <p className="text-[10px] font-semibold text-green-600 mt-0.5">
                        Ganas: ${Number(pedido.costo_domicilio || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Ruta */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div
                      className="bg-slate-50 p-5 rounded-[24px] cursor-pointer hover:bg-green-50 transition-colors group"
                      onClick={() => abrirNavegacion(pedido.direccion_aliado)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 bg-green-600 rounded-full flex items-center justify-center">
                          <Store className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Recoge en</span>
                        <Navigation className="w-3 h-3 text-slate-300 group-hover:text-green-600 transition-colors ml-auto" />
                      </div>
                      <p className="font-black text-slate-800 text-sm uppercase leading-tight">{pedido.nombre_local}</p>
                      <p className="text-[10px] font-bold text-slate-500 mt-0.5 flex items-center gap-1">
                        <MapPin size={10} className="text-green-500 flex-shrink-0" />
                        {pedido.direccion_aliado}
                      </p>
                    </div>

                    <div
                      className="bg-blue-50 p-5 rounded-[24px] cursor-pointer hover:bg-blue-100 transition-colors group"
                      onClick={() => abrirNavegacion(pedido.direccion_cliente || "Pereira")}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center">
                          <User className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Entrega a</span>
                        <Navigation className="w-3 h-3 text-slate-300 group-hover:text-blue-600 transition-colors ml-auto" />
                      </div>
                      <p className="font-black text-slate-800 text-sm uppercase leading-tight">{pedido.nombre_cliente}</p>
                      <p className="text-[10px] font-bold text-slate-500 mt-0.5 flex items-center gap-1">
                        <MapPin size={10} className="text-blue-500 flex-shrink-0" />
                        {pedido.direccion_cliente || "Dirección no especificada"}
                      </p>
                      {pedido.telefono_cliente && (
                        <a
                          href={`tel:${pedido.telefono_cliente}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-[10px] font-black text-blue-600 mt-2 hover:underline"
                        >
                          <Phone size={10} /> {pedido.telefono_cliente}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Acciones según tab y estado */}
                  {tab === "disponibles" ? (
                    <Button
                      onClick={() => aceptarEntrega(pedido.id)}
                      disabled={procesando === pedido.id}
                      className="w-full bg-slate-900 hover:bg-blue-600 text-white rounded-2xl py-7 font-black uppercase text-xs tracking-widest shadow-lg transition-all active:scale-95"
                    >
                      {procesando === pedido.id
                        ? <Loader2 className="animate-spin w-4 h-4" />
                        : <span className="flex items-center gap-2"><Bike size={16} /> Aceptar Esta Entrega <ChevronRight size={14} /></span>
                      }
                    </Button>
                  ) : pedido.estado === "en_camino" ? (
                    /* Repartidor yendo al comercio → confirmar recogida */
                    <div className="bg-amber-50 border border-amber-200 rounded-[24px] p-5 space-y-3">
                      <div className="flex items-start gap-3">
                        <ShoppingBag className="text-amber-600 shrink-0 mt-0.5" size={18} />
                        <div>
                          <p className="text-xs font-black text-amber-900 uppercase tracking-wide">¿Ya recogiste el pedido en {pedido.nombre_local}?</p>
                          <p className="text-[10px] text-amber-700 mt-0.5">Al confirmar, el cliente recibirá la notificación de que estás en camino.</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => abrirNavegacion(pedido.direccion_aliado)}
                          className="rounded-xl py-5 px-4 font-black text-xs border-amber-200 text-amber-700 hover:bg-amber-100 flex-1"
                        >
                          <Navigation size={13} className="mr-1" /> Ir al comercio
                        </Button>
                        <Button
                          onClick={() => confirmarRecogida(pedido.id)}
                          disabled={procesando === pedido.id}
                          className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl py-5 font-black text-xs tracking-widest uppercase shadow"
                        >
                          {procesando === pedido.id
                            ? <Loader2 className="animate-spin w-4 h-4" />
                            : <span className="flex items-center gap-1.5"><CheckCircle2 size={14} /> Tengo el pedido</span>
                          }
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Estado recogido → confirmar entrega al cliente */
                    <div className="flex flex-col gap-3">
                      <Button
                        variant="outline"
                        onClick={() => abrirNavegacion(pedido.direccion_cliente || "Pereira")}
                        className="rounded-2xl py-5 px-6 font-black text-xs border-slate-200 text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all w-full"
                      >
                        <Navigation size={14} className="mr-2" /> Abrir GPS al cliente
                      </Button>

                      {confirmandoId === pedido.id ? (
                        <div className="bg-green-50 border border-green-200 rounded-[24px] p-4 space-y-3">
                          <p className="text-[10px] font-black text-green-800 uppercase tracking-widest text-center">
                            Ingresa el código del cliente para confirmar entrega
                          </p>
                          <Input
                            autoFocus
                            placeholder="Ej: ISTWFH"
                            value={codigoIngresado}
                            onChange={(e) => setCodigoIngresado(e.target.value.toUpperCase())}
                            className="font-mono font-black text-center tracking-widest text-slate-800 rounded-xl border-green-200 focus:border-green-500"
                          />
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => { setConfirmandoId(null); setCodigoIngresado(""); }}
                              className="flex-1 rounded-xl py-5 text-xs font-black text-slate-500"
                            >
                              Cancelar
                            </Button>
                            <Button
                              onClick={() => confirmarEntrega(pedido)}
                              disabled={!codigoIngresado || procesando === pedido.id}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl py-5 font-black text-xs tracking-widest uppercase"
                            >
                              {procesando === pedido.id
                                ? <Loader2 className="animate-spin w-4 h-4" />
                                : <span className="flex items-center gap-1.5"><CheckCircle2 size={14} /> Validar</span>
                              }
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          onClick={() => { setConfirmandoId(pedido.id); setCodigoIngresado(""); }}
                          className="w-full bg-blue-600 hover:bg-green-600 text-white rounded-2xl py-7 font-black uppercase text-xs tracking-widest shadow-lg transition-all active:scale-95"
                        >
                          <span className="flex items-center gap-2">
                            <CheckCircle2 size={16} /> Confirmar Entrega al Cliente
                          </span>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 bg-blue-50 rounded-[25px] p-5 flex gap-4 items-center border border-blue-100">
          <Clock className="text-blue-400 flex-shrink-0" size={18} />
          <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider leading-relaxed">
            Panel en vivo — actualiza cada 15 segundos. Al confirmar recogida el cliente recibe notificación inmediata.
          </p>
        </div>
      </div>
    </div>
  );
}
