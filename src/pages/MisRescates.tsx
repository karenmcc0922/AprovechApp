import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import AppNavbar from "../components/AppNavbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  QrCode,
  Clock,
  CheckCircle2,
  MapPin,
  ShoppingBag,
  History,
  ArrowRight,
  Ticket,
  Loader2,
  Truck,
  Package,
  Leaf,
  PiggyBank,
  ChevronRight
} from "lucide-react";
import { API_BASE } from "../lib/api";

// ========================================================
// COMPONENTE: CONTADOR INTEGRADO (CALIBRADO Y SIN DESFASE)
// ========================================================
function ContadorRescate({ fechaCreacion }: { fechaCreacion: string }) {
  const [tiempoRestante, setTiempoRestante] = useState<string>("Calculando...");
  const [esExpirado, setEsExpirado] = useState<boolean>(false);

  useEffect(() => {
    if (!fechaCreacion) {
      setTiempoRestante("Expirado");
      setEsExpirado(true);
      return;
    }

    const calcularTiempo = () => {
      const ahora = new Date().getTime();
      const stringFecha = String(fechaCreacion);

      const partes = stringFecha.split(/[^0-9]/).filter(p => p.length > 0);
      let inicio: number = 0;

      if (partes.length >= 5) {
        const anio = parseInt(partes[0], 10);
        const mes = parseInt(partes[1], 10) - 1; 
        const dia = parseInt(partes[2], 10);
        const hora = parseInt(partes[3], 10);
        const minuto = parseInt(partes[4], 10);
        const segundo = partes[5] ? parseInt(partes[5], 10) : 0;

        inicio = Date.UTC(anio, mes, dia, hora, minuto, segundo);
      } else {
        inicio = new Date(stringFecha.replace(/-/g, "/")).getTime();
      }

      const tiempoLimite = inicio + (1 * 60 * 60 * 1000); 
      const diferencia = tiempoLimite - ahora;

      if (isNaN(inicio) || diferencia <= 0) {
        setTiempoRestante("Tiempo Expirado");
        setEsExpirado(true);
        return;
      }

      const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
      const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

      const formatoHoras = horas > 0 ? `${horas}h ` : "";
      setTiempoRestante(`${formatoHoras}${minutes}m ${segundos}s`);
      setEsExpirado(false);
    };

    calcularTiempo(); 
    const intervalo = setInterval(calcularTiempo, 1000);

    return () => clearInterval(intervalo);
  }, [fechaCreacion]);

  return (
    <span className={`font-mono text-xs font-black px-2 py-0.5 rounded border ${
      esExpirado 
        ? "text-rose-600 bg-rose-50/50 border-rose-100" 
        : "text-amber-500 bg-amber-500/10 border-amber-500/20"
    }`}>
      {esExpirado ? "❌ Expirado" : `Expira en: ${tiempoRestante}`}
    </span>
  );
}

