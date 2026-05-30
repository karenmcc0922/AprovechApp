import { useState, useEffect } from "react";
import AppNavbar from "../components/AppNavbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Store,
  MapPin,
  Mail,
  Hash,
  ShieldCheck,
  Loader2,
  Clock,
  CheckCircle,
  AlertCircle,
  Camera,
  Save,
  X,
  ChevronRight,
  Edit2,
  Users,
  CreditCard,
  Bell
} from "lucide-react";
import { toast } from "sonner";
import { API_BASE } from "../lib/api";

export default function PerfilAliado() {
  const aliadoId = localStorage.getItem("aliado_id");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [perfil, setPerfil] = useState({
    nombre_local: "",
    nit: "",
    correo_corporativo: "",
    direccion: "",
  });

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/aliados/${aliadoId}/panel-privado`);
        if (response.ok) {
          const data = await response.json();
          setPerfil({
            nombre_local: data.nombre_local || "",
            nit: data.nit || "",
            correo_corporativo: data.correo_corporativo || "",
            direccion: data.direccion || ""
          });
        }
      } catch (error) {
        console.error("Error cargando perfil:", error);
      } finally {
        setLoading(false);
      }
    };
    if (aliadoId) fetchPerfil();
  }, [aliadoId]);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const response = await fetch(`${API_BASE}/api/aliados/${aliadoId}/actualizar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre_local: perfil.nombre_local,
          direccion: perfil.direccion
        }),
      });

      if (!response.ok) throw new Error("Error en servidor");

      setEditMode(false);
      toast.success("¡Información actualizada con éxito! 🥑");
    } catch (error) {
      toast.error("Error al conectar con el servidor o actualizar datos");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white gap-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30 pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="relative">
          <Loader2 className="animate-spin text-green-600 w-16 h-16" />
          <Store className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-300 w-6 h-6" />
        </div>
        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] animate-pulse">Sincronizando establecimiento...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      <AppNavbar />

      {/* REJILLA TECNOLÓGICA SUTIL */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

      {/* HALOS DE LUZ AMBIENTAL */}
      <div className="absolute top-[-5%] left-[-5%] w-[500px] h-[500px] rounded-full bg-emerald-100/30 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-5%] w-[450px] h-[450px] rounded-full bg-blue-100/20 blur-[130px] pointer-events-none" />

      <main className="flex-grow container mx-auto px-6 pt-32 pb-20 max-w-6xl relative z-10">

        {/* HERO BANNER */}
        <div className="relative h-64 w-full bg-slate-900 rounded-[50px] mb-20 overflow-hidden shadow-[0_30px_60px_rgba(15,23,42,0.12)]">
          <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1556742044-3c52d6e88c62?q=80&w=2070')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />

          <div className="absolute -bottom-10 left-12 flex items-end gap-8">
            <div className="relative group">
              <div className="h-44 w-44 bg-white rounded-[40px] shadow-[0_15px_40px_rgba(0,0,0,0.08)] flex items-center justify-center border-[8px] border-white overflow-hidden relative">
                <div className="bg-green-50 w-full h-full flex items-center justify-center">
                  <Store className="w-20 h-20 text-green-600" />
                </div>
              </div>
              <button className="absolute bottom-2 right-2 bg-slate-900 text-white p-3 rounded-2xl shadow-xl hover:bg-green-600 transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0">
                <Camera size={18} />
              </button>
            </div>

            <div className="mb-14">
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
                {perfil.nombre_local || "Mi Local"}
              </h1>
              <div className="flex items-center gap-3 mt-4">
                <span className="flex items-center gap-1.5 bg-green-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest shadow-lg shadow-green-500/20">
                  <CheckCircle className="w-3 h-3" /> VERIFICADO
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md text-white/80 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest border border-white/10">
                  <MapPin className="w-3 h-3" /> {perfil.direccion ? perfil.direccion.split(',')[0] : "Dirección no asignada"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT SIDEBAR ── */}
          <div className="space-y-4">
            {/* Legal info */}
            <Card className="border border-slate-200 rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <ShieldCheck size={13} className="text-green-600" /> Información legal
              </p>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-medium uppercase tracking-wide block mb-1">Número de NIT</label>
                  <p className="text-slate-900 font-bold flex items-center gap-2 text-sm">
                    <Hash className="w-4 h-4 text-green-600" /> {perfil.nit || "Pendiente"}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-medium uppercase tracking-wide block mb-1">E-mail corporativo</label>
                  <p className="text-slate-900 font-bold flex items-center gap-2 text-sm break-all">
                    <Mail className="w-4 h-4 text-green-600 shrink-0" /> {perfil.correo_corporativo || "No registrado"}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2.5 rounded-xl font-semibold text-xs">
                    <ShieldCheck className="w-4 h-4" /> Aliado estratégico
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5">Gracias por ser parte del cambio y ayudar a reducir el desperdicio de alimentos.</p>
                </div>
              </div>
            </Card>

            {/* Alert */}
            <Card className="border border-indigo-200 bg-indigo-950 rounded-3xl p-5 text-white">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-xs text-indigo-300 uppercase tracking-wider">Atención</h3>
              </div>
              <p className="text-sm text-indigo-100/90 leading-relaxed">
                ¿Vas a cambiar de dirección? Recuerda avisar a tus rescatistas frecuentes para que no pierdan tus ofertas.
              </p>
              <button className="mt-3 bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors w-full">
                Actualizar dirección
              </button>
            </Card>
          </div>

          {/* ── MAIN CONTENT ── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Settings navigation */}
            <Card className="border border-slate-200 rounded-3xl bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900">Ajustes del perfil</h2>
                <p className="text-xs text-slate-500 mt-0.5">Gestiona tu información y preferencias en la app.</p>
              </div>
              <div className="divide-y divide-slate-100">
                {[
                  { icon: <Edit2 size={15} className="text-green-600"/>, title: "Editar perfil", sub: "Actualiza la información de tu negocio" },
                  { icon: <Users size={15} className="text-green-600"/>, title: "Usuarios y accesos", sub: "Administra quién puede acceder" },
                  { icon: <CreditCard size={15} className="text-green-600"/>, title: "Métodos de pago", sub: "Gestiona tus métodos de cobro" },
                  { icon: <Bell size={15} className="text-green-600"/>, title: "Notificaciones", sub: "Configura tus preferencias" },
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={i === 0 ? () => setEditMode(true) : undefined}
                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors text-left group"
                  >
                    <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                      <p className="text-xs text-slate-500 truncate">{item.sub}</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </Card>

            {/* Store details */}
            <Card className="border border-slate-200 rounded-3xl bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Detalles de tu local</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Esta información será visible para los rescatistas en el mapa.</p>
                </div>
                {!editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-green-600 hover:text-green-700 transition-colors"
                  >
                    <Edit2 size={12}/> Editar información
                  </button>
                )}
              </div>

              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Nombre comercial</label>
                    <Input
                      disabled={!editMode}
                      value={perfil.nombre_local}
                      onChange={(e) => setPerfil({...perfil, nombre_local: e.target.value})}
                      className={`rounded-xl border-slate-200 font-semibold text-slate-800 h-10 transition-all ${
                        editMode ? "bg-white ring-2 ring-green-500/20" : "bg-slate-50 text-slate-600"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Código interno</label>
                    <div className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 font-mono text-xs flex items-center justify-between">
                      <span>ALI-{aliadoId ? aliadoId.padStart(4, '0') : "0000"}</span>
                      <Clock size={13} className="opacity-40" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                      <MapPin size={11} className="inline mr-1 text-green-600"/>Punto de recogida principal
                    </label>
                    <Input
                      disabled={!editMode}
                      value={perfil.direccion}
                      onChange={(e) => setPerfil({...perfil, direccion: e.target.value})}
                      className={`rounded-xl border-slate-200 font-semibold text-slate-800 h-10 transition-all ${
                        editMode ? "bg-white ring-2 ring-green-500/20" : "bg-slate-50 text-slate-600"
                      }`}
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      <MapPin size={9} className="inline mr-0.5" />{perfil.direccion || "Sin dirección"}, Pereira, Risaralda
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                      <Clock size={11} className="inline mr-1 text-green-600"/>Horario de atención
                    </label>
                    <div className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-center font-semibold">
                      Lunes a sábado · 7:00 a. m. – 6:00 p. m.
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400">
                    📍 Esta dirección será visible para todos los rescatistas en el mapa principal.
                  </p>
                </div>

                {/* Mini map placeholder */}
                <div className="bg-slate-100 rounded-2xl overflow-hidden min-h-[160px] flex items-center justify-center border border-slate-200">
                  <div className="text-center">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
                      <MapPin size={18} className="text-white" />
                    </div>
                    <p className="text-xs text-slate-500 font-semibold">Mapa de ubicación</p>
                    <p className="text-[10px] text-slate-400">Pereira, Risaralda</p>
                  </div>
                </div>
              </div>

              {editMode && (
                <div className="px-6 pb-6 flex gap-3">
                  <Button
                    disabled={updating}
                    onClick={() => setEditMode(false)}
                    variant="outline"
                    className="flex-1 rounded-xl border-slate-200 font-semibold text-slate-500 h-10 gap-2"
                  >
                    <X size={15}/> Cancelar
                  </Button>
                  <Button
                    disabled={updating}
                    onClick={handleUpdate}
                    className="flex-[2] bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-sm h-10 gap-2 shadow-sm transition-all"
                  >
                    {updating ? <Loader2 className="animate-spin w-4 h-4"/> : <><Save size={15}/> Guardar configuración</>}
                  </Button>
                </div>
              )}
            </Card>

            {/* Bottom CTA Banner */}
            <div className="bg-green-900 rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-4 text-white">
              <div className="flex-1">
                <h3 className="text-base font-black">¡Gracias por ser parte del cambio! 💚</h3>
                <p className="text-sm text-green-200 mt-1">Juntos reducimos el desperdicio de alimentos y construimos un futuro más sostenible.</p>
              </div>
              <button className="bg-white text-green-900 font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-green-50 transition-colors shrink-0 gap-2 flex items-center">
                🌿 Ver mi impacto
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}