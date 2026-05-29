import { useState, useEffect } from "react";
import AppNavbar from "../components/AppNavbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  MapPin,
  Package2,
  Bike,
  RefreshCcw,
  CheckCircle2,
  Navigation,
  Store,
  User,
  Phone,
  ChevronRight,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import { API_BASE } from "../lib/api";
import { Input } from "@/components/ui/input";

interface PedidoEntrega {
  id: number;
  nombre_producto: string;
  precio_final: number;
  codigo_qr: string;
  estado: string;
  nombre_local: string;
  direccion_aliado: string;
  nombre_cliente: string;
  direccion_cliente: string;
  telefono_cliente: string;
}

export default function Repartidor() {
  const [disponibles, setDisponibles] = useState<PedidoEntrega[]>([]);
  const [enCamino, setEnCamino] = useState<PedidoEntrega[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tab, setTab] = useState<"disponibles" | "en_camino">("disponibles");
  const [procesando, setProcesando] = useState<number | null>(null);
  const [confirmandoId, setConfirmandoId] = useState<number | null>(null);
  const [codigoIngresado, setCodigoIngresado] = useState("");

  const fetchTodo = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    setIsRefreshing(true);
    try {
      const [resDisp, resEnC] = await Promise.all([
        fetch(`${API_BASE}/api/entregas/disponibles`),
        fetch(`${API_BASE}/api/entregas/en-camino`)
      ]);
      if (resDisp.ok) setDisponibles(await resDisp.json());
      if (resEnC.ok) setEnCamino(await resEnC.json());
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
        body: JSON.stringify({ estado: "en_camino" })
      });
      if (res.ok) {
        toast.success("¡Entrega aceptada! Ya puedes ir a recoger el pedido.");
        setTab("en_camino");
        fetchTodo(false);
      } else {
        toast.error("No se pudo aceptar la entrega. Intenta de nuevo.");
      }
    } catch {
      toast.error("Error de conexión al aceptar la entrega.");
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
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        toast.success("¡Pedido entregado con éxito! El cliente fue notificado.");
        setConfirmandoId(null);
        setCodigoIngresado("");
        fetchTodo(false);
      } else {
        toast.error("No se pudo confirmar la entrega.");
      }
    } catch {
      toast.error("Error de conexión al confirmar la entrega.");
    } finally {
      setProcesando(null);
    }
  };

  const abrirNavegacion = (direccion: string) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(direccion + ", Pereira, Colombia")}`, "_blank");
  };

  const lista = tab === "disponibles" ? disponibles : enCamino;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AppNavbar />

      <div className="container mx-auto px-6 pt-32 pb-20 max-w-4xl">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 ${isRefreshing ? 'block' : 'hidden'}`}></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Panel en Vivo — Actualiza cada 15s</p>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
              Panel de <span className="text-blue-600">Entregas</span>
            </h1>
          </div>

          <div className="flex gap-4">
            <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100 text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Disponibles</p>
              <p className="text-2xl font-black text-slate-900">{disponibles.length}</p>
            </div>
            <div className="bg-blue-600 px-5 py-3 rounded-2xl shadow-sm text-center">
              <p className="text-[9px] font-black text-blue-200 uppercase tracking-widest">En Curso</p>
              <p className="text-2xl font-black text-white">{enCamino.length}</p>
            </div>
            <button
              onClick={() => fetchTodo(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-2xl shadow-xl transition-all active:scale-95"
            >
              <RefreshCcw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-200/50 p-1.5 rounded-[24px] backdrop-blur-sm mb-8 w-fit">
          <button
            onClick={() => setTab("disponibles")}
            className={`px-8 py-3 rounded-[20px] text-[11px] font-black uppercase tracking-widest transition-all ${
              tab === "disponibles"
              ? "bg-white text-slate-900 shadow-xl scale-105"
              : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Disponibles ({disponibles.length})
          </button>
          <button
            onClick={() => setTab("en_camino")}
            className={`px-8 py-3 rounded-[20px] text-[11px] font-black uppercase tracking-widest transition-all relative ${
              tab === "en_camino"
              ? "bg-blue-600 text-white shadow-xl scale-105"
              : "text-slate-500 hover:text-slate-700"
            }`}
          >
            En Curso ({enCamino.length})
            {enCamino.length > 0 && tab !== "en_camino" && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full text-white text-[8px] font-black flex items-center justify-center">
                {enCamino.length}
              </span>
            )}
          </button>
        </div>

        {/* Listado */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <p className="font-black text-slate-400 uppercase text-xs tracking-widest">Sincronizando entregas...</p>
          </div>
        ) : lista.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[50px] border-4 border-dashed border-slate-50">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              {tab === "disponibles"
                ? <Package2 className="w-10 h-10 text-slate-200" />
                : <Bike className="w-10 h-10 text-slate-200" />
              }
            </div>
            <p className="font-black text-slate-400 uppercase tracking-[0.2em] text-xs">
              {tab === "disponibles"
                ? "No hay entregas disponibles en este momento"
                : "No tienes entregas en curso"
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {lista.map((pedido) => (
              <div
                key={pedido.id}
                className="bg-white rounded-[40px] shadow-[0_15px_40px_rgba(0,0,0,0.04)] border border-transparent hover:border-blue-100 transition-all overflow-hidden"
              >
                {/* Barra de estado */}
                <div className={`h-1.5 w-full ${tab === "en_camino" ? 'bg-blue-500' : 'bg-green-500'}`} />

                <div className="p-8">
                  {/* Nombre del producto y badge */}
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`border-none font-black text-[9px] uppercase px-3 py-1 ${tab === "en_camino" ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                          {tab === "en_camino" ? "🛵 En Camino" : "📦 Listo para recoger"}
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
                    </div>
                  </div>

                  {/* Ruta: Recoge en → Entrega en */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Punto de recogida */}
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

                    {/* Punto de entrega */}
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

                  {/* Acciones */}
                  <div className="flex gap-3">
                    {tab === "disponibles" ? (
                      <Button
                        onClick={() => aceptarEntrega(pedido.id)}
                        disabled={procesando === pedido.id}
                        className="flex-1 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl py-7 font-black uppercase text-xs tracking-widest shadow-lg transition-all active:scale-95"
                      >
                        {procesando === pedido.id ? (
                          <Loader2 className="animate-spin w-4 h-4" />
                        ) : (
                          <span className="flex items-center gap-2">
                            <Bike size={16} /> Aceptar Esta Entrega
                            <ChevronRight size={14} />
                          </span>
                        )}
                      </Button>
                    ) : (
                      <div className="flex flex-col gap-3 w-full">
                        <Button
                          variant="outline"
                          onClick={() => abrirNavegacion(pedido.direccion_cliente || "Pereira")}
                          className="rounded-2xl py-5 px-6 font-black text-xs border-slate-200 text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all w-full"
                        >
                          <Navigation size={14} className="mr-2" /> Abrir GPS
                        </Button>

                        {confirmandoId === pedido.id ? (
                          <div className="bg-green-50 border border-green-200 rounded-[24px] p-4 space-y-3">
                            <p className="text-[10px] font-black text-green-800 uppercase tracking-widest text-center">
                              Ingresa el código del cliente para confirmar
                            </p>
                            <Input
                              autoFocus
                              placeholder="Ej: ABC-1234"
                              value={codigoIngresado}
                              onChange={(e) => setCodigoIngresado(e.target.value.toUpperCase())}
                              className="font-mono font-black text-center tracking-widest text-slate-800 rounded-xl border-green-200 focus:border-green-500 focus:ring-green-500/20"
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
                                {procesando === pedido.id ? (
                                  <Loader2 className="animate-spin w-4 h-4" />
                                ) : (
                                  <span className="flex items-center gap-1.5"><CheckCircle2 size={14} /> Validar</span>
                                )}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            onClick={() => { setConfirmandoId(pedido.id); setCodigoIngresado(""); }}
                            className="w-full bg-blue-600 hover:bg-green-600 text-white rounded-2xl py-7 font-black uppercase text-xs tracking-widest shadow-lg transition-all active:scale-95"
                          >
                            <span className="flex items-center gap-2">
                              <CheckCircle2 size={16} /> Confirmar Entrega
                            </span>
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info de demo */}
        <div className="mt-10 bg-blue-50 rounded-[25px] p-5 flex gap-4 items-center border border-blue-100">
          <Clock className="text-blue-400 flex-shrink-0" size={18} />
          <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider leading-relaxed">
            El panel se actualiza automáticamente cada 15 segundos. Las entregas disponibles son pedidos con domicilio ya pagados por los clientes.
          </p>
        </div>
      </div>
    </div>
  );
}
