import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Mail, Eye, EyeOff, Loader2, User, Store } from "lucide-react";

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
        // --- CORRECCIÓN MAESTRA ---
        // Creamos el objeto 'usuario' que el resto de la app (Navbar/Catalog) espera
        const usuarioParaAlmacenar = {
          id: data.usuario.id,
          nombre: data.usuario.nombre,
          role: data.usuario.role, // Usamos el rol que confirma el backend
          correo: email
        };

        // Guardamos el objeto como string (JSON)
        localStorage.setItem("usuario", JSON.stringify(usuarioParaAlmacenar));
        
        // Mantenemos estos por si los usas en otros componentes antiguos
        localStorage.setItem("user_name", data.usuario.nombre);
        localStorage.setItem("user_role", data.usuario.role);
        localStorage.setItem("aliado_id", data.usuario.id.toString());

        // Usamos window.location.href para limpiar la caché de React y forzar
        // que el Navbar lea los nuevos datos del localStorage de inmediato.
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
      alert("Error de conexión con el servidor. Revisa tu internet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">
            Aprovech<span className="text-green-600">App</span> 🥑
          </h1>
          <p className="text-slate-500 font-medium mt-2">Inicia sesión para empezar a rescatar</p>
        </div>

        <Card className="border-none shadow-2xl rounded-[32px] overflow-hidden bg-white">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-2xl font-bold text-slate-800 text-center uppercase tracking-tight">
              Bienvenido de nuevo
            </CardTitle>
          </CardHeader>

          <CardContent className="p-8">
            {/* Selector de Rol */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl mb-8">
              <button
                type="button"
                onClick={() => setRole("user")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                  role === "user" ? "bg-white shadow-sm text-green-700" : "text-slate-500"
                }`}
              >
                <User size={18} /> Rescatista
              </button>
              <button
                type="button"
                onClick={() => setRole("vendor")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                  role === "vendor" ? "bg-white shadow-sm text-green-700" : "text-slate-500"
                }`}
              >
                <Store size={18} /> Comercio
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                {/* Email */}
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                  <input
                    type="email"
                    required
                    placeholder="Tu correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-green-600 outline-none font-medium transition-all"
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-green-600 outline-none font-medium transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-green-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full py-7 rounded-2xl bg-slate-900 hover:bg-green-700 text-white text-lg font-black transition-all shadow-xl border-none cursor-pointer"
              >
                {loading ? <Loader2 className="animate-spin" /> : `Entrar como ${role === 'user' ? 'Rescatista' : 'Comercio'} 🚀`}
              </Button>

              <p className="text-center text-sm text-slate-500 font-medium mt-4">
                ¿Aún no te has unido?{" "}
                <Link href="/" className="text-green-600 font-bold hover:underline cursor-pointer">
                  Regístrate aquí
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}