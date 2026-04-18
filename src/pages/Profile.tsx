import { useState } from "react";
import AppNavbar from "../components/AppNavbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
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
  Bell,
  LogOut,
  ShieldCheck
} from "lucide-react";

export default function Profile() {
  // 1. Datos del Usuario (Simulados y desde localStorage)
  const userName = localStorage.getItem("user_name") || "Rescatista";
  const userEmail = localStorage.getItem("user_email") || "usuario@ejemplo.com";

  // 2. Lógica de cierre de sesión
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  // 3. Datos de prueba para el historial
  const historial = [
    { id: 1, local: "Pan del Sol", producto: "Bolsa Sorpresa Panadería", fecha: "Hoy, 4:30 PM", precio: 12000, estado: "Pendiente" },
    { id: 2, local: "Frubana", producto: "Pack Frutas de Temporada", fecha: "15 Oct 2023", precio: 10000, estado: "Completado" },
    { id: 3, local: "Dunkin Local", producto: "Caja de Donas x6", fecha: "10 Oct 2023", precio: 15000, estado: "Completado" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNavbar />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMNA IZQUIERDA: INFORMACIÓN DE USUARIO */}
          <div className="space-y-6">
            <Card className="border-none shadow-sm rounded-[40px] overflow-hidden bg-white">
              <CardContent className="p-8 text-center">
                <div className="relative w-32 h-32 mx-auto mb-6">
                  <div className="w-full h-full bg-green-700 rounded-full flex items-center justify-center text-white text-5xl font-black">
                    {userName.charAt(0)}
                  </div>
                  <div className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-lg">
                    <ShieldCheck className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                
                <h2 className="text-2xl font-black text-slate-900">{userName}</h2>
                <p className="text-slate-500 font-medium mb-6">{userEmail}</p>
                
                <div className="flex items-center justify-center gap-2 text-slate-400 text-sm font-bold mb-8">
                  <MapPin className="w-4 h-4" /> Pereira, Risaralda
                </div>

                <div className="space-y-3">
                  <Button className="w-full rounded-2xl py-6 font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 border-none transition-all">
                    <Settings className="w-4 h-4 mr-2" /> Editar Perfil
                  </Button>
                  <Button 
                    onClick={handleLogout}
                    variant="ghost" 
                    className="w-full rounded-2xl py-6 font-bold text-red-500 hover:text-red-600 hover:bg-red-50 transition-all"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Cerrar Sesión
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* TARJETA QR DE VALIDACIÓN */}
            <Card className="border-none shadow-xl bg-slate-900 rounded-[40px] text-white overflow-hidden">
              <CardContent className="p-8 flex flex-col items-center text-center">
                <div className="bg-white p-4 rounded-[32px] mb-6">
                  <QrCode className="w-32 h-32 text-slate-900" />
                </div>
                <h3 className="font-bold text-lg mb-2">Tu ID de Rescate</h3>
                <p className="text-slate-400 text-xs px-4">
                  Muestra este código en el local para confirmar la entrega de tu pedido.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* COLUMNA DERECHA: ESTADÍSTICAS E HISTORIAL */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. SECCIÓN DE NIVEL Y GAMIFICACIÓN */}
            <Card className="border-none shadow-sm rounded-[40px] bg-gradient-to-br from-green-600 to-emerald-800 text-white overflow-hidden">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex-1 space-y-4 w-full">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-white/20 text-white border-none px-3 py-1 font-bold">NIVEL 4: RESCATISTA ELITE</Badge>
                    </div>
                    <h2 className="text-3xl font-black tracking-tight">¡Estás salvando el planeta! 🌍</h2>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-black uppercase tracking-widest opacity-80">
                        <span>Progreso de Nivel</span>
                        <span>750 / 1000 pts</span>
                      </div>
                      <Progress value={75} className="h-3 bg-white/20" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. GRID DE ESTADÍSTICAS DE IMPACTO */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            {/* 3. HISTORIAL DE ACTIVIDAD */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <History className="w-6 h-6 text-green-600" /> Historial de Rescates
                </h3>
                <Button variant="link" className="text-green-600 font-bold">Ver todo</Button>
              </div>

              <div className="space-y-4">
                {historial.map((item) => (
                  <div key={item.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="bg-slate-50 p-4 rounded-2xl group-hover:bg-green-50 transition-colors">
                        <Calendar className="w-6 h-6 text-slate-400 group-hover:text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{item.producto}</h4>
                        <p className="text-sm text-slate-500 font-medium">{item.local} • {item.fecha}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-slate-900">${item.precio.toLocaleString()}</p>
                      <Badge className={`border-none ${
                        item.estado === 'Pendiente' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {item.estado}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. PREFERENCIAS Y NOTIFICACIONES */}
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <Bell className="w-6 h-6 text-green-600" /> Preferencias de Rescate
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex items-center justify-between p-2">
                  <div>
                    <p className="font-bold text-slate-800">Alertas Cercanas</p>
                    <p className="text-xs text-slate-500 font-medium">Notificar ofertas a menos de 2km</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-2">
                  <div>
                    <p className="font-bold text-slate-800">Reporte de Impacto</p>
                    <p className="text-xs text-slate-500 font-medium">Recibir resumen semanal de ahorro</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}