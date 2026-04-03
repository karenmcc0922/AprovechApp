import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Leaf, Lock, User, Calendar } from "lucide-react";

export default function CompleteProfile() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [password, setPassword] = useState("");
  const [direccion, setDireccion] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [pais, setPais] = useState("Colombia");
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
          email, password, direccion, municipio, departamento, pais, fechaNacimiento
        })
      });

      if (response.ok) {
        alert("¡Perfil completado con éxito!");
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
          <div className="bg-green-700 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Leaf className="text-white w-8 h-8" />
          </div>
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
              
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Seguridad</h3>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                  <input
                    type="password"
                    required
                    placeholder="Contraseña nueva"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-green-600 outline-none font-medium transition-all"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Ubicación</h3>
                <input
                  type="text"
                  required
                  placeholder="Dirección (Calle/Carrera)"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-green-600 outline-none font-medium"
                />

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="Ciudad"
                    value={municipio}
                    onChange={(e) => setMunicipio(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-green-600 outline-none font-medium"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Departamento"
                    value={departamento}
                    onChange={(e) => setDepartamento(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-green-600 outline-none font-medium"
                  />
                </div>

                <input
                  type="text"
                  required
                  placeholder="País"
                  value={pais}
                  onChange={(e) => setPais(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-green-600 outline-none font-medium"
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Fecha de Nacimiento</h3>
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