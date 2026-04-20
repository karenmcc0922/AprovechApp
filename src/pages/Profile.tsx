import { useState, useEffect } from "react";
import AppNavbar from "../components/AppNavbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, Calendar, ShieldCheck, MapPin, Settings, QrCode, BadgeCheck, TrendingDown, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Profile() {
  const [historial, setHistorial] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Obtenemos los datos del usuario logueado
  const storedUser = JSON.parse(localStorage.getItem("usuario") || "{}");
  const userName = storedUser.nombre || "Usuario";
  const userEmail = storedUser.correo || "usuario@ejemplo.com";

  useEffect(() => {
    const cargarHistorialReal = async () => {
      if (!storedUser.id) return;
      
      try {
        const response = await fetch(`https://aprovechapp-api.onrender.com/api/pedidos/usuario/${storedUser.id}`);
        const data = await response.json();
        
        if (response.ok) {
          setHistorial(data); // El backend ya trae nombre_producto, precio_final, etc.
        }
      } catch (error) {
        console.error("Error al conectar con la base de datos:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarHistorialReal();
  }, [storedUser.id]);

  const totalGastado = historial.reduce((acc, curr) => acc + (Number(curr.precio_final) || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AppNavbar />
      <main className="flex-grow container mx-auto px-4 pt-28 pb-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMNA IZQUIERDA: USUARIO */}
          <div className="space-y-6">
            <Card className="border-none shadow-sm rounded-[40px] bg-white p-8 text-center">
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="w-full h-full bg-slate-900 rounded-[32px] flex items-center justify-center text-white text-5xl font-black rotate-3 shadow-xl uppercase">
                  <span className="-rotate-3">{userName.charAt(0)}</span>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-500 p-2 rounded-2xl shadow-lg border-4 border-white">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-black text-slate-900 uppercase">{userName}</h2>
              <p className="text-slate-400 font-medium mb-6 text-sm">{userEmail}</p>
              <div className="flex items-center justify-center gap-2 text-slate-400 text-[10px] font-black uppercase mb-8">
                <MapPin className="w-4 h-4 text-green-600" /> Pereira, Risaralda
              </div>
              <Button variant="outline" className="w-full rounded-2xl py-6 font-black border-slate-100 text-slate-500">
                <Settings className="w-4 h-4 mr-2" /> Ajustes
              </Button>
            </Card>

            <Card className="border-none shadow-2xl bg-green-700 rounded-[40px] text-white p-8 flex flex-col items-center text-center">
              <div className="bg-white p-4 rounded-[32px] mb-6 shadow-xl">
                <QrCode className="w-24 h-24 text-slate-900" />
              </div>
              <h3 className="font-black text-lg">ID: RES-{storedUser.id || '000'}</h3>
              <p className="text-green-100 text-[10px] font-bold uppercase mt-1 opacity-70">Escanea en el local</p>
            </Card>
          </div>

          {/* COLUMNA DERECHA: ESTADÍSTICAS E HISTORIAL */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
                <BadgeCheck className="w-6 h-6 text-green-600 mb-2" />
                <p className="text-[10px] font-black text-slate-400 uppercase">Packs Salvados</p>
                <p className="text-2xl font-black text-slate-900">{historial.length}</p>
              </div>
              <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
                <TrendingDown className="w-6 h-6 text-blue-600 mb-2" />
                <p className="text-[10px] font-black text-slate-400 uppercase">Ahorro Total</p>
                <p className="text-2xl font-black text-slate-900">${totalGastado.toLocaleString()}</p>
              </div>
              <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
                <Leaf className="w-6 h-6 text-emerald-600 mb-2" />
                <p className="text-[10px] font-black text-slate-400 uppercase">CO2 Reducido</p>
                <p className="text-2xl font-black text-slate-900">{(historial.length * 2.5).toFixed(1)}kg</p>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <History className="w-6 h-6 text-green-600" /> Mi Historial de Rescates
              </h3>
              
              <div className="space-y-4">
                {loading ? (
                  <p className="text-center py-10 text-slate-400 font-bold">Cargando tus rescates...</p>
                ) : historial.length > 0 ? (
                  historial.map((item) => (
                    <div key={item.id} className="bg-white p-6 rounded-[32px] border border-slate-50 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="bg-slate-50 p-4 rounded-2xl">
                          <Calendar className="w-6 h-6 text-slate-400" />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-800 uppercase text-sm">{item.nombre_producto}</h4>
                          <p className="text-xs font-bold text-slate-400">
                            {item.nombre_local || "Local Aliado"} • {new Date(item.fecha_pedido).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-slate-900">${Number(item.precio_final).toLocaleString()}</p>
                        <Badge className="bg-green-100 text-green-700 rounded-lg font-black text-[10px] uppercase border-none">
                          {item.estado || 'Completado'}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-100">
                    <p className="text-slate-400 font-bold">Aún no tienes rescates realizados.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}