import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Leaf, Lock, User, CheckCircle } from "lucide-react";

export default function CompleteProfile() {
  const [_, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Capturamos el email de la URL (el que mandamos en el botón del correo)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");
    if (emailParam) setEmail(emailParam);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // AQUÍ CONECTAREMOS CON TU SERVIDOR DE NODE PRÓXIMAMENTE
    console.log("Guardando contraseña para:", email);
    
    // Simulamos éxito y mandamos al catálogo
    setTimeout(() => {
      alert("¡Perfil completado! Bienvenido a la comunidad.");
      setLocation("/catalog");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header con el estilo de Manus */}
        <div className="text-center mb-8">
          <div className="bg-green-700 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Leaf className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
            Aprovech<span className="text-[#FFA832]">App</span>
          </h1>
          <p className="text-slate-500 font-medium">Estás a un paso de salvar tu primera comida</p>
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
                <CardTitle className="text-xl font-bold text-slate-800">Crea tu cuenta</CardTitle>
                <p className="text-sm text-slate-500">{email}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8 bg-white">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Contraseña segura</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="password"
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#FFA832] focus:bg-white outline-none transition-all font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-2xl flex items-start gap-3 border border-green-100">
                <CheckCircle className="text-green-600 w-5 h-5 mt-0.5" />
                <p className="text-xs text-green-700 font-medium leading-relaxed">
                  Al completar tu registro, tendrás acceso a los descuentos exclusivos de los comercios en Pereira.
                </p>
              </div>

              <Button 
                type="submit"
                disabled={loading}
                className="w-full py-7 rounded-2xl bg-green-700 hover:bg-green-800 text-lg font-bold shadow-lg shadow-green-200 transition-all active:scale-[0.98]"
              >
                {loading ? "Guardando..." : "¡Comenzar a ahorrar!"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}