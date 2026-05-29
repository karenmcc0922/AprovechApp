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

  // 🎨 Configuración de colores dinámicos según el rol seleccionado
  const roleStyles = {
    user: {
      bgGradient: "from-emerald-500/20 via-teal-500/10 to-slate-900",
      accent: "text-emerald-600",
      accentBg: "bg-emerald-600",
      ring: "focus:ring-emerald-500/20",
      border: "focus:border-emerald-500",
      blobColor: "bg-emerald-400/30",
    },
    vendor: {
      bgGradient: "from-orange-500/20 via-amber-500/10 to-slate-900",
      accent: "text-orange-600",
      accentBg: "bg-orange-600",
      ring: "focus:ring-orange-500/20",
      border: "focus:border-orange-500",
      blobColor: "bg-orange-400/30",
    },
    driver: {
      bgGradient: "from-blue-500/20 via-indigo-500/10 to-slate-900",
      accent: "text-blue-600",
      accentBg: "bg-blue-600",
      ring: "focus:ring-blue-500/20",
      border: "focus:border-blue-500",
      blobColor: "bg-blue-400/30",
    },
  };

  const currentStyle = roleStyles[role];

  return (
    <div className={`min-h-screen bg-slate-950 bg-gradient-to-tr ${currentStyle.bgGradient} flex items-center justify-center p-4 sm:p-6 relative overflow-hidden transition-all duration-700`}>
      
      {/* 🔮 Círculos de luz orgánicos difuminados en el fondo (Abstract Blobs) */}
      <div className={`absolute -top-20 -left-20 w-72 h-72 rounded-full ${currentStyle.blobColor} blur-[80px] transition-all duration-700 animate-pulse`} />
      <div className={`absolute -bottom-20 -right-20 w-82 h-82 rounded-full ${currentStyle.blobColor} blur-[100px] transition-all duration-700 delay-300 animate-pulse`} />

      <div className="w-full max-w-md z-10 transition-all duration-300">
        
        {/* Encabezado Principal / Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/90 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.2)] rounded-2xl mb-4 p-3 border border-white/20 transform hover:scale-105 transition-transform">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-full h-full object-contain" 
            />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-sm">
            Aprovech<span className={`${currentStyle.accent} font-black transition-colors duration-500`}>App</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1 font-medium tracking-widest uppercase">Menos desperdicio, más ahorro</p>
        </div>

        {/* Tarjeta de Formulario con efecto de Cristal Premium */}
        <Card className="border border-white/10 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.5)] rounded-[32px] overflow-hidden bg-slate-900/80 backdrop-blur-xl">
          <CardHeader className="pt-8 pb-3 px-8 text-center">
            <CardTitle className="text-xl font-bold text-white tracking-tight">
              ¡Hola de nuevo!
            </CardTitle>
            <p className="text-slate-400 text-xs mt-1">Selecciona tu perfil e ingresa tus datos</p>
          </CardHeader>

          <CardContent className="px-8 pb-8 pt-2">
            
            {/* Selector de Rol Dinámico con 3 Opciones Estilizadas */}
            <div className="flex p-1 bg-slate-950/60 backdrop-blur-sm rounded-2xl mb-6 border border-white/5">
              <button
                type="button"
                onClick={() => setRole("user")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl font-bold text-[11px] transition-all duration-300 ${
                  role === "user" 
                    ? "bg-white shadow-lg text-slate-950 scale-[1.02]" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <User size={14} className={role === "user" ? "text-emerald-600" : ""} /> 
                <span>Rescatista</span>
              </button>
              
              <button
                type="button"
                onClick={() => setRole("vendor")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl font-bold text-[11px] transition-all duration-300 ${
                  role === "vendor" 
                    ? "bg-white shadow-lg text-slate-950 scale-[1.02]" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Store size={14} className={role === "vendor" ? "text-orange-600" : ""} /> 
                <span>Comercio</span>
              </button>

              <button
                type="button"
                onClick={() => setRole("driver")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl font-bold text-[11px] transition-all duration-300 ${
                  role === "driver" 
                    ? "bg-white shadow-lg text-slate-950 scale-[1.02]" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Bike size={14} className={role === "driver" ? "text-blue-600" : ""} /> 
                <span>Repartidor</span>
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleLogin} className="space-y-4">
              
              {/* Input: Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 ml-1">Correo Electrónico</label>
                <div className="relative group">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 group-focus-within:${currentStyle.accent} transition-colors`} />
                  <input
                    type="email"
                    required
                    placeholder="ejemplo@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-11 pr-4 py-3.5 bg-slate-950/40 border border-white/10 rounded-xl text-white text-sm focus:bg-slate-950/80 ${currentStyle.border} focus:ring-4 ${currentStyle.ring} outline-none transition-all placeholder:text-slate-600 font-medium`}
                  />
                </div>
              </div>

              {/* Input: Contraseña */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-semibold text-slate-300">Contraseña</label>
                  <Link href="/recuperar" className={`text-xs font-semibold ${currentStyle.accent} hover:underline transition-all`}>
                    ¿La olvidaste?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 group-focus-within:${currentStyle.accent} transition-colors`} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-11 pr-11 py-3.5 bg-slate-950/40 border border-white/10 rounded-xl text-white text-sm focus:bg-slate-950/80 ${currentStyle.border} focus:ring-4 ${currentStyle.ring} outline-none transition-all placeholder:text-slate-600 font-medium`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Botón de Enviar Inteligente */}
              <div className="pt-3">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className={`w-full py-6 rounded-xl ${currentStyle.accentBg} text-slate-950 hover:bg-white text-sm font-bold transition-all duration-300 shadow-xl flex items-center justify-center gap-2 group disabled:opacity-70`}
                >
                  {loading ? (
                    <Loader2 className="animate-spin w-4 h-4 text-slate-950" />
                  ) : (
                    <>
                      <span className="font-extrabold text-white group-hover:text-slate-950 transition-colors">Ingresar a la plataforma</span>
                      <ArrowRight className="w-4 h-4 text-white group-hover:text-slate-950 group-hover:translate-x-0.5 transition-all" />
                    </>
                  )}
                </Button>
              </div>

              {/* Acceso Rápido Demo Repartidor Estilizado */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={cargarDemoRepartidor}
                  className="text-[10px] bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white px-3 py-2 rounded-lg font-medium tracking-wide transition-all border border-white/5"
                >
                  ⚡ Usar credenciales de Repartidor Demo
                </button>
              </div>

              {/* Enlace de Registro Inferior */}
              <div className="text-center mt-6 pt-4 border-t border-white/5">
                <p className="text-xs text-slate-400 font-medium">
                  ¿Nuevo en AprovechApp?{" "}
                  <Link href="/" className={`font-bold ${currentStyle.accent} hover:underline transition-colors ml-0.5`}>
                    Regístrate aquí
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