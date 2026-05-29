import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import AppNavbar from "../components/AppNavbar";
import { toast } from "sonner";
import { API_BASE } from "../lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  History, 
  Calendar, 
  ShieldCheck, 
  MapPin, 
  Settings, 
  QrCode, 
  BadgeCheck, 
  Droplet, 
  Scale,  
  Leaf,
  Loader2,
  ChevronRight,
  Target,
  Star,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const formatearFecha = (fechaRaw: any): string => {
  if (!fechaRaw) return "Fecha no disponible";
  
  let stringFecha = String(fechaRaw).trim();
  if (stringFecha.includes(" ") && !stringFecha.includes("T")) {
    stringFecha = stringFecha.replace(" ", "T");
  }

  const fechaObjeto = new Date(stringFecha);
  if (isNaN(fechaObjeto.getTime())) {
    return "Fecha reciente";
  }

  return fechaObjeto.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
};

export default function Profile() {
  const [historial, setHistorial] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation(); 
  
  // Estado reactivo para el usuario para evitar recargas o dispatches manuales del DOM
  const [usuario, setUsuario] = useState<any>(() => {
    return JSON.parse(localStorage.getItem("usuario") || "{}");
  });

  const userId = usuario.id;
  const userName = usuario.nombre || "Rescatista";
  const userEmail = usuario.correo || "usuario@ejemplo.com";

  // --- ESTADOS PARA MODAL DE CONFIGURACIÓN ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editNombre, setEditNombre] = useState(userName);
  const [editTelefono, setEditTelefono] = useState(usuario.telefono || "");
  const [editDireccion, setEditDireccion] = useState(usuario.direccion || "");
  const [isGuardando, setIsGuardando] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      setEditNombre(usuario.nombre || "");
      setEditTelefono(usuario.telefono || "");
      setEditDireccion(usuario.direccion || "");
    }
  }, [isModalOpen, usuario]);

  useEffect(() => {
    const cargarHistorialDesdeDB = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`${API_BASE}/api/pedidos/usuario/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setHistorial(data);
        }
      } catch (error) {
        console.error("Error al cargar historial:", error);
      } {
        setLoading(false);
      }
    };
    cargarHistorialDesdeDB();
  }, [userId]);

  const guardarConfiguracion = async () => {
    if (!editNombre.trim() || !editTelefono.trim() || !editDireccion.trim()) {
      toast.warning("Por favor, llena todos los campos obligatorios.");
      return;
    }

    setIsGuardando(true);
    try {
      const response = await fetch(`${API_BASE}/api/usuarios/${userId}/actualizar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: editNombre,
          telefono: editTelefono,
          direccion: editDireccion
        })
      });

      if (response.ok) {
        const usuarioActualizado = {
          ...usuario,
          nombre: editNombre,
          telefono: editTelefono,
          direccion: editDireccion
        };
        localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));
        setUsuario(usuarioActualizado); // Actualización reactiva instantánea
        setIsModalOpen(false);
        toast.success("Perfil actualizado correctamente");
      } else {
        toast.error("Hubo un error al guardar los cambios en el servidor.");
      }
    } catch (error) {
      console.error("Error al actualizar la cuenta:", error);
      toast.error("No se pudo establecer conexión con el servidor remoto.");
    } finally {
      setIsGuardando(false);
    }
  };

  const totalGastado = historial.reduce((acc, curr) => acc + (Number(curr.precio_final) || 0), 0);
  const co2Ahorrado = (historial.length * 2.5).toFixed(1); 
  const aguaAhorrada = (historial.length * 1200).toLocaleString(); 
  const comidaSalvada = (historial.length * 1.0).toFixed(1); 

  return (
    <div className="min-h-screen bg-[#FBFDFF] flex flex-col relative overflow-hidden">
      <AppNavbar />
      
      {/* Elementos ambientales de fondo */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-50/60 blur-[120px] -z-10" />
      <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-50/50 blur-[130px] -z-10" />
      
      <main className="flex-grow container mx-auto px-6 pt-32 pb-20 max-w-6xl relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* --- COLUMNA IZQUIERDA: TARJETA DE IDENTIDAD --- */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="border border-slate-100/80 shadow-[0_20px_50px_rgba(0,0,0,0.02)] rounded-[45px] bg-white p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-600" />
              
              <div className="relative w-36 h-36 mx-auto mb-6">
                <div className="w-full h-full bg-slate-900 rounded-[40px] flex items-center justify-center text-white text-5xl font-black shadow-xl uppercase italic rotate-2 hover:rotate-0 transition-transform duration-500">
                  {userName.charAt(0)}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 p-2.5 rounded-[18px] shadow-lg border-4 border-white">
                  <BadgeCheck className="w-5 h-5 text-white" />
                </div>
              </div>

              <div className="text-center">
                <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-tight mb-1">
                  {userName}
                </h2>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.15em] mb-6">{userEmail}</p>
                
                <div className="flex items-center justify-center gap-2 bg-slate-50/80 border border-slate-100 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 mb-6">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Pereira, CO
                </div>

                <div className="space-y-2 text-left bg-slate-50/40 p-4 rounded-2xl border border-slate-100/60">
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                    <span className="flex items-center gap-1"><Sparkles size={10} className="text-amber-500"/> Rango</span>
                    <span className="text-emerald-600 font-black">{historial.length}/20 Packs</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000" 
                      style={{ width: `${Math.min((historial.length / 20) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight italic">Próximo: Guardián Planetario</p>
                </div>
              </div>

              <Button 
                variant="ghost" 
                onClick={() => setIsModalOpen(true)}
                className="w-full mt-6 rounded-xl py-5 border border-slate-100 font-black text-[9px] uppercase tracking-wider text-slate-500 hover:bg-slate-900 hover:text-white transition-all duration-300"
              >
                <Settings className="w-3.5 h-3.5 mr-2 shrink-0" /> Configurar Cuenta
              </Button>
            </Card>

            <Card className="border-none shadow-xl bg-slate-900 rounded-[40px] text-white p-8 flex flex-col items-center text-center group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-emerald-500/20 transition-colors" />
              
              <div className="bg-white p-5 rounded-[30px] mb-6 shadow-xl transform group-hover:scale-105 transition-all duration-500">
                <QrCode className="w-16 h-16 text-slate-900" />
              </div>
              <h3 className="font-black text-lg uppercase italic tracking-tighter">ID: RES-{userId || '000'}</h3>
              <div className="mt-3 flex items-center gap-1.5 bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-100">Miembro VIP</span>
              </div>
            </Card>
          </div>

          {/* --- COLUMNA DERECHA: DASHBOARD DE IMPACTO AMBIENTAL --- */}
          <div className="lg:col-span-8 space-y-10">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.01)] hover:shadow-xl transition-all group border-l-4 border-emerald-500">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Leaf className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Impacto CO₂ Evitado</p>
                <p className="text-3xl font-black text-slate-900 tracking-tighter italic">{co2Ahorrado} kg</p>
                <p className="text-[9px] font-medium text-slate-400 mt-1.5 leading-tight">Retenido fuera de la atmósfera.</p>
              </div>

              <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.01)] hover:shadow-xl transition-all group border-l-4 border-blue-500">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Droplet className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Agua Salvada</p>
                <p className="text-3xl font-black text-slate-900 tracking-tighter italic">{aguaAhorrada} L</p>
                <p className="text-[9px] font-medium text-slate-400 mt-1.5 leading-tight">Líquido vital optimizado.</p>
              </div>

              <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.01)] hover:shadow-xl transition-all group border-l-4 border-amber-500">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Scale className="w-5 h-5 text-amber-600" />
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Alimentos Rescatados</p>
                <p className="text-3xl font-black text-slate-900 tracking-tighter italic">{comidaSalvada} kg</p>
                <p className="text-[9px] font-medium text-slate-400 mt-1.5 leading-tight">Comida libre de desperdicio.</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-[26px] border border-slate-100 flex items-center justify-between px-6 shadow-[0_8px_30px_rgba(0,0,0,0.01)]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-900 text-white rounded-xl flex items-center justify-center">
                  <Target size={16} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Inversión Inteligente</h4>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Dinero acumulado en rescates</p>
                </div>
              </div>
              <p className="text-xl font-black text-slate-900 italic">${totalGastado.toLocaleString()}</p>
            </div>

            {/* CRONOLOGÍA DE ACTIVIDAD */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2.5 italic uppercase tracking-tighter">
                  <History className="w-6 h-6 text-emerald-600" /> Cronología de Rescates
                </h3>
                <Badge variant="outline" className="rounded-full border-slate-200 text-slate-400 font-bold px-3 py-0.5 text-[9px]">
                  {historial.length} movimientos
                </Badge>
              </div>
              
              <div className="space-y-4">
                {loading ? (
                  /* SKELETON ROW PREMIUM SINCRO */
                  <div className="space-y-3">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="bg-white p-6 rounded-[28px] border border-slate-100 flex items-center justify-between animate-pulse h-28">
                        <div className="flex items-center gap-4 w-2/3">
                          <div className="bg-slate-100 w-12 h-12 rounded-xl" />
                          <div className="space-y-2 flex-1">
                            <div className="bg-slate-100 h-2.5 rounded w-1/4" />
                            <div className="bg-slate-100 h-4 rounded w-3/4" />
                          </div>
                        </div>
                        <div className="bg-slate-100 h-10 rounded-xl w-24" />
                      </div>
                    ))}
                  </div>
                ) : historial.length > 0 ? (
                  historial.map((item) => (
                    <div 
                      key={item.id} 
                      className="bg-white p-6 rounded-[28px] border border-slate-100/70 hover:border-emerald-100 flex flex-col md:flex-row items-center justify-between group transition-all duration-300 hover:shadow-[0_15px_40px_rgba(0,0,0,0.02)]"
                    >
                      <div className="flex items-center gap-4 flex-1 w-full">
                        <div className="bg-slate-50 p-3.5 rounded-2xl group-hover:bg-emerald-50 transition-colors shrink-0">
                          <Calendar className="w-6 h-6 text-slate-300 group-hover:text-emerald-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[9px] font-black text-slate-300 uppercase tracking-wider block">
                            {formatearFecha(item.fecha)}
                          </span>
                          <h4 className="font-black text-slate-800 uppercase italic text-lg tracking-tighter truncate group-hover:text-emerald-600 transition-colors">
                            {item.nombre_producto}
                          </h4>
                          <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5 flex items-center gap-1.5">
                            Cód: <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono tracking-tight font-black">{item.codigo_qr}</span>
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between md:justify-end gap-6 mt-4 md:mt-0 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-50">
                        <div className="text-left md:text-right min-w-[120px]">
                          <p className="text-xl font-black text-slate-900 tracking-tighter">${Number(item.precio_final).toLocaleString()}</p>
                          <Badge className="bg-emerald-50 text-emerald-700 rounded-md font-black text-[8px] uppercase tracking-wider border border-emerald-100 px-2 py-0.5 mt-0.5">
                            {item.estado || 'Rescatado'}
                          </Badge>
                        </div>
                        
                        <div className="shrink-0">
                          {(() => {
                            const estadoFormateado = (item.estado || "").toLowerCase();
                            const estadosValidos = ["entregado", "rescatado", "completado", "pagado"];
                            if (estadosValidos.includes(estadoFormateado)) {
                              return (
                                <CalificacionPedido 
                                  pedidoId={item.id} 
                                  aliadoId={item.aliado_id} 
                                  calificacionInicial={item.calificacion_guardada || 0} 
                                />
                              );
                            }
                            return null;
                          })()}
                        </div>
                        <ChevronRight className="text-slate-200 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all hidden md:block w-4 h-4" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 bg-white rounded-[32px] border border-dashed border-slate-200">
                    <Target className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                    <p className="text-slate-400 font-black uppercase tracking-wider text-[10px]">Tu historial está vacío</p>
                    <Button 
                      onClick={() => setLocation("/catalog")} 
                      className="text-emerald-600 font-black mt-2 uppercase text-[9px] tracking-widest p-0 h-auto bg-transparent hover:bg-transparent hover:underline"
                    >
                      ¡Empieza a salvar comida ahora!
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* --- EXCLUSIVO CUMPLIMIENTO REGULATORIO: LEY 1581 --- */}
            <div className="bg-slate-50/60 rounded-2xl p-4 flex gap-3 items-start border border-slate-100">
              <ShieldCheck className="text-slate-400 flex-shrink-0 mt-0.5" size={16} />
              <div className="space-y-0.5">
                <h5 className="text-[9px] font-black text-slate-700 uppercase tracking-wide">Aviso de Protección de Datos Personales (Ley 1581 de 2012)</h5>
                <p className="text-[9px] text-slate-400 font-medium leading-normal">
                  AprovechApp garantiza la confidencialidad de tu información logística e historial ecológico bajo los esquemas de seguridad vigentes en Colombia. El uso de los datos personales es estrictamente transaccional.
                </p>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* MODAL CONFIGURACIÓN CON INPUTS CORREGIDOS SHADCN */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[420px] bg-white/95 backdrop-blur-md rounded-[32px] p-6 border border-slate-100 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase italic tracking-tighter text-slate-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-emerald-600" /> Configurar Cuenta
            </DialogTitle>
            <DialogDescription className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Mantén tus datos logísticos al día
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-0.5">Nombre Completo</label>
              <Input 
                type="text" 
                value={editNombre} 
                onChange={(e) => setEditNombre(e.target.value)}
                className="rounded-xl border-slate-100 bg-slate-50/50 font-bold text-slate-700 text-xs focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-0.5">Teléfono Móvil</label>
              <Input 
                type="text" 
                value={editTelefono} 
                onChange={(e) => setEditTelefono(e.target.value)}
                placeholder="Ej: 3123456789"
                className="rounded-xl border-slate-100 bg-slate-50/50 font-bold text-slate-700 text-xs focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-0.5">Dirección en Pereira</label>
              <Input 
                type="text" 
                value={editDireccion} 
                onChange={(e) => setEditDireccion(e.target.value)}
                placeholder="Ej: Calle 20 # 5-12"
                className="rounded-xl border-slate-100 bg-slate-50/50 font-bold text-slate-700 text-xs focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <DialogFooter className="mt-2 gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border-slate-200 text-slate-500 font-bold text-[10px] uppercase px-5"
            >
              Cancelar
            </Button>
            <Button 
              onClick={guardarConfiguracion}
              disabled={isGuardando}
              className="rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-[10px] uppercase px-5 transition-colors"
            >
              {isGuardando ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Guardando
                </>
              ) : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTE INTERNO: CALIFICACIÓN INTERACTIVA CORREGIDA (BACKTICKS BUGFIX)
// ============================================================================
function CalificacionPedido({ pedidoId, aliadoId, calificacionInicial }: { pedidoId: any; aliadoId: any; calificacionInicial: number }) {
  const noteInicial = Number(calificacionInicial) || 0;
  
  const [rating, setRating] = useState<number>(noteInicial);
  const [hover, setHover] = useState<number>(0);
  const [enviando, setEnviando] = useState<boolean>(false);
  const [guardado, setGuardado] = useState<boolean>(noteInicial > 0);

  useEffect(() => {
    const fontNota = Number(calificacionInicial) || 0;
    setRating(fontNota);
    setGuardado(fontNota > 0);
  }, [calificacionInicial]);

  const procesarCalificacion = async (nota: number) => {
    if (guardado || enviando) return;
    
    setEnviando(true);
    setRating(nota); 
    
    try {
      // FIX CRÍTICO: Cambio de comillas dobles a BACKTICKS para permitir interpolación correcta de URL
      const response = await fetch(`${API_BASE}/api/calificaciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pedido_id: Number(pedidoId) || pedidoId,
          aliado_id: Number(aliadoId) || aliadoId,
          puntuacion: nota
        }),
      });

      if (response.ok) {
        setGuardado(true);
        setHover(0);
        toast.success("¡Gracias por calificar al aliado!");
      } else {
        console.error("El servidor rechazó la calificación");
        setRating(noteInicial);
        setGuardado(false);
        toast.error("No se pudo guardar la calificación.");
      }
    } catch (error) {
      console.error("Error al registrar estrellas:", error);
      setRating(noteInicial);
      setGuardado(false);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-0.5 pt-0.5 shrink-0">
      <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider">
        {guardado ? "Comercio Calificado" : "Calificar Comercio"}
      </span>
      <div className="flex items-center gap-0.5 h-4">
        {enviando ? (
          <div className="flex items-center justify-center w-[70px]">
            <Loader2 className="w-2.5 h-2.5 animate-spin text-amber-500" />
          </div>
        ) : (
          [1, 2, 3, 4, 5].map((estrella) => {
            const activa = estrella <= (hover || rating);
            return (
              <button
                key={estrella}
                type="button"
                disabled={guardado}
                onClick={() => !guardado && procesarCalificacion(estrella)}
                onMouseEnter={() => !guardado && setHover(estrella)}
                onMouseLeave={() => !guardado && setHover(0)}
                className={`transition-all outline-none ${guardado ? "cursor-default" : "cursor-pointer hover:scale-125 active:scale-95"}`}
              >
                <Star
                  size={12}
                  className={`transition-colors duration-150 ${
                    activa 
                      ? "text-amber-400 fill-amber-400" 
                      : "text-slate-200 fill-transparent"
                  }`}
                />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}