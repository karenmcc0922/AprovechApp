import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Leaf, Lock, User, MapPin, Globe, Calendar, Home } from "lucide-react";

export default function CompleteProfile() {
  const [_, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Nuevos estados para el perfil completo
  const [password, setPassword] = useState("");
  const [direccion, setDireccion] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [pais, setPais] = useState("");
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
      const response = await fetch('http://localhost:5000/api/completar-perfil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          direccion,
          municipio,
          departamento,
          pais,
          fechaNacimiento
        })
      });

      if (response.ok) {
        alert("¡Perfil completado con éxito! Bienvenido a AprovechApp.");
        setLocation("/catalog");
      } else {
        alert("Error al guardar los datos.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl"> {/* Aumenté el ancho a max-w-2xl */}
        <div className="text-center mb-8">
          <div className="bg-green-700 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Leaf className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
            Aprovech<span className="text-[#FFA832]">App</span>
          </h1>
          <p className="text-slate-500 font-medium">Completa tu información para empezar</p>
        </div>

        <Card className="border-none shadow-2xl rounded-[32px] overflow-hidden">
          <CardHeader className="bg-white border-b border-slate-100 p-8">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 border-4 border-green-50">
                <AvatarFallback className="bg-green-100 text-green-700 text-xl font-bold">
                  {email ? email.charAt(0).toUpperCase() : <User />}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl font-bold text-slate-800">Finalizar Registro</CardTitle>
                <p className="text-sm text-slate-500">{email}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8 bg-white">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Sección: Seguridad */}
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-2">Seguridad</h3>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="password"
                    required
                    placeholder="Crea tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-[#FFA832] focus:bg-white outline-none transition-all font-medium"
                  />
                </div>
              </div>

              {/* Sección: Ubicación */}
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-2">Ubicación</h3>
                <div className="relative">
                  <Home className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    required
                    placeholder="Dirección de residencia"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-[#FFA832] outline-none font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      required
                      placeholder="Municipio / Ciudad"
                      value={municipio}
                      onChange={(e) => setMunicipio(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-[#FFA832] outline-none font-medium"
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      required
                      placeholder="Departamento / Estado"
                      value={departamento}
                      onChange={(e) => setDepartamento(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-[#FFA832] outline-none font-medium"
                    />
                  </div>
                </div>

                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    required
                    placeholder="País"
                    value={pais}
                    onChange={(e) => setPais(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-[#FFA832] outline-none font-medium"
                  />
                </div>
              </div>

              {/* Sección: Personal */}
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-2">Información Personal</h3>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="date"
                    required
                    value={fechaNacimiento}
                    onChange={(e) => setFechaNacimiento(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-[#FFA832] outline-none font-medium"
                  />
                </div>
              </div>

              <Button 
                type="submit"
                disabled={loading}
                className="w-full py-7 rounded-2xl bg-green-700 hover:bg-green-800 text-lg font-bold shadow-lg shadow-green-200 transition-all active:scale-[0.98] mt-4"
              >
                {loading ? "Guardando datos..." : "¡Finalizar y Comenzar!"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}