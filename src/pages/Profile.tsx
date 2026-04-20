import { useState, useEffect } from "react";
import AppNavbar from "../components/AppNavbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BadgeCheck, 
  TrendingDown, 
  Leaf, 
  History, 
  QrCode, 
  Settings,
  MapPin,
  Calendar,
  ShieldCheck 
} from "lucide-react";

export default function Profile() {
  // --- CORRECCIÓN: Leer del objeto centralizado ---
  const storedUser = JSON.parse(localStorage.getItem("usuario") || "{}");
  
  const userName = storedUser.nombre || "Usuario";
  const userEmail = storedUser.correo || "Sin correo registrado";
  const userRole = storedUser.role === 'vendor' ? 'Aliado Comercial' : 'Rescatista';

  const [historial, setHistorial] = useState<any[]>([]);

  useEffect(() => {
  const fetchPedidos = async () => {
    if (!storedUser.id) return;

    try {
      // Usamos el endpoint que ya tienes en tu index.js
      const response = await fetch(`https://aprovechapp-api.onrender.com/api/pedidos/usuario/${storedUser.id}`);
      const data = await response.json();
      
      if (response.ok) {
        // Mapeamos los datos del backend para que coincidan con tus tarjetas de historial
        const pedidosFormateados = data.map((p: any) => ({
          id: p.id,
          producto: p.nombre_producto,
          local: "Comercio Aliado", // Podrías traer el nombre del local con un JOIN en el backend
          fecha: new Date(p.fecha_pedido).toLocaleDateString(),
          precio: p.precio_final,
          estado: p.estado || "Completado"
        }));
        setHistorial(pedidosFormateados);
      }
    } catch (error) {
      console.error("Error cargando historial real:", error);
    }
  };

  fetchPedidos();
}, [storedUser.id]);

  const totalGastado = historial.reduce((acc, curr) => acc + (Number(curr.precio) || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AppNavbar />
      <main className="flex-grow container mx-auto px-4 pt-28 pb-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="space-y-6">
            <Card className="border-none shadow-sm rounded-[40px] overflow-hidden bg-white p-8 text-center border border-slate-100">
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="w-full h-full bg-slate-900 rounded-[32px] flex items-center justify-center text-white text-5xl font-black rotate-3 shadow-xl uppercase">
                  <span className="-rotate-3">{userName.charAt(0)}</span>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-500 p-2 rounded-2xl shadow-lg border-4 border-white">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
              </div>
              
              {/* AQUÍ SE MUESTRA EL NOMBRE REAL */}
              <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                {userName}
              </h2>
              <p className="text-green-600 font-bold text-xs uppercase tracking-widest mt-1">
                {userRole}
              </p>
              <p className="text-slate-400 font-medium mb-6 text-sm mt-2">{userEmail}</p>
              
              <div className="flex items-center justify-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-8">
                <MapPin className="w-4 h-4 text-green-600" /> Pereira, Risaralda
              </div>
              <Button variant="outline" className="w-full rounded-2xl py-6 font-black border-slate-100 text-slate-500">
                <Settings className="w-4 h-4 mr-2" /> Ajustes de Cuenta
              </Button>
            </Card>

            <Card className="border-none shadow-2xl bg-green-700 rounded-[40px] text-white p-8 flex flex-col items-center text-center group">
              <div className="bg-white p-4 rounded-[32px] mb-6 shadow-xl group-hover:scale-105 transition-transform">
                <QrCode className="w-24 h-24 text-slate-900" />
              </div>
              <h3 className="font-black text-lg uppercase">ID: RES-{storedUser.id || '000'}</h3>
              <p className="text-green-100 text-[10px] font-bold uppercase tracking-widest mt-1 opacity-70">Escanea para validar</p>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-8">
             {/* ... el resto de tu código de estadísticas queda igual ... */}
             <Card className="border-none shadow-md rounded-[40px] bg-white p-10">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="space-y-2 text-center md:text-left">
                  <Badge className="bg-green-100 text-green-700 border-none px-3 py-1 font-black text-[10px]">NIVEL 4: ELITE</Badge>
                  <h2 className="text-3xl font-black text-slate-900 uppercase">Héroe de la Comida 🌍</h2>
                </div>
                <div className="w-full md:w-64 space-y-2 text-right">
                  <Progress value={75} className="h-3 bg-slate-100" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">750 / 1000 Puntos XP</p>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: "Packs Salvados", value: `${historial.length}`, icon: BadgeCheck, color: "text-green-600", bg: "bg-green-100" },
                { label: "Ahorro Estimado", value: `$${(totalGastado * 1.5).toLocaleString()}`, icon: TrendingDown, color: "text-blue-600", bg: "bg-blue-100" },
                { label: "CO2 Reducido", value: `${(historial.length * 2.5).toFixed(1)} kg`, icon: Leaf, color: "text-emerald-600", bg: "bg-emerald-100" },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                  <div className={`${stat.bg} w-12 h-12 rounded-2xl flex items-center justify-center mb-4`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 px-2">
                <History className="w-6 h-6 text-green-600" /> Historial de Rescates
              </h3>
              <div className="space-y-4">
                {historial.map((item) => (
                  <div key={item.id} className="bg-white p-6 rounded-[32px] border border-slate-50 flex items-center justify-between group hover:border-green-200 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="bg-slate-50 p-4 rounded-2xl group-hover:bg-green-50">
                        <Calendar className="w-6 h-6 text-slate-400 group-hover:text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800 uppercase text-sm">{item.producto || item.nombre_producto}</h4>
                        <p className="text-xs font-bold text-slate-400">{item.local || 'Local AprovechApp'} • {item.fecha || 'Reciente'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-slate-900">${(item.precio || item.precio_final || 0).toLocaleString()}</p>
                      <Badge className={`rounded-lg font-black text-[10px] uppercase ${item.estado === 'Pendiente' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                        {item.estado || 'Completado'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}