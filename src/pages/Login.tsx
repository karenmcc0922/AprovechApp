import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Mail, Eye, EyeOff, Loader2, User, Store, Bike, ArrowRight } from "lucide-react";

export default function Login() {
  const [,] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"user" | "vendor" | "driver">("user");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("https://aprovechapp-api.onrender.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: email, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        const usuarioParaAlmacenar = {
          id: data.usuario.id,
          nombre: data.usuario.nombre,
          role: data.usuario.role,
          correo: email
        };

        localStorage.setItem("usuario", JSON.stringify(usuarioParaAlmacenar));
        localStorage.setItem("user_name", data.usuario.nombre);
        localStorage.setItem("user_role", data.usuario.role);
        localStorage.setItem("aliado_id", data.usuario.id.toString());

        if (data.usuario.role === "vendor") {
          window.location.href = "/aliado";
        } else if (data.usuario.role === "driver") {
          window.location.href = "/repartidor";
        } else {
          window.location.href = "/catalog";
        }
      } else {
        alert(data.error || "Credenciales incorrectas");
      }
    } catch (error) {
      console.error("Error en login:", error);
      alert("Error de conexión. Revisa tu internet.");
    } finally {
      setLoading(false);
    }
  };

  const cargarDemoRepartidor = () => {
    setRole("driver");
    setEmail("repartidor@aprovechapp.com");
    setPassword("repartidor2025");
  };

  // 🎨 Identidad Visual: Blanco Premium con Acentos Dinámicos
  const roleThemes = {
    user: {
      accent: "text-emerald-600",
      bgAccent: "bg-emerald-600",
      glow: "bg-emerald-200/40",
      ring: "focus:ring-emerald-500/20",
      border: "focus:border-emerald-500",
    },
    vendor: {
      accent: "text-orange-500",
      bgAccent: "bg-orange-500",
      glow: "bg-orange-200/40",
      ring: "focus:ring-orange-500/20",
      border: "focus:border-orange-500",
    },
    driver: {
      accent: "text-blue-500",
      bgAccent: "bg-blue-500",
      glow: "bg-blue-200/40",
      ring: "focus:ring-blue-500/20",
      border: "focus:border-blue-500",
    },
  };

  const theme = roleThemes[role];

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6 relative overflow-hidden transition-colors duration-700">
      
      {/* 🟢 Fondo con "Auras" dinámicas (Mantienen el blanco pero dan vida) */}
      <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full ${theme.glow} blur-[120px] transition-all duration-1000 animate-pulse`} />
      <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full ${theme.glow} blur-[120px] transition-all duration-1000 delay-500 animate-pulse`} />

      <div className="w-full max-w-md z-10">
        
        {/* Branding Minimalista */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.05)] rounded-2xl mb-5 p-3 border border-slate-100 transform hover:rotate-3 transition-transform">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Aprovech<span className={`${theme.accent} transition-colors duration-500`}>App</span>
          </h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Menos desperdicio • Más ahorro</p>
        </div>

        {/* Tarjeta Premium White Glass */}
        <Card className="border border-white shadow-[0_20px_50px_rgba(0,0,0,0.06)] rounded-[40px] bg-white/80 backdrop-blur-md overflow-hidden">
          <CardHeader className="pt-10 pb-2 px-8 text-center">
            <CardTitle className="text-2xl font-bold text-slate-800 tracking-tight">
              Bienvenido
            </CardTitle>
            <p className="text-slate-400 text-xs font-medium mt-1 uppercase tracking-wider">Identifícate para continuar</p>
          </CardHeader>

          <CardContent className="px-10 pb-10 pt-4">
            
            {/* Selector de Rol Moderno (Píldora) */}
            <div className="flex p-1.5 bg-slate-50 rounded-[24px] mb-8 border border-slate-100">
              <button
                type="button"
                onClick={() => setRole("user")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[18px] font-bold text-[11px] uppercase transition-all duration-300 ${
                  role === "user" 
                    ? `bg-white shadow-md ${theme.accent} scale-[1.03]` 
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <User size={14} /> Rescatista
              </button>
              
              <button
                type="button"
                onClick={() => setRole("vendor")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[18px] font-bold text-[11px] uppercase transition-all duration-300 ${
                  role === "vendor" 
                    ? `bg-white shadow-md ${theme.accent} scale-[1.03]` 
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <Store size={14} /> Comercio
              </button>

              <button
                type="button"
                onClick={() => setRole("driver")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[18px] font-bold text-[11px] uppercase transition-all duration-300 ${
                  role === "driver" 
                    ? `bg-white shadow-md ${theme.accent} scale-[1.03]` 
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <Bike size={14} /> Repartidor
              </button>
            </div>

            {/* Formulario Estilizado */}
            <form onSubmit={handleLogin} className="space-y-5">
              
              <div className="group relative">
                <Mail className={`absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 group-focus-within:${theme.accent} transition-colors`} />
                <input
                  type="email"
                  required
                  placeholder="Tu correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-14 pr-5 py-5 bg-slate-50 border border-transparent rounded-[25px] font-bold text-slate-700 text-sm outline-none transition-all placeholder:text-slate-300 ${theme.border} focus:ring-4 ${theme.ring} focus:bg-white`}
                />
              </div>

              <div className="space-y-2">
                <div className="group relative">
                  <Lock className={`absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 group-focus-within:${theme.accent} transition-colors`} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Tu contraseña secreta"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-14 pr-14 py-5 bg-slate-50 border border-transparent rounded-[25px] font-bold text-slate-700 text-sm outline-none transition-all placeholder:text-slate-300 ${theme.border} focus:ring-4 ${theme.ring} focus:bg-white`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <div className="text-right px-2">
                   <Link href="/recuperar" className={`text-[10px] font-black uppercase tracking-widest ${theme.accent} hover:underline`}>
                      ¿Olvidaste tu contraseña?
                   </Link>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className={`w-full py-9 rounded-[30px] ${theme.bgAccent} hover:opacity-90 text-white text-sm font-black transition-all shadow-xl shadow-slate-100 uppercase tracking-[0.2em] flex items-center justify-center gap-3 group`}
                >
                  {loading ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : (
                    <>
                      <span>Entrar ahora</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </div>

              {/* Botón Demo sutil */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={cargarDemoRepartidor}
                  className="text-[9px] text-slate-300 hover:text-slate-500 font-bold uppercase tracking-widest transition-colors"
                >
                  Modo Repartidor (Demo)
                </button>
              </div>

              <div className="text-center mt-6 pt-6 border-t border-slate-50">
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight">
                  ¿Eres nuevo aquí?{" "}
                  <Link href="/" className={`${theme.accent} hover:opacity-80 ml-1 transition-colors`}>
                    Crea una cuenta
                  </Link>
                </p>
              </div>

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}