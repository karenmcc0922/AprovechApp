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
      // Credenciales demo del repartidor (hardcodeadas — no está en la DB)
      if (role === "driver") {
        if (email === "repartidor@aprovechapp.com" && password === "repartidor2025") {
          localStorage.setItem("usuario", JSON.stringify({ id: 99, nombre: "Repartidor Demo", role: "driver", correo: email }));
          localStorage.setItem("user_role", "driver");
          window.location.href = "/repartidor";
        } else {
          alert("Credenciales incorrectas. Usa: repartidor@aprovechapp.com / repartidor2025");
        }
        setLoading(false);
        return;
      }

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

  const roleThemes = {
    user: {
      bgGradient: "from-emerald-100 via-teal-50/60 to-white",
      accent: "text-emerald-600",
      bgAccent: "bg-emerald-600 hover:bg-emerald-700",
      glow: "bg-emerald-400/40",
      ring: "focus:ring-emerald-500/30",
      border: "focus:border-emerald-500",
      inputFocusBg: "focus:bg-emerald-50/30",
    },
    vendor: {
      bgGradient: "from-orange-100 via-amber-50/60 to-white",
      accent: "text-orange-600",
      bgAccent: "bg-orange-600 hover:bg-orange-700",
      glow: "bg-orange-400/40",
      ring: "focus:ring-orange-500/30",
      border: "focus:border-orange-500",
      inputFocusBg: "focus:bg-orange-50/30",
    },
    driver: {
      bgGradient: "from-blue-100 via-indigo-50/60 to-white",
      accent: "text-blue-600",
      bgAccent: "bg-blue-600 hover:bg-blue-700",
      glow: "bg-blue-400/40",
      ring: "focus:ring-blue-500/30",
      border: "focus:border-blue-500",
      inputFocusBg: "focus:bg-blue-50/30",
    },
  };

  const theme = roleThemes[role];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bgGradient} flex items-center justify-center p-4 sm:p-6 relative overflow-hidden transition-all duration-700`}>

      <div className={`absolute top-[-5%] left-[-5%] w-[450px] h-[450px] rounded-full ${theme.glow} blur-[90px] transition-all duration-1000 animate-pulse`} />
      <div className={`absolute bottom-[-5%] right-[-5%] w-[450px] h-[450px] rounded-full ${theme.glow} blur-[90px] transition-all duration-1000 delay-300 animate-pulse`} />

      <div className="w-full max-w-md z-10">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white shadow-[0_12px_30px_rgba(0,0,0,0.08)] rounded-2xl mb-4 p-3 border border-white transform hover:scale-105 transition-all duration-300">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Aprovech<span className={`${theme.accent} font-black transition-colors duration-500`}>App</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1.5 font-bold tracking-[0.15em] uppercase">Menos desperdicio • Más ahorro</p>
        </div>

        <Card className="border border-white/60 shadow-[0_30px_70px_rgba(0,0,0,0.08)] rounded-[36px] bg-white/70 backdrop-blur-xl overflow-hidden transition-all duration-500">
          <CardHeader className="pt-9 pb-2 px-8 text-center">
            <CardTitle className="text-xl font-extrabold text-slate-800 tracking-tight">
              ¡Hola, bienvenido!
            </CardTitle>
            <p className="text-slate-500 text-xs font-semibold mt-1">Elige tu rol e ingresa tus credenciales</p>
          </CardHeader>

          <CardContent className="px-8 pb-9 pt-4">

            <div className="flex p-1.5 bg-slate-200/50 backdrop-blur-sm rounded-2xl mb-6 border border-slate-300/30">
              <button
                type="button"
                onClick={() => setRole("user")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs transition-all duration-300 ${
                  role === "user"
                    ? "bg-white shadow-md text-emerald-600 scale-[1.02]"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <User size={15} />
                <span>Rescatista</span>
              </button>

              <button
                type="button"
                onClick={() => setRole("vendor")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs transition-all duration-300 ${
                  role === "vendor"
                    ? "bg-white shadow-md text-orange-600 scale-[1.02]"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Store size={15} />
                <span>Comercio</span>
              </button>

              <button
                type="button"
                onClick={() => setRole("driver")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs transition-all duration-300 ${
                  role === "driver"
                    ? "bg-white shadow-md text-blue-600 scale-[1.02]"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Bike size={15} />
                <span>Repartidor</span>
              </button>
            </div>

            {/* Hint de credenciales demo del repartidor */}
            {role === "driver" && (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 mb-4 text-xs text-blue-700 font-medium space-y-0.5">
                <p className="font-bold text-blue-800">Credenciales demo:</p>
                <p>📧 repartidor@aprovechapp.com</p>
                <p>🔑 repartidor2025</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 ml-1">Correo Electrónico</label>
                <div className="relative group">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:${theme.accent} transition-colors`} />
                  <input
                    type="email"
                    required
                    placeholder="ejemplo@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-11 pr-4 py-3.5 bg-white/80 border border-slate-200 rounded-xl text-slate-800 text-sm outline-none transition-all placeholder:text-slate-400 font-medium shadow-sm ${theme.border} focus:ring-4 ${theme.ring} ${theme.inputFocusBg}`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-bold text-slate-600">Contraseña</label>
                  <Link href="/recuperar" className={`text-xs font-bold ${theme.accent} hover:underline transition-colors`}>
                    ¿La olvidaste?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:${theme.accent} transition-colors`} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-11 pr-11 py-3.5 bg-white/80 border border-slate-200 rounded-xl text-slate-800 text-sm outline-none transition-all placeholder:text-slate-400 font-medium shadow-sm ${theme.border} focus:ring-4 ${theme.ring} ${theme.inputFocusBg}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="pt-3">
                <Button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-6 rounded-xl ${theme.bgAccent} text-white text-sm font-bold transition-all duration-300 shadow-md flex items-center justify-center gap-2 group disabled:opacity-70`}
                >
                  {loading ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : (
                    <>
                      <span>Ingresar a la plataforma</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </Button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={cargarDemoRepartidor}
                  className="text-[10px] bg-slate-100 hover:bg-slate-200/80 text-slate-600 px-3 py-1.5 rounded-lg font-bold tracking-wide transition-all border border-slate-200/40"
                >
                  ⚡ Ingreso Rápido: Repartidor Demo
                </button>
              </div>

              <div className="text-center mt-6 pt-4 border-t border-slate-200/60">
                <p className="text-xs text-slate-500 font-semibold">
                  ¿Nuevo en AprovechApp?{" "}
                  <Link href="/" className={`font-bold ${theme.accent} hover:underline transition-colors ml-0.5`}>
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
