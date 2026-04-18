import AppNavbar from "../components/AppNavbar";
import { Card, CardContent } from "@/components/ui/card";
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
  const userName = localStorage.getItem("user_name") || "Rescatista";
  const userEmail = localStorage.getItem("user_email") || "usuario@ejemplo.com";

  const historial = [
    { id: 1, local: "Pan del Sol", producto: "Bolsa Sorpresa Panadería", fecha: "Hoy, 4:30 PM", precio: 12000, estado: "Pendiente" },
    { id: 2, local: "Frubana", producto: "Pack Frutas de Temporada", fecha: "15 Oct 2023", precio: 10000, estado: "Completado" },
    { id: 3, local: "Dunkin Local", producto: "Caja de Donas x6", fecha: "10 Oct 2023", precio: 15000, estado: "Completado" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AppNavbar />
      <main className="flex-grow container mx-auto px-4 pt-28 pb-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Usuario */}
          <div className="space-y-6">
            <Card className="border-none shadow-sm rounded-[40px] overflow-hidden bg-white">
              <CardContent className="p-8 text-center">
                <div className="relative w-32 h-32 mx-auto mb-6">
                  <div className="w-full h-full bg-green-700 rounded-full flex items-center justify-center text-white text-5xl font-black shadow-inner">
                    {userName.charAt(0)}
                  </div>
                  <div className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-lg border border-slate-100">
                    <ShieldCheck className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-black text-slate-900 leading-tight">{userName}</h2>
                <p className="text-slate-500 font-medium mb-6 truncate">{userEmail}</p>
                <div className="flex items-center justify-center gap-2 text-slate-400 text-sm font-bold mb-8">
                  <MapPin className="w-4 h-4" /> Pereira, Risaralda
                </div>
                <Button className="w-full rounded-2xl py-6 font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 border-none transition-all">
                  <Settings className="w-4 h-4 mr-2" /> Configurar Cuenta
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-slate-900 rounded-[40px] text-white overflow-hidden">
              <CardContent className="p-8 flex flex-col items-center text-center">
                <div className="bg-white p-4 rounded-[32px] mb-6">
                  <QrCode className="w-32 h-32 text-slate-900" />
                </div>
                <h3 className="font-bold text-lg mb-2">Tu ID de Rescate</h3>
                <p className="text-slate-400 text-xs px-4">Muestra este código en tienda para reclamar.</p>
              </CardContent>
            </Card>
          </div>

          {/* Columna Datos */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none shadow-md rounded-[40px] bg-gradient-to-br from-green-600 to-emerald-800 text-white overflow-hidden">
              <CardContent className="p-8 relative z-10">
                <div className="space-y-4">
                  <Badge className="bg-white/20 text-white border-none px-3 py-1 font-bold">NIVEL 4: ELITE</Badge>
                  <h2 className="text-3xl font-black tracking-tight">¡Impacto Positivo! 🌍</h2>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-black uppercase opacity-80">
                      <span>Progreso</span>
                      <span>750 / 1000 pts</span>
                    </div>
                    <Progress value={75} className="h-3 bg-white/20 shadow-none" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: "Comida Salvada", value: "8.2 kg", icon: BadgeCheck, color: "text-green-600", bg: "bg-green-100" },
                { label: "Dinero Ahorrado", value: "$125k", icon: TrendingDown, color: "text-blue-600", bg: "bg-blue-100" },
                { label: "CO2 Evitado", value: "24.5 kg", icon: Leaf, color: "text-emerald-600", bg: "bg-emerald-100" },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                  <div className={`${stat.bg} w-12 h-12 rounded-2xl flex items-center justify-center mb-4`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 px-2">
                <History className="w-6 h-6 text-green-600" /> Rescates Recientes
              </h3>
              <div className="space-y-4">
                {historial.map((item) => (
                  <div key={item.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between hover:border-green-200 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="bg-slate-50 p-4 rounded-2xl">
                        <Calendar className="w-6 h-6 text-slate-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{item.producto}</h4>
                        <p className="text-sm text-slate-500">{item.local} • {item.fecha}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-slate-900">${item.precio.toLocaleString()}</p>
                      <Badge className={item.estado === 'Pendiente' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}>
                        {item.estado}
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