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
  Droplet,
  Scale,
  Leaf,
  Loader2,
  ChevronRight,
  Target,
  Sparkles,
  Star
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
  
  // Estado reactivo para el usuario sincronizado con localStorage
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

  // --- ESTADOS PARA MODAL DE CAMBIAR CONTRASEÑA ---
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [passActual, setPassActual] = useState("");
  const [passNuevo, setPassNuevo] = useState("");
  const [passConfirm, setPassConfirm] = useState("");
  const [isCambiandoPass, setIsCambiandoPass] = useState(false);

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
      } finally {
        setLoading(false);
      }
    };
    cargarHistorialDesdeDB();
  }, [userId]);

  const cambiarPassword = async () => {
    if (!passActual || !passNuevo || !passConfirm) {
      toast.warning("Completa todos los campos.");
      return;
    }
    if (passNuevo !== passConfirm) {
      toast.error("Las contraseñas nuevas no coinciden.");
      return;
    }
    if (passNuevo.length < 6) {
      toast.error("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setIsCambiandoPass(true);
    try {
      const res = await fetch(`${API_BASE}/api/usuarios/${userId}/cambiar-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password_actual: passActual, password_nuevo: passNuevo })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Contraseña actualizada con éxito");
        setIsPassModalOpen(false);
        setPassActual(""); setPassNuevo(""); setPassConfirm("");
      } else {
        toast.error(data.error || "No se pudo cambiar la contraseña");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setIsCambiandoPass(false);
    }
  };

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
        setUsuario(usuarioActualizado); 
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
  const comidaSalvada = (historial.length * 1.0).toFixed(1);

  const rangoActual = historial.length >= 20 ? "Guardián Planetario" : historial.length >= 10 ? "Rescatista Activo" : "Explorador Verde";
  const rangoMax = 20;
  const rangoProgress = Math.min((historial.length / rangoMax) * 100, 100);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AppNavbar />

      <main className="flex-grow container mx-auto px-4 pt-24 pb-16 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT COLUMN ── */}
          <div className="space-y-5">
            {/* Identity card */}
            <Card className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-5">
                <div className="relative">
                  <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-white text-2xl font-black">
                    {userName.charAt(0)}
                  </div>
                  <button className="absolute -bottom-1 -right-1 bg-green-600 p-1 rounded-lg border-2 border-white">
                    <Settings size={10} className="text-white" />
                  </button>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-black text-slate-900 truncate">{userName}</h2>
                  <p className="text-xs text-slate-500 truncate">{userEmail}</p>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                    <MapPin size={10} className="text-green-600" /> Pereira, Colombia
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 mb-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles size={12} className="text-amber-500" />
                  <span className="text-xs font-bold text-slate-700">RANGO</span>
                  <span className="text-xs font-black text-green-600 ml-auto">{rangoActual}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden mb-1">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-700"
                    style={{ width: `${rangoProgress}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">{historial.length} / {rangoMax} puntos • Sigue así, ¡Estás salvando el planeta!</p>
              </div>

              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => setIsModalOpen(true)}
                  className="w-full rounded-xl text-sm font-semibold text-slate-600 border-slate-200 gap-2 justify-start h-10"
                >
                  <Settings size={14} /> Configurar cuenta
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsPassModalOpen(true)}
                  className="w-full rounded-xl text-sm font-semibold text-slate-600 border-slate-200 gap-2 justify-start h-10"
                >
                  <ShieldCheck size={14} /> Cambiar contraseña
                </Button>
              </div>
            </Card>

            {/* VIP Card */}
            <Card className="bg-slate-900 border-none rounded-3xl p-6 text-white overflow-hidden relative">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-amber-400 text-lg">👑</span>
                    <span className="font-black text-sm text-amber-300">MIEMBRO VIP</span>
                  </div>
                  <p className="text-xs text-slate-400">ID: RES-{userId || "1"}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">¡Gracias por ser parte del cambio!</p>
                </div>
                <div
                  className="bg-white p-2 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setIsModalOpen(true)}
                >
                  <QrCode className="w-12 h-12 text-slate-900" />
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Presenta este código en los comercios aliados para identificarte y acumular{" "}
                <span className="text-green-400 font-semibold">más puntos.</span>
              </p>
            </Card>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Impact stats */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-700">Tu impacto en números</h3>
                <button className="text-xs text-green-600 font-semibold hover:underline">Ver impacto detallado →</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: <Leaf size={16} className="text-green-600" />, val: `${co2Ahorrado} kg`, label: "Impacto CO₂ evitado", sub: "Evitando gas contaminante", bg: "bg-green-50 border-green-100" },
                  { icon: <Droplet size={16} className="text-blue-500" />, val: `${(historial.length * 1.2).toFixed(1)} L`, label: "Agua salvada", sub: "Agua que llegó más lejos", bg: "bg-blue-50 border-blue-100" },
                  { icon: <Scale size={16} className="text-amber-600" />, val: `${comidaSalvada} kg`, label: "Alimentos rescatados", sub: "Comida fuera de la basura", bg: "bg-amber-50 border-amber-100" },
                  { icon: <Target size={16} className="text-purple-600" />, val: `$${totalGastado.toLocaleString()}`, label: "Ahorro acumulado", sub: "Gracias por tu elección", bg: "bg-purple-50 border-purple-100" },
                ].map((stat, i) => (
                  <div key={i} className={`${stat.bg} border rounded-2xl p-3 flex flex-col gap-1`}>
                    <div>{stat.icon}</div>
                    <p className="text-base font-black text-slate-900">{stat.val}</p>
                    <p className="text-[10px] font-semibold text-slate-600 leading-tight">{stat.label}</p>
                    <p className="text-[9px] text-slate-400 leading-tight">{stat.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* History timeline */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <History size={15} className="text-green-600" /> Cronología de rescates
                </h3>
                <Badge variant="outline" className="rounded-full text-slate-400 text-xs font-semibold px-2.5 py-0.5">
                  {historial.length} rescates
                </Badge>
              </div>

              <div className="space-y-2">
                {loading ? (
                  [1, 2, 3].map((n) => (
                    <div key={n} className="bg-white border border-slate-200 rounded-2xl p-4 animate-pulse flex gap-4 h-20">
                      <div className="bg-slate-100 w-10 h-10 rounded-xl shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="bg-slate-100 h-3 rounded w-1/4" />
                        <div className="bg-slate-100 h-4 rounded w-3/4" />
                      </div>
                    </div>
                  ))
                ) : historial.length > 0 ? (
                  historial.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-4 hover:border-green-200 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-green-50 transition-colors">
                          <Calendar className="w-4 h-4 text-slate-400 group-hover:text-green-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-slate-400 font-medium">{formatearFecha(item.fecha)}</p>
                          <p className="font-bold text-slate-800 text-sm truncate">{item.nombre_producto}</p>
                          <p className="text-[10px] text-slate-400">
                            Cód: <span className="font-mono bg-slate-100 px-1 rounded text-slate-600">{item.codigo_qr}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <p className="font-bold text-slate-900">${Number(item.precio_final).toLocaleString()}</p>
                        <Badge className={`text-[9px] font-semibold border-none px-2 py-0.5 ${
                          item.estado === "entregado" || item.estado === "completado"
                            ? "bg-green-100 text-green-700"
                            : item.estado === "cancelado" || item.estado === "expirado"
                            ? "bg-red-100 text-red-600"
                            : "bg-orange-100 text-orange-700"
                        }`}>
                          {item.estado === "entregado" || item.estado === "completado" ? "Entregado" : item.estado || "Rescatado"}
                        </Badge>
                        {(() => {
                          const est = (item.estado || "").toLowerCase();
                          if (["entregado", "rescatado", "completado", "pagado"].includes(est)) {
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
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                    <Target className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                    <p className="text-slate-400 font-semibold text-sm mb-3">Tu historial está vacío</p>
                    <Button onClick={() => setLocation("/catalog")} className="bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold px-4 py-2">
                      ¡Empieza a salvar comida!
                    </Button>
                  </div>
                )}
              </div>

              {historial.length > 5 && (
                <button
                  onClick={() => setLocation("/mis-rescates")}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-slate-500 hover:text-green-600 border border-slate-200 rounded-xl bg-white hover:border-green-200 transition-all"
                >
                  Ver más rescates <ChevronRight size={13} />
                </button>
              )}
            </div>

            {/* CTA Banner */}
            <div className="bg-green-50 border border-green-100 rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1">
                <h3 className="text-base font-black text-slate-800">Cada rescate cuenta 💚</h3>
                <p className="text-sm text-slate-500 mt-1">Gracias por ayudar a reducir el desperdicio de alimentos y construir un futuro más sostenible.</p>
              </div>
              <Button
                onClick={() => setLocation("/catalog")}
                className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm px-5 py-2.5 gap-2 shrink-0"
              >
                🌿 Seguir rescatando
              </Button>
            </div>

            {/* Legal notice */}
            <div className="bg-slate-50 rounded-2xl p-4 flex gap-3 items-start border border-slate-100">
              <ShieldCheck className="text-slate-400 shrink-0 mt-0.5" size={14} />
              <p className="text-[10px] text-slate-400 leading-relaxed">
                <strong className="text-slate-600">Ley 1581 de 2012:</strong> AprovechApp garantiza la confidencialidad de tu información bajo los esquemas de seguridad vigentes en Colombia. El uso de datos es estrictamente transaccional.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL CAMBIAR CONTRASEÑA */}
      <Dialog open={isPassModalOpen} onOpenChange={setIsPassModalOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white/95 backdrop-blur-md rounded-[32px] p-6 border border-slate-100 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase italic tracking-tighter text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" /> Cambiar Contraseña
            </DialogTitle>
            <DialogDescription className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Escribe tu contraseña actual y la nueva
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-3">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-0.5">Contraseña Actual</label>
              <Input type="password" value={passActual} onChange={e => setPassActual(e.target.value)} className="rounded-xl border-slate-100 bg-slate-50/50 font-bold text-slate-700 text-xs" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-0.5">Nueva Contraseña</label>
              <Input type="password" value={passNuevo} onChange={e => setPassNuevo(e.target.value)} className="rounded-xl border-slate-100 bg-slate-50/50 font-bold text-slate-700 text-xs" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-0.5">Confirmar Nueva Contraseña</label>
              <Input type="password" value={passConfirm} onChange={e => setPassConfirm(e.target.value)} className="rounded-xl border-slate-100 bg-slate-50/50 font-bold text-slate-700 text-xs" />
            </div>
          </div>
          <DialogFooter className="mt-2 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsPassModalOpen(false)} className="rounded-xl border-slate-200 text-slate-500 font-bold text-[10px] uppercase px-5">
              Cancelar
            </Button>
            <Button onClick={cambiarPassword} disabled={isCambiandoPass} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase px-5">
              {isCambiandoPass ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Guardando</> : "Actualizar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL CONFIGURACIÓN */}
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
                className="rounded-xl border-slate-100 bg-slate-50/50 font-bold text-slate-700 text-xs focus:ring-2 focus:ring-emerald-500/20 animate-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-0.5">Teléfono Móvil</label>
              <Input 
                type="text" 
                value={editTelefono} 
                onChange={(e) => setEditTelefono(e.target.value)}
                placeholder="Ej: 3123456789"
                className="rounded-xl border-slate-100 bg-slate-50/50 font-bold text-slate-700 text-xs focus:ring-2 focus:ring-emerald-500/20 animate-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-0.5">Dirección en Pereira</label>
              <Input 
                type="text" 
                value={editDireccion} 
                onChange={(e) => setEditDireccion(e.target.value)}
                placeholder="Ej: Calle 20 # 5-12"
                className="rounded-xl border-slate-100 bg-slate-50/50 font-bold text-slate-700 text-xs focus:ring-2 focus:ring-emerald-500/20 animate-none"
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
// SUB-COMPONENTE INTERNO: CALIFICACIÓN INTERACTIVA (CON CORRECCIÓN DE BACKTICKS)
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
      // LLAMADA REPARADA: Interpolación de variables con backticks correctos (``)
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