import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Store, Mail, Lock, MapPin, Loader2, ArrowLeft, ShieldCheck, Hash } from "lucide-react";
import { toast } from "sonner";

export default function RegistroAliado() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nombre_local: "",
    nit: "",
    correo: "",
    direccion: "",
    password: ""
  });

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const datosAEnviar = {
      nombre_local: formData.nombre_local.trim(),
      nit: formData.nit.trim(),
      correo: formData.correo.trim().toLowerCase(),
      direccion: formData.direccion.trim(),
      password: formData.password
    };

    try {
      const response = await fetch("https://aprovechapp-api.onrender.com/api/registro-aliado", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(datosAEnviar),
      });

      const data = await response.json();

      if (response.ok && data.aliado) {
        // --- SESIÓN UNIFICADA ---
        const sessionData = {
          id: data.aliado.id,
          nombre: data.aliado.nombre_local,
          role: "vendor",
          email: formData.correo
        };

        localStorage.setItem("usuario", JSON.stringify(sessionData));
        window.dispatchEvent(new Event("storage"));
        toast.success("¡Cuenta de aliado comercial creada con éxito! 🥑");
        setLocation("/aliado");
      } else {
        toast.error(data.error || "No se pudo crear la cuenta del comercio.");
      }
    } catch (error) {
      console.error("Error en Fetch:", error);
      toast.error("Error de conexión. Asegúrate de que el servidor esté activo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* REJILLA TECNOLÓGICA SUTIL */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

      {/* HALOS DE LUZ AMBIENTAL */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-100/30 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[450px] h-[450px] rounded-full bg-blue-100/20 blur-[130px] pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        <Link href="/">
          <div className="inline-flex items-center text-slate-400 hover:text-slate-600 mb-6 font-black text-xs uppercase tracking-widest transition-colors cursor-pointer group">
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" /> Volver al inicio
          </div>
        </Link>

        <Card className="border border-slate-100/80 shadow-[0_20px_60px_rgba(0,0,0,0.03)] rounded-[50px] bg-white/90 backdrop-blur-md overflow-hidden">
          
          {/* HEADER MINIMALISTA */}
          <div className="p-12 pb-4 text-center">
            <div className="w-16 h-16 bg-green-50 rounded-[24px] flex items-center justify-center mx-auto mb-5 shadow-sm shadow-green-100/50">
              <Store className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-black italic tracking-tighter uppercase text-slate-900">
              Registro <span className="text-green-600">Aliado</span>
            </h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">
              Únete a la red de rescate de alimentos
            </p>
          </div>

          <CardContent className="p-12 pt-6">
            <form onSubmit={handleRegistro} className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Nombre Comercial</label>
                  <div className="relative">
                    <Store className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                    <Input 
                      placeholder="Ej: Pan del Sol" 
                      className="pl-14 py-7 rounded-[22px] border-none font-bold text-slate-800 bg-slate-50 focus-visible:ring-2 focus-visible:ring-green-500/20 shadow-inner" 
                      required 
                      value={formData.nombre_local}
                      onChange={(e) => setFormData({...formData, nombre_local: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">NIT / ID Comercial</label>
                  <div className="relative">
                    <Hash className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                    <Input 
                      placeholder="123456789-0" 
                      className="pl-14 py-7 rounded-[22px] border-none font-bold text-slate-800 bg-slate-50 focus-visible:ring-2 focus-visible:ring-green-500/20 shadow-inner" 
                      required 
                      value={formData.nit}
                      onChange={(e) => setFormData({...formData, nit: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Email Corporativo</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                  <Input 
                    type="email" 
                    placeholder="contacto@empresa.com" 
                    className="pl-14 py-7 rounded-[22px] border-none font-bold text-slate-800 bg-slate-50 focus-visible:ring-2 focus-visible:ring-green-500/20 shadow-inner" 
                    required 
                    value={formData.correo}
                    onChange={(e) => setFormData({...formData, correo: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Dirección Física de Recogida</label>
                <div className="relative">
                  <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                  <Input 
                    placeholder="Calle 10 #20-30, Ciudad" 
                    className="pl-14 py-7 rounded-[22px] border-none font-bold text-slate-800 bg-slate-50 focus-visible:ring-2 focus-visible:ring-green-500/20 shadow-inner" 
                    required 
                    value={formData.direccion}
                    onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Contraseña de Acceso</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-14 py-7 rounded-[22px] border-none font-bold text-slate-800 bg-slate-50 focus-visible:ring-2 focus-visible:ring-green-500/20 shadow-inner" 
                    required 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full py-8 rounded-[24px] bg-slate-900 hover:bg-green-600 text-white text-xs font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-slate-900/10 active:scale-[0.98] mt-4"
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Activar Cuenta Comercial 🚀"}
              </Button>

              <div className="flex items-center justify-center gap-2 text-slate-400 pt-4 border-t border-slate-50">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <p className="text-[9px] font-black uppercase tracking-[0.15em]">Infraestructura Protegida en TiDB Cloud</p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}