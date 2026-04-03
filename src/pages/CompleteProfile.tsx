import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Lock, User, Calendar, Phone, MapPin, Eye, EyeOff } from "lucide-react";

export default function CompleteProfile() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Estados del formulario
  const [password, setPassword] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [pais, setPais] = useState("Colombia");
  const [departamento, setDepartamento] = useState("Risaralda");
  const [municipio, setMunicipio] = useState("Pereira");
  const [fechaNacimiento, setFechaNacimiento] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");
    if (emailParam) setEmail(emailParam);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("https://aprovechapp-api.onrender.com/api/completar-perfil", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email, password, telefono, direccion, municipio, departamento, pais, fechaNacimiento
        })
      });

      if (response.ok) {
        alert("¡Perfil completado con éxito! 🥑");
        setLocation("/catalog"); 
      } else {
        alert("Error al guardar los datos.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          {/* LOGO SUSTITUIDO */}
          <img 
            src="/logo.png" 
            alt="AprovechApp Logo" 
            className="w-20 h-20 mx-auto mb-4 drop-shadow-lg object-contain"
          />
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
            Aprovech<span className="text-[#FFA832]">App</span>
          </h1>
        </div>

        <Card className="border-none shadow-2xl rounded-[32px] overflow-hidden bg-white">
          <CardHeader className="border-b border-slate-100 p-8">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 border-4 border-green-50">
                <AvatarFallback className="bg-green-100 text-green-700 text-xl font-bold">
                  {email ? email.charAt(0).toUpperCase() : <User />}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl font-bold text-slate-800 tracking-tight">Finalizar Registro</CardTitle>
                <p className="text-sm text-slate-500 font-medium">{email}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* SECCIÓN SEGURIDAD */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Seguridad y Contacto</h3>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Contraseña nueva"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-green-600 outline-none font-medium transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-green-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                  <input
                    type="tel"
                    required
                    placeholder="Número de celular"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-green-600 outline-none font-medium transition-all"
                  />
                </div>
              </div>

              {/* SECCIÓN UBICACIÓN */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Ubicación</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* PAÍS */}
                  <select 
                    value={pais} 
                    onChange={(e) => setPais(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-green-600 outline-none font-medium appearance-none"
                  >
                    <option value="Colombia">Colombia 🇨🇴</option>
                  </select>

                  {/* DEPARTAMENTO */}
                  <select 
                    value={departamento} 
                    onChange={(e) => setDepartamento(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-green-600 outline-none font-medium appearance-none"
                  >
                    <option value="Risaralda">Risaralda</option>
                    <option value="Quindio">Quindío</option>
                    <option value="Caldas">Caldas</option>
                  </select>

                  {/* MUNICIPIO */}
                  <select 
                    value={municipio} 
                    onChange={(e) => setMunicipio(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-green-600 outline-none font-medium appearance-none"
                  >
                    <option value="Pereira">Pereira</option>
                    <option value="Dosquebradas">Dosquebradas</option>
                    <option value="Santa Rosa">Santa Rosa</option>
                    <option value="Armenia">Armenia</option>
                    <option value="Manizales">Manizales</option>
                  </select>
                </div>

                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                  <input
                    type="text"
                    required
                    placeholder="Dirección exacta (Ej: Calle 20 # 5-10)"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-green-600 outline-none font-medium"
                  />
                </div>
              </div>

              {/* FECHA NACIMIENTO */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Datos Personales</h3>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                  <input
                    type="date"
                    required
                    value={fechaNacimiento}
                    onChange={(e) => setFechaNacimiento(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-green-600 outline-none font-medium"
                  />
                </div>
              </div>

              <Button 
                type="submit"
                disabled={loading}
                className="w-full py-7 rounded-2xl bg-slate-900 hover:bg-green-700 text-white text-lg font-black transition-all shadow-xl shadow-slate-200 mt-4 border-none cursor-pointer"
              >
                {loading ? "Guardando..." : "¡Finalizar y Comenzar! 🥑"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}