import { useState, useEffect } from "react";
import AppNavbar from "../components/AppNavbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Maximize2
} from "lucide-react";

// ========================================================
// COMPONENTE: CONTADOR INTEGRADO (BLINDADO CONTRA PARSEO UTC)
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
      
      // Sanitización para evitar bugs de desfase por String ISO / Zona Horaria local
      let fechaLimpia = fechaCreacion;
      if (typeof fechaCreacion === "string" && !fechaCreacion.includes("T") && fechaCreacion.endsWith("Z")) {
        fechaLimpia = fechaCreacion.replace("Z", ""); 
      }
      
      // Reemplaza guiones por barras si es necesario para compatibilidad estricta en iOS/Safari
      const stringNormalizado = String(fechaLimpia).replace(/-/g, "/");
      const inicio = new Date(stringNormalizado).getTime();
      
      // Definición exacta del límite de reserva: 2 horas desde su creación
      const tiempoLimite = inicio + (2 * 60 * 60 * 1000); 
      const diferencia = tiempoLimite - ahora;

      if (isNaN(inicio) || diferencia <= 0) {
        setTiempoRestante("Tiempo Expirado");
        setEsExpirado(true);
        return;
      }

      const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
      const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

      const formatoHoras = horas > 0 ? `${horas}h ` : "";
      setTiempoRestante(`${formatoHoras}${minutos}m ${segundos}s`);
      setEsExpirado(false);
    };

    calcularTiempo(); // Sincronización instantánea en el primer render
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
  return (
    <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[45px] overflow-hidden bg-white">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Sección Ticket / QR */}
          <div className="bg-slate-900 p-10 flex flex-col items-center justify-center text-white md:w-80 relative">
            <div className="absolute top-0 bottom-0 -right-3 hidden md:flex flex-col justify-around py-4 z-10">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="w-6 h-6 rounded-full bg-[#F8FAFC]" />
              ))}
            </div>

            <div 
              onClick={() => abrirModalQr(rescate)}
              className="bg-white p-5 rounded-[35px] mb-6 shadow-2xl rotate-2 hover:rotate-0 transition-all duration-500 cursor-pointer group relative"
            >
              <QrCode className="w-36 h-36 text-slate-900 group-hover:opacity-40 transition-opacity" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="w-8 h-8 text-slate-900" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">CÓDIGO DE RESCATE</p>
              <p className="font-mono text-2xl font-black tracking-widest text-green-400 uppercase">
                {rescate.codigo || rescate.codigo_qr || "RESCATE"}
              </p>
            </div>
          </div>

          {/* Información */}
          <div className="p-10 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-6 gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge className={`border-none px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                      rescate.estado === "pagado" 
                      ? "bg-emerald-100 text-emerald-800" 
                      : "bg-orange-100 text-orange-800"
                    }`}>
                      {rescate.estado === "pagado" ? "PAGADO (RECOGER)" : "RESERVADO (PAGA ALLÁ)"}
                    </Badge>
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 leading-tight tracking-tighter uppercase italic">
                    {rescate.nombre_producto || rescate.producto}
                  </h3>
                  <p className="text-blue-600 font-bold text-sm mt-1 flex items-center gap-1">
                    <Ticket className="w-4 h-4" /> {rescate.nombre_local || rescate.nombre_aliado || rescate.local}
                  </p>
                </div>
                <div className="text-right min-w-[80px]">
                  <p className="text-3xl font-black text-slate-900 tracking-tighter">
                    ${Number(rescate.precio_final || rescate.precio || 0).toLocaleString()}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Total</p>
                </div>
              </div>
              
              <div className="space-y-4 py-6 border-y border-slate-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Punto de recogida</p>
                    <p className="text-sm font-bold text-slate-700">{rescate.direccion || rescate.direccion_aliado || "Dirección no especificada"}</p>
                  </div>
                </div>

                {/* El contador se removió de arriba y ahora se renderiza dinámicamente aquí abajo */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-0.5">Horario de retiro</p>
                    {rescate.estado === "pendiente" ? (
                      <ContadorRescate fechaCreacion={rescate.fecha_creacion} />
                    ) : (
                      <p className="text-sm font-bold text-slate-700">Hoy antes del cierre del establecimiento</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
              <p className="text-[11px] font-black uppercase text-slate-600 tracking-tight">
                Presenta este boleto en el local 🏪
              </p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                El encargado escaneará o validará tu código para procesar la entrega.
              </p>
            </div>
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
  return (
    <Card className="border-none shadow-sm rounded-[35px] bg-white p-8 hover:shadow-xl transition-all group border border-transparent hover:border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
          <CheckCircle2 className="w-6 h-6 text-green-600" />
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`border-none font-black text-[9px] px-3 py-1 uppercase ${
            rescate.estado === "cancelado" ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-500"
          }`}>
            {rescate.estado === "cancelado" ? "CANCELADO" : "ENTREGADO"}
          </Badge>
        </div>
      </div>
      <h4 className="font-black text-slate-900 uppercase text-lg tracking-tighter italic mb-1">
        {rescate.nombre_producto || rescate.producto}
      </h4>
      <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-6">
        {rescate.nombre_local || rescate.nombre_aliado || rescate.local}
      </p>
      
      <div className="flex justify-between items-center pt-6 border-t border-slate-50">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase">Valor</p>
          <span className="font-black text-slate-900 text-xl">
            ${Number(rescate.precio_final || rescate.precio || 0).toLocaleString()}
          </span>
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase">
          {rescate.fecha_creacion ? new Date(String(rescate.fecha_creacion).replace(/-/g, "/")).toLocaleDateString() : 'Historial'}
        </span>
      </div>
    </Card>
  );
}

// ==========================================
// VISTA / COMPONENTE PRINCIPAL: MIS RESCATES
// ==========================================
export default function MisRescates() {
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
      const response = await fetch(`https://aprovechapp-api.onrender.com/api/pedidos/usuario/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        
        const datosFormateados = data.map((r: any) => ({
          ...r,
          estado: (r.estado ? String(r.estado).toLowerCase() : "pendiente")
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

  const pendientes = rescates.filter(r => r.estado === "pendiente" || r.estado === "pagado");
  const completados = rescates.filter(r => r.estado === "completado" || r.estado === "entregado" || r.estado === "cancelado");

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AppNavbar />
      
      <main className="container mx-auto px-6 pt-32 pb-20 max-w-4xl">
        {/* Cabecera */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-1 bg-green-500 rounded-full" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tu impacto positivo</p>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
              Mis <span className="text-green-600">Rescates</span>
            </h1>
          </div>
          
          <div className="flex bg-slate-200/50 p-1.5 rounded-[24px] backdrop-blur-sm">
            <button 
              onClick={() => setFilter("pendientes")}
              className={`px-8 py-3 rounded-[20px] text-[11px] font-black uppercase tracking-widest transition-all ${
                filter === "pendientes" 
                ? "bg-white text-slate-900 shadow-xl scale-105" 
                : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Activos ({pendientes.length})
            </button>
            <button 
              onClick={() => setFilter("completados")}
              className={`px-8 py-3 rounded-[20px] text-[11px] font-black uppercase tracking-widest transition-all ${
                filter === "completados" 
                ? "bg-white text-slate-900 shadow-xl scale-105" 
                : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Historial ({completados.length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sincronizando con la red...</p>
          </div>
        ) : filter === "pendientes" ? (
          <div className="space-y-8">
            {pendientes.length > 0 ? (
              pendientes.map((rescate) => (
                <RescateActivoCard 
                  key={rescate.id} 
                  rescate={rescate} 
                  abrirModalQr={abrirModalQr} 
                />
              ))
            ) : (
              <EmptyState icon={<ShoppingBag />} message="No tienes rescates activos en este momento." />
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {completados.length > 0 ? (
              completados.map((rescate) => (
                <RescateHistorialCard 
                  key={rescate.id} 
                  rescate={rescate} 
                />
              ))
            ) : (
              <div className="col-span-full">
                <EmptyState icon={<History />} message="Aún no tienes un historial de rescates." />
              </div>
            )}
          </div>
        )}
      </main>

      {/* --- MODAL DE AMPLIACIÓN DE QR --- */}
      <Dialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-[40px] p-8 bg-white border-none shadow-2xl text-center">
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
            className="w-full mt-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black uppercase text-xs tracking-widest py-6 rounded-xl"
          >
            Cerrar ventana
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmptyState({ icon, message }: { icon: React.ReactNode, message: string }) {
  return (
    <div className="text-center py-24 bg-white rounded-[50px] border-4 border-dashed border-slate-50">
      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 shadow-inner">
        {icon}
      </div>
      <p className="text-slate-400 font-black uppercase tracking-widest text-xs mb-6 px-10 leading-relaxed">{message}</p>
      <Button 
        onClick={() => window.location.assign('/catalog')}
        className="bg-slate-900 hover:bg-green-600 text-white rounded-full px-10 py-6 font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-3 mx-auto"
      >
        Ir al catálogo <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}