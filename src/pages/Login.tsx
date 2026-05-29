import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Mail, Eye, EyeOff, Loader2, User, Store, ArrowRight, Bike } from "lucide-react";

export default function Login() {
  const [,] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"user" | "vendor" | "repartidor">("user");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Credenciales demo del repartidor (hardcodeadas para la demo)
      if (role === "repartidor") {
        if (email === "repartidor@aprovechapp.com" && password === "repartidor2025") {
          localStorage.setItem("usuario", JSON.stringify({ id: 99, nombre: "Repartidor Demo", role: "repartidor", correo: email }));
          localStorage.setItem("user_role", "repartidor");
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-emerald-50/30 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md transition-all duration-300">
        
        {/* Encabezado Principal / Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white shadow-md rounded-2xl mb-4 p-2.5 border border-slate-100">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-full h-full object-contain" 
            />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Aprovech<span className="text-emerald-600 font-extrabold">App</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1 font-medium tracking-wide">Menos desperdicio, más ahorro</p>
        </div>

        {/* Tarjeta de Formulario Principal */}
        <Card className="border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-3xl overflow-hidden bg-white">
          <CardHeader className="pt-8 pb-4 px-8 text-center">
            <CardTitle className="text-xl font-bold text-slate-800 tracking-tight">
              Iniciar Sesión
            </CardTitle>
            <p className="text-slate-400 text-sm mt-1">Ingresa tus datos para continuar</p>
          </CardHeader>

          <CardContent className="px-8 pb-8 pt-2">
            
            {/* Selector de Rol Dinámico */}
            <div className="flex p-1 bg-slate-100/80 backdrop-blur-sm rounded-2xl mb-6 border border-slate-200/40">
              <button
                type="button"
                onClick={() => setRole("user")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200 ${
                  role === "user"
                    ? "bg-white shadow-sm text-emerald-600 border border-slate-200/20"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <User size={15} />
                <span>Rescatista</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("vendor")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200 ${
                  role === "vendor"
                    ? "bg-white shadow-sm text-emerald-600 border border-slate-200/20"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Store size={15} />
                <span>Comercio</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("repartidor")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200 ${
                  role === "repartidor"
                    ? "bg-white shadow-sm text-blue-600 border border-slate-200/20"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Bike size={15} />
                <span>Repartidor</span>
              </button>
            </div>

            {/* Hint de credenciales demo del repartidor */}
            {role === "repartidor" && (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 mb-4 text-xs text-blue-700 font-medium space-y-0.5">
                <p className="font-bold text-blue-800">Credenciales demo:</p>
                <p>📧 repartidor@aprovechapp.com</p>
                <p>🔑 repartidor2025</p>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleLogin} className="space-y-4">
              
              {/* Input: Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 ml-1">Correo Electrónico</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="email"
                    required
                    placeholder="ejemplo@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50/60 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-400 font-medium"
                  />
                </div>
              </div>

              {/* Input: Contraseña */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-semibold text-slate-600">Contraseña</label>
                  {/* Aquí va el enlace para la tarea de recuperación de tu compañero */}
                  <Link href="/recuperar" className="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline transition-all">
                    ¿La olvidaste?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-3 bg-slate-50/60 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-400 font-medium"
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

              {/* Botón de Enviar */}
              <div className="pt-2">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-6 rounded-xl bg-slate-950 hover:bg-emerald-600 text-white text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-emerald-500/10 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:hover:bg-slate-950"
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

              {/* Enlace de Registro Inferior */}
              <div className="text-center mt-6 pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-500 font-medium">
                  ¿Nuevo en AprovechApp?{" "}
                  <Link href="/" className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline transition-colors ml-0.5">
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