// ==========================================
// COMPONENTE: TARJETA DE RESCATE ACTIVO
// ==========================================
function RescateActivoCard({ rescate, abrirModalQr }: { rescate: any; abrirModalQr: (r: any) => void }) {
  const esDomicilio = rescate.tipo_entrega === "domicilio";
  const estado = rescate.estado?.toLowerCase() || "pendiente";

  const steps = ["Confirmado", "En camino", "Entregado"];
  const stepIndex = estado === "pagado" || estado === "pendiente" || estado === "reservado" ? 0
    : estado === "en_camino" || estado === "recogido" ? 1
    : 2;

  const estadoLabel = estado === "recogido"
    ? "Repartidor en camino 🛵"
    : estado === "en_camino"
    ? "Asignado"
    : estado === "pagado"
    ? "Confirmado"
    : estado === "pendiente" || estado === "reservado"
    ? "Pendiente pago"
    : "Entregado";

  const estadoColor = estado === "recogido"
    ? "bg-amber-100 text-amber-700"
    : estado === "en_camino"
    ? "bg-blue-100 text-blue-700"
    : estado === "pagado"
    ? "bg-green-100 text-green-700"
    : "bg-orange-100 text-orange-700";

  return (
    <Card className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all">
      <CardContent className="p-0">
        {/* Delivery type header */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
          {esDomicilio
            ? <><Truck size={13} className="text-blue-500" /><span className="text-xs font-semibold text-slate-600">Entrega a domicilio</span></>
            : <><Package size={13} className="text-green-600" /><span className="text-xs font-semibold text-slate-600">Para recoger</span></>
          }
        </div>

        <div className="flex flex-col md:flex-row gap-0">
          {/* Left: image */}
          <div
            className="md:w-28 md:h-auto h-36 bg-slate-100 shrink-0 flex items-center justify-center cursor-pointer"
            onClick={() => abrirModalQr(rescate)}
          >
            <div className="flex flex-col items-center gap-1 p-3">
              <QrCode className="w-14 h-14 text-slate-400" />
              <span className="text-[9px] font-semibold text-slate-400">Ver QR</span>
            </div>
          </div>

          {/* Middle: info */}
          <div className="flex-1 p-5">
            <p className="text-xs font-semibold text-green-600 flex items-center gap-1 mb-0.5">
              <Ticket size={11} /> {rescate.nombre_local || rescate.nombre_aliado || rescate.local}
            </p>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {rescate.nombre_producto || rescate.producto}
            </h3>
            <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
              <Clock size={11} />
              {rescate.fecha ? new Date(rescate.fecha.replace(" ", "T")).toLocaleString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-700 mb-2">
              <span className="bg-slate-100 px-2 py-0.5 rounded">1x {rescate.nombre_producto || rescate.producto}</span>
              <span className="font-bold text-slate-900">${Number(rescate.precio_final || 0).toLocaleString()}</span>
            </div>

            <p className="text-xs text-slate-500 flex items-center gap-1">
              <MapPin size={11} />
              {esDomicilio ? (rescate.direccion || "Dirección de entrega") : (rescate.direccion_aliado || rescate.direccion || "Punto de recogida")}
            </p>

            {(rescate.estado === "pendiente" || rescate.estado === "reserva" || rescate.estado === "reservado") && (
              <div className="mt-3">
                <ContadorRescate fechaCreacion={rescate.fecha} />
              </div>
            )}
          </div>

          {/* Right: status + stepper */}
          <div className="md:w-52 p-5 border-t md:border-t-0 md:border-l border-slate-100 flex flex-col gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1.5">Estado</p>
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${estadoColor}`}>
                {estado === "en_camino" && <Truck size={11} />}
                {(estado === "pagado" || estado === "completado") && <CheckCircle2 size={11} />}
                {estadoLabel}
              </span>
            </div>

            {/* Progress stepper */}
            <div className="space-y-2">
              {steps.map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    i < stepIndex ? "bg-green-600 border-green-600"
                    : i === stepIndex ? "border-green-600 bg-white"
                    : "border-slate-200 bg-white"
                  }`}>
                    {i < stepIndex && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    {i === stepIndex && <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />}
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`absolute ml-1.5 mt-3.5 w-0.5 h-3 ${i < stepIndex ? "bg-green-600" : "bg-slate-200"}`} style={{ display: "none" }} />
                  )}
                  <span className={`text-xs ${i <= stepIndex ? "font-semibold text-slate-700" : "text-slate-400"}`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>

            {estado === "pagado" && (
              <button
                onClick={() => abrirModalQr(rescate)}
                className="mt-auto text-center bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 px-3 rounded-xl transition-colors"
              >
                Ver indicaciones
              </button>
            )}
            {estado === "en_camino" && (
              <div className="flex flex-col gap-2 mt-auto">
                <p className="text-xs text-blue-600 font-semibold flex items-center gap-1">
                  <Truck size={11} className="animate-bounce" /> Repartidor asignado
                </p>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock size={11} /> Recogiendo en el comercio...
                </p>
              </div>
            )}
            {estado === "recogido" && (
              <div className="flex flex-col gap-2 mt-auto">
                <p className="text-xs text-amber-600 font-semibold flex items-center gap-1">
                  <Truck size={11} className="animate-bounce" /> ¡Tu pedido está en camino!
                </p>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock size={11} /> Tiempo estimado: 30–45 min
                </p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((rescate.direccion || rescate.nombre_local || "") + ", Pereira, Colombia")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-green-600 font-semibold flex items-center gap-1 hover:text-green-700 transition-colors"
                >
                  <MapPin size={11} /> Ver ubicación del comercio
                </a>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// COMPONENTE: TARJETA DE RESCATE EN HISTORIAL
// ==========================================
function RescateHistorialCard({ rescate }: { rescate: any }) {
  const formatearFechaHistorial = (fechaRaw: string) => {
    if (!fechaRaw) return "—";
    try {
      let stringFecha = String(fechaRaw).trim();
      if (stringFecha.includes(" ") && !stringFecha.includes("T")) {
        stringFecha = stringFecha.replace(" ", "T");
      }
      const fechaObjeto = new Date(stringFecha);
      if (isNaN(fechaObjeto.getTime())) return "—";
      return fechaObjeto.toLocaleDateString("es-CO", {
        day: "2-digit", month: "short", year: "numeric",
        timeZone: "America/Bogota"
      }) + " · " + fechaObjeto.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", timeZone: "America/Bogota" });
    } catch { return "—"; }
  };

  const cancelado = rescate.estado === "cancelado";

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${cancelado ? "bg-red-100" : "bg-green-100"}`}>
            <CheckCircle2 size={13} className={cancelado ? "text-red-500" : "text-green-600"} />
          </div>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cancelado ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>
            {cancelado ? "Cancelado" : "Entregado"}
          </span>
        </div>
        <span className="text-xs text-slate-400">{formatearFechaHistorial(rescate.fecha)}</span>
      </div>

      <h4 className="font-bold text-slate-800 text-sm mb-0.5">
        {rescate.nombre_producto || rescate.producto}
      </h4>
      <p className="text-xs text-slate-500 mb-3">
        {rescate.nombre_local || rescate.nombre_aliado || rescate.local}
      </p>

      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
        <Package size={11} />
        <span>1x {rescate.nombre_producto || rescate.producto}</span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div>
          <p className="text-[10px] text-slate-400 font-medium">Total pagado</p>
          <span className="font-black text-slate-900 text-base">
            ${Number(rescate.precio_final || rescate.precio || 0).toLocaleString()}
          </span>
        </div>
        <button className="flex items-center gap-1 text-xs font-semibold text-green-600 hover:text-green-700 transition-colors">
          Ver detalle <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}

// ==========================================
// VISTA / COMPONENTE PRINCIPAL: MIS RESCATES
// ==========================================
export default function MisRescates() {
  const [, setLocation] = useLocation();
  const [rescates, setRescates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pendientes" | "completados">("pendientes");

  const [selectedRescate, setSelectedRescate] = useState<any>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const fetchRescates = async () => {
    const stored = localStorage.getItem("usuario");
    if (!stored) {
      setLoading(false);
      return;
    }
    const user = JSON.parse(stored);

    try {
      const response = await fetch(`${API_BASE}/api/pedidos/usuario/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        const datosFormateados = data.map((r: any) => ({
          ...r,
          estado: (r.estado ? String(r.estado).toLowerCase().trim() : "pendiente")
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

  const abrirModalQr = (rescate: any) => {
    setSelectedRescate(rescate);
    setIsQrModalOpen(true);
  };

  const pendientes = rescates.filter(r => ["pendiente", "pagado", "reserva", "reservado", "en_camino", "recogido"].includes(r.estado));
  const completados = rescates.filter(r => ["completado", "entregado", "cancelado"].includes(r.estado));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AppNavbar />

      <main className="flex-grow container mx-auto px-4 pt-24 pb-16 max-w-5xl">
        {/* ── HEADER ── */}
        <div className="bg-gradient-to-br from-emerald-50 to-white rounded-3xl p-6 sm:p-8 mb-6 flex items-start justify-between gap-4 border border-green-100">
          <div>
            <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">Tu impacto positivo</p>
            <h1 className="text-3xl font-black text-slate-900 mb-1">
              Mis <span className="text-green-600">rescates</span> 🌿
            </h1>
            <p className="text-sm text-slate-500">
              {filter === "pendientes"
                ? "Aquí puedes ver todos los rescates que tienes activos."
                : "Revisa tu historial y el impacto de cada rescate que realizaste."
              }
            </p>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
            <span className="text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-full border border-green-100">
              Gracias por hacer la diferencia 💚
            </span>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="flex bg-white border border-slate-200 rounded-2xl p-1 mb-6 w-fit shadow-sm">
          <button
            onClick={() => setFilter("pendientes")}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              filter === "pendientes"
                ? "bg-green-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Activos ({pendientes.length})
          </button>
          <button
            onClick={() => setFilter("completados")}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              filter === "completados"
                ? "bg-green-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Historial ({completados.length})
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
            <p className="text-sm text-slate-400 font-semibold">Cargando rescates...</p>
          </div>
        ) : filter === "pendientes" ? (
          <div className="space-y-4">
            {pendientes.length > 0 ? (
              pendientes.map((rescate) => (
                <RescateActivoCard key={rescate.id} rescate={rescate} abrirModalQr={abrirModalQr} />
              ))
            ) : (
              <EmptyState icon={<ShoppingBag />} message="No tienes rescates activos en este momento." />
            )}
          </div>
        ) : (
          <div>
            {/* Impact stats */}
            {completados.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { icon: <CheckCircle2 size={16} className="text-green-600" />, label: "rescates realizados", value: completados.length, bg: "bg-green-50" },
                  { icon: <Leaf size={16} className="text-green-600" />, label: "CO₂ evitado", value: `${(completados.length * 2.5).toFixed(0)} kg`, bg: "bg-emerald-50" },
                  { icon: <Package size={16} className="text-amber-600" />, label: "alimentos salvados", value: `${(completados.length * 1.5).toFixed(0)} kg`, bg: "bg-amber-50" },
                  { icon: <PiggyBank size={16} className="text-pink-600" />, label: "ahorrado en total", value: `$${completados.reduce((a, c) => a + Number(c.precio_final || 0), 0).toLocaleString()}`, bg: "bg-pink-50" },
                ].map((stat, i) => (
                  <div key={i} className={`${stat.bg} rounded-2xl p-4 flex flex-col gap-2`}>
                    <div>{stat.icon}</div>
                    <p className="text-lg font-black text-slate-900">{stat.value}</p>
                    <p className="text-xs text-slate-500 font-medium leading-tight">{stat.label}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {completados.length > 0 ? (
                completados.map((rescate) => (
                  <RescateHistorialCard key={rescate.id} rescate={rescate} />
                ))
              ) : (
                <div className="col-span-full">
                  <EmptyState icon={<History />} message="Aún no tienes un historial de rescates." />
                </div>
              )}
            </div>

            {completados.length > 0 && (
              <div className="mt-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
                <div className="flex-1">
                  <h3 className="text-lg font-black text-slate-800">Cada rescate cuenta 💚</h3>
                  <p className="text-sm text-slate-500 mt-1">Gracias por ayudar a reducir el desperdicio de alimentos y apoyar a los comercios locales.</p>
                </div>
                <button
                  onClick={() => setLocation("/catalog")}
                  className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors"
                >
                  Seguir rescatando
                </button>
              </div>
            )}
          </div>
        )}

        {/* Bottom impact banner for active tab */}
        {filter === "pendientes" && pendientes.length > 0 && (
          <div className="mt-8 bg-green-900 rounded-3xl p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4 text-white">
            <p className="font-bold text-sm">¡Gracias por rescatar alimentos! 🌍</p>
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <p className="font-black text-lg">{rescates.length}</p>
                <p className="text-green-300 text-xs">Rescates realizados</p>
              </div>
              <div className="text-center">
                <p className="font-black text-lg">{(rescates.length * 2.5).toFixed(0)} kg</p>
                <p className="text-green-300 text-xs">CO₂ evitado</p>
              </div>
              <div className="text-center">
                <p className="font-black text-lg">${completados.reduce((a, c) => a + Number(c.precio_final || 0), 0).toLocaleString()}</p>
                <p className="text-green-300 text-xs">Ahorrado</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* --- MODAL DE AMPLIACIÓN DE QR --- */}
      <Dialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-[40px] p-8 bg-white border border-slate-100 shadow-2xl text-center">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900 uppercase italic tracking-tight">
              Pase de Entrega
            </DialogTitle>
          </DialogHeader>

          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider my-3">
            Muestra esto en la caja de <span className="text-slate-800 underline font-black">{selectedRescate?.nombre_local || selectedRescate?.local}</span>
          </p>

          <div className="bg-slate-900 p-8 rounded-[35px] my-4 flex flex-col items-center justify-center shadow-lg">
            <div className="bg-white p-4 rounded-[24px] mb-4">
              <QrCode className="w-48 h-48 text-slate-900" />
            </div>
            <span className="text-slate-400 text-[9px] font-black tracking-widest uppercase">Identificador Alfanumérico</span>
            <p className="text-green-400 font-mono text-2xl font-black tracking-widest mt-1 uppercase">
              {selectedRescate?.codigo || selectedRescate?.codigo_qr || "A-XYZ"}
            </p>
          </div>

          <Button 
            onClick={() => setIsQrModalOpen(false)}
            className="w-full mt-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black uppercase text-xs tracking-widest py-6 rounded-xl transition-colors"
          >
            Cerrar ventana
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmptyState({ icon, message }: { icon: React.ReactNode, message: string }) {
  const [, goTo] = useLocation();
  return (
    <div className="text-center py-24 bg-white/80 backdrop-blur-md rounded-[50px] border-4 border-dashed border-slate-100">
      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 shadow-inner">
        {icon}
      </div>
      <p className="text-slate-400 font-black uppercase tracking-widest text-xs mb-6 px-10 leading-relaxed">{message}</p>
      <Button
        onClick={() => goTo('/catalog')}
        className="bg-slate-900 hover:bg-green-600 text-white rounded-full px-10 py-6 font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-3 mx-auto shadow-md"
      >
        Ir al catálogo <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}