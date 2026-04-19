import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Store, Mail, Lock, MapPin, Loader2, ArrowLeft, ShieldCheck } from "lucide-react";

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

    // Limpieza básica de datos (trim)
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
        // --- SESIÓN ACTUALIZADA ---
        // Guardamos el nombre real devuelto por la DB y el ID único
        localStorage.setItem("user_name", data.aliado.nombre_local);
        localStorage.setItem("user_role", "vendor");
        localStorage.setItem("aliado_id", data.aliado.id.toString());
        
        // Redirigimos
        setLocation("/aliado");
      } else {
        // Si el backend envió un error (ej: NIT duplicado)
        alert(data.error || "Error: No se pudo crear la cuenta del comercio.");
      }
    } catch (error) {
      console.error("Error en Fetch:", error);
      alert("Error de conexión. Asegúrate de que el backend en Render esté encendido.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Link href="/">
          <div className="inline-flex items-center text-slate-400 hover:text-slate-600 mb-6 font-bold transition-colors cursor-pointer">
            <ArrowLeft className="w-4 h-4 mr-2" /> Volver al inicio
          </div>
        </Link>

        <Card className="border-none shadow-2xl rounded-[40px] bg-white overflow-hidden">
          <div className="bg-green-700 p-8 text-white text-center">
            <Store className="w-12 h-12 mx-auto mb-4 opacity-80" />
            <h1 className="text-3xl font-black italic tracking-tighter">REGISTRO ALIADO</h1>
            <p className="text-green-100 mt-2 font-medium">Únete a la red de rescate de alimentos.</p>
          </div>

          <CardContent className="p-10">
            <form onSubmit={handleRegistro} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nombre Comercial</label>
                  <Input 
                    placeholder="Ej: Pan del Sol" 
                    className="py-6 rounded-xl border-slate-100 focus:border-green-500" 
                    required 
                    value={formData.nombre_local}
                    onChange={(e) => setFormData({...formData, nombre_local: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">NIT / ID</label>
                  <Input 
                    placeholder="123456789-0" 
                    className="py-6 rounded-xl border-slate-100" 
                    required 
                    value={formData.nit}
                    onChange={(e) => setFormData({...formData, nit: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Email Corporativo</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                  <Input 
                    type="email" 
                    placeholder="contacto@empresa.com" 
                    className="pl-11 py-6 rounded-xl border-slate-100" 
                    required 
                    value={formData.correo}
                    onChange={(e) => setFormData({...formData, correo: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Dirección Física</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                  <Input 
                    placeholder="Calle 10 #20-30, Ciudad" 
                    className="pl-11 py-6 rounded-xl border-slate-100" 
                    required 
                    value={formData.direccion}
                    onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-11 py-6 rounded-xl border-slate-100" 
                    required 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full py-8 rounded-[24px] bg-green-700 hover:bg-green-800 text-white text-lg font-black transition-all shadow-xl shadow-green-100 mt-4"
              >
                {loading ? <Loader2 className="animate-spin" /> : "ACTIVAR CUENTA COMERCIAL 🚀"}
              </Button>

              <div className="flex items-center justify-center gap-2 text-slate-400">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <p className="text-[9px] font-bold uppercase tracking-widest">Base de Datos Protegida en TiDB Cloud</p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}