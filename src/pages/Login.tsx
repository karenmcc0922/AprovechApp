import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Mail, Eye, EyeOff, Loader2, User, Store, ArrowRight } from "lucide-react";

export default function Login() {
  const [,] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"user" | "vendor">("user");

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

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        
        {/* Logo y Eslogan */}
        <div className="text-center mb-10">
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="w-16 h-16 mx-auto mb-4 drop-shadow-xl object-contain" 
          />
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">
            Aprovech<span className="text-green-600">App</span>
          </h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">Menos desperdicio, más ahorro</p>
        </div>

        <Card className="border-none shadow-[0_32px_64px_-15px_rgba(0,0,0,0.08)] rounded-[45px] overflow-hidden bg-white">
          <CardHeader className="p-10 pb-2">
            <CardTitle className="text-2xl font-black text-slate-800 text-center uppercase tracking-tighter italic">
              Bienvenido
            </CardTitle>
            <p className="text-center text-slate-400 text-xs font-bold uppercase mt-2">Ingresa tus credenciales</p>
          </CardHeader>

          <CardContent className="p-10">
            {/* Selector de Rol Moderno */}
            <div className="flex gap-2 p-1.5 bg-slate-100 rounded-3xl mb-8">
              <button
                type="button"
                onClick={() => setRole("user")}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[22px] font-black text-[10px] uppercase tracking-widest transition-all ${
                  role === "user" 
                  ? "bg-white shadow-md text-green-600 scale-[1.02]" 
                  : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <User size={14} /> Rescatista
              </button>
              <button
                type="button"
                onClick={() => setRole("vendor")}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[22px] font-black text-[10px] uppercase tracking-widest transition-all ${
                  role === "vendor" 
                  ? "bg-white shadow-md text-green-600 scale-[1.02]" 
                  : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <Store size={14} /> Comercio
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-4">
                {/* Email Input */}
                <div className="group relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 group-focus-within:text-green-600 transition-colors" />
                  <input
                    type="email"
                    required
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-14 pr-5 py-5 bg-slate-50 border-none rounded-[25px] focus:ring-2 focus:ring-green-500/20 outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300"
                  />
                </div>

                {/* Password Input */}
                <div className="group relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 group-focus-within:text-green-600 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-14 pr-14 py-5 bg-slate-50 border-none rounded-[25px] focus:ring-2 focus:ring-green-500/20 outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-green-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="group w-full py-9 rounded-[30px] bg-slate-900 hover:bg-green-600 text-white text-sm font-black transition-all shadow-xl shadow-slate-200 uppercase tracking-widest relative"
                >
                  {loading ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : (
                    <span className="flex items-center gap-3">
                      Entrar ahora
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>
              </div>

              <div className="text-center mt-6">
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight">
                  ¿Nuevo en AprovechApp?{" "}
                  <Link href="/" className="text-green-600 hover:text-green-700 ml-1 transition-colors">
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