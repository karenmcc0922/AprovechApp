import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Store, Mail, Lock, MapPin, Loader2, ArrowLeft } from "lucide-react";

export default function RegistroAliado() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);

  const handleRegistro = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulamos registro
    setTimeout(() => {
      setLoading(false);
      setLocation("/aliado"); // Lo mandamos directo a su panel
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Link href="/" className="inline-flex items-center text-slate-400 hover:text-slate-600 mb-6 font-bold transition-colors cursor-pointer">
          <ArrowLeft className="w-4 h-4 mr-2" /> Volver al inicio
        </Link>

        <Card className="border-none shadow-2xl rounded-[40px] bg-white overflow-hidden">
          <div className="bg-green-700 p-8 text-white text-center">
            <Store className="w-12 h-12 mx-auto mb-4 opacity-80" />
            <h1 className="text-3xl font-black">Registro de Aliado</h1>
            <p className="text-green-100 mt-2 font-medium">Únete a la red de comercios que reducen el desperdicio.</p>
          </div>

          <CardContent className="p-10">
            <form onSubmit={handleRegistro} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase ml-1">Nombre del Local</label>
                  <div className="relative">
                    <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                    <Input placeholder="Pan del Sol" className="pl-11 py-6 rounded-xl border-slate-100" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase ml-1">NIT / ID Fiscal</label>
                  <Input placeholder="900.123.456-1" className="py-6 rounded-xl border-slate-100" required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase ml-1">Correo Corporativo</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                  <Input type="email" placeholder="ventas@negocio.com" className="pl-11 py-6 rounded-xl border-slate-100" required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase ml-1">Dirección del Local</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                  <Input placeholder="Av. Principal #12-34, Pereira" className="pl-11 py-6 rounded-xl border-slate-100" required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase ml-1">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                  <Input type="password" placeholder="••••••••" className="pl-11 py-6 rounded-xl border-slate-100" required />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full py-8 rounded-[24px] bg-green-700 hover:bg-green-800 text-white text-lg font-black transition-all shadow-xl shadow-green-100 mt-4"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Crear mi cuenta de Aliado 🚀"}
              </Button>

              <p className="text-center text-xs text-slate-400 font-medium">
                Al registrarte, aceptas nuestros términos de manejo de excedentes alimentarios.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}