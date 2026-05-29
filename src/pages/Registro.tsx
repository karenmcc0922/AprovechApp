import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Mail, Eye, EyeOff, Loader2, User, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { API_BASE } from "../lib/api";

export default function Registro() {
  const [, setLocation] = useLocation();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exito, setExito] = useState(false);
  const [esPionero, setEsPionero] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast.error("Las contraseñas no coinciden"); return; }
    if (password.length < 6) { toast.error("La contraseña debe tener al menos 6 caracteres"); return; }

    setLoading(true);
    try {
      // Paso 1: pre-registro (obtiene estado pionero)
      const res1 = await fetch(`${API_BASE}/api/registro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, correo: email }),
      });
      const data1 = await res1.json();
      if (!res1.ok) { toast.error(data1.error || "Error en el registro"); return; }

      // Paso 2: completar perfil con contraseña
      const res2 = await fetch(`${API_BASE}/api/completar-perfil`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, telefono: "", direccion: "", municipio: "Pereira", departamento: "Risaralda", pais: "Colombia", fechaNacimiento: "" }),
      });
      if (!res2.ok) { toast.error("Error al guardar tu perfil"); return; }

      setEsPionero(data1.pionero === true);
      setExito(true);
    } catch {
      toast.error("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (exito) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[40px] shadow-2xl p-12 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-emerald-50 rounded-[28px] flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-3">
            ¡Bienvenido, {nombre}!
          </h2>
          {esPionero ? (
            <p className="text-emerald-600 font-bold text-sm mb-6">
              🎉 Eres uno de nuestros primeros usuarios — tus beneficios pionero están activados (15% dto + domicilio gratis en tu primera compra).
            </p>
          ) : (
            <p className="text-slate-500 font-bold text-sm mb-6">
              Tu cuenta ha sido creada exitosamente. ¡Ya puedes explorar los rescates disponibles!
            </p>
          )}
          <Button onClick={() => setLocation("/login")} className="w-full bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl py-6 font-black uppercase text-xs tracking-widest transition-all">
            Ir al Login <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-teal-50/60 to-white flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute top-[-5%] left-[-5%] w-[450px] h-[450px] rounded-full bg-emerald-400/30 blur-[90px] animate-pulse" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[450px] h-[450px] rounded-full bg-emerald-400/30 blur-[90px] animate-pulse delay-300" />

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white shadow-lg rounded-2xl mb-4 p-3">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Aprovech<span className="text-emerald-600 font-black">App</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1.5 font-bold tracking-[0.15em] uppercase">Crear cuenta nueva</p>
        </div>

        <Card className="border border-white/60 shadow-[0_30px_70px_rgba(0,0,0,0.08)] rounded-[36px] bg-white/70 backdrop-blur-xl overflow-hidden">
          <CardHeader className="pt-9 pb-2 px-8 text-center">
            <CardTitle className="text-xl font-extrabold text-slate-800 tracking-tight">Registro</CardTitle>
            <p className="text-slate-500 text-xs font-semibold mt-1">Llena tus datos para unirte</p>
          </CardHeader>
          <CardContent className="px-8 pb-9 pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Nombre completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input type="text" required placeholder="Tu nombre" value={nombre} onChange={e => setNombre(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-white/80 border border-slate-200 rounded-xl text-slate-800 text-sm outline-none transition-all placeholder:text-slate-400 font-medium focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Correo electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input type="email" required placeholder="ejemplo@correo.com" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-white/80 border border-slate-200 rounded-xl text-slate-800 text-sm outline-none transition-all placeholder:text-slate-400 font-medium focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input type={showPass ? "text" : "password"} required placeholder="Mínimo 6 caracteres" value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-3.5 bg-white/80 border border-slate-200 rounded-xl text-slate-800 text-sm outline-none transition-all placeholder:text-slate-400 font-medium focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Confirmar contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input type="password" required placeholder="Repite tu contraseña" value={confirm} onChange={e => setConfirm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-white/80 border border-slate-200 rounded-xl text-slate-800 text-sm outline-none transition-all placeholder:text-slate-400 font-medium focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20" />
                </div>
              </div>

              <div className="pt-3">
                <Button type="submit" disabled={loading} className="w-full py-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 group disabled:opacity-70">
                  {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <><span>Crear mi cuenta</span><ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>}
                </Button>
              </div>

              <div className="text-center pt-4 border-t border-slate-200/60">
                <p className="text-xs text-slate-500 font-semibold">
                  ¿Ya tienes cuenta?{" "}
                  <Link href="/login" className="font-bold text-emerald-600 hover:underline">Inicia sesión</Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
