import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { 
  Lock, 
  User, 
  Calendar, 
  Phone, 
  MapPin, 
  Eye, 
  EyeOff, 
  ChevronRight,
  ShieldCheck,
  Map
} from "lucide-react";

export default function CompleteProfile() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
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
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 py-16">
      <div className="w-full max-w-xl">
        
        {/* Header con Branding */}
        <div className="text-center mb-10">
          <div className="relative inline-block">
            <img 
              src="/logo.png" 
              alt="AprovechApp" 
              className="w-20 h-20 mx-auto mb-4 drop-shadow-2xl object-contain"
            />
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
            Aprovech<span className="text-green-600">App</span>
          </h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">Personaliza tu experiencia de rescate</p>
        </div>

        <Card className="border-none shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)] rounded-[45px] overflow-hidden bg-white">
          <CardHeader className="border-b border-slate-50 p-10 pb-8 bg-slate-50/50">
            <div className="flex items-center gap-5">
              <div className="relative">
                <Avatar className="w-20 h-20 border-4 border-white shadow-xl">
                  <AvatarFallback className="bg-gradient-to-br from-green-400 to-green-600 text-white text-2xl font-black">
                    {email ? email.charAt(0).toUpperCase() : <User />}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div>
                <CardTitle className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Casi listo...</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <p className="text-sm text-slate-500 font-bold lowercase">{email}</p>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-10">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* SECCIÓN SEGURIDAD */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Seguridad y Contacto</h3>
                </div>
                
                <div className="group relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 group-focus-within:text-green-600 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Crea una contraseña segura"
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

                <div className="group relative">
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 group-focus-within:text-green-600 transition-colors" />
                  <input
                    type="tel"
                    required
                    placeholder="Número de WhatsApp"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full pl-14 pr-5 py-5 bg-slate-50 border-none rounded-[25px] focus:ring-2 focus:ring-green-500/20 outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>

              {/* SECCIÓN UBICACIÓN */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <Map className="w-4 h-4 text-blue-600" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">¿Dónde te encuentras?</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <select 
                    value={pais} 
                    onChange={(e) => setPais(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500/20 outline-none font-bold text-slate-600 appearance-none cursor-pointer"
                  >
                    <option value="Colombia">Colombia 🇨🇴</option>
                  </select>

                  <select 
                    value={departamento} 
                    onChange={(e) => setDepartamento(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500/20 outline-none font-bold text-slate-600 appearance-none cursor-pointer"
                  >
                    <option value="Risaralda">Risaralda</option>
                    <option value="Quindio">Quindío</option>
                    <option value="Caldas">Caldas</option>
                  </select>

                  <select 
                    value={municipio} 
                    onChange={(e) => setMunicipio(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500/20 outline-none font-bold text-slate-600 appearance-none cursor-pointer"
                  >
                    <option value="Pereira">Pereira</option>
                    <option value="Dosquebradas">Dosquebradas</option>
                    <option value="Santa Rosa">Santa Rosa</option>
                  </select>
                </div>

                <div className="group relative">
                  <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 group-focus-within:text-green-600 transition-colors" />
                  <input
                    type="text"
                    required
                    placeholder="Dirección de entrega (Casa, Apto...)"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    className="w-full pl-14 pr-5 py-5 bg-slate-50 border-none rounded-[25px] focus:ring-2 focus:ring-green-500/20 outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>

              {/* FECHA NACIMIENTO */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fecha de Nacimiento</h3>
                </div>
                <div className="group relative">
                  <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 group-focus-within:text-green-600 transition-colors" />
                  <input
                    type="date"
                    required
                    value={fechaNacimiento}
                    onChange={(e) => setFechaNacimiento(e.target.value)}
                    className="w-full pl-14 pr-5 py-5 bg-slate-50 border-none rounded-[25px] focus:ring-2 focus:ring-green-500/20 outline-none font-bold text-slate-700 transition-all"
                  />
                </div>
              </div>

              <div className="pt-6">
                <Button 
                  type="submit"
                  disabled={loading}
                  className="group w-full py-9 rounded-[30px] bg-slate-900 hover:bg-green-600 text-white text-sm font-black transition-all shadow-2xl shadow-slate-200 uppercase tracking-[0.2em] relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {loading ? "Sincronizando..." : "Comenzar a Rescatar"}
                    {!loading && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                  </span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <p className="text-center mt-8 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
            Al continuar, aceptas nuestros términos de servicio
        </p>
      </div>
    </div>
  );
}