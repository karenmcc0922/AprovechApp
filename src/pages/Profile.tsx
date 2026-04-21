import { useState, useEffect } from "react";
import AppNavbar from "../components/AppNavbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  History, 
  Calendar, 
  ShieldCheck, 
  MapPin, 
  Settings, 
  QrCode, 
  BadgeCheck, 
  TrendingDown, 
  Leaf,
  Loader2,
  ChevronRight,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Profile() {
  const [historial, setHistorial] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const storedUser = JSON.parse(localStorage.getItem("usuario") || "{}");
  const userId = storedUser.id;
  const userName = storedUser.nombre || "Rescatista";
  const userEmail = storedUser.correo || "usuario@ejemplo.com";

  useEffect(() => {
    const cargarHistorialDesdeDB = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`https://aprovechapp-api.onrender.com/api/pedidos/usuario/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setHistorial(data);
        }
      } catch (error) {
        console.error("Error al cargar historial:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarHistorialDesdeDB();
  }, [userId]);

  const totalGastado = historial.reduce((acc, curr) => acc + (Number(curr.precio_final) || 0), 0);
  const co2Ahorrado = (historial.length * 2.5).toFixed(1);

  return (
    <div className="min-h-screen bg-[#FBFDFF] flex flex-col">
      <AppNavbar />
      
      <main className="flex-grow container mx-auto px-6 pt-32 pb-20 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* --- COLUMNA IZQUIERDA: TARJETA DE IDENTIDAD --- */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="border-none shadow-[0_20px_60px_rgba(0,0,0,0.05)] rounded-[50px] bg-white p-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-600" />
              
              <div className="relative w-40 h-40 mx-auto mb-8">
                <div className="w-full h-full bg-slate-900 rounded-[45px] flex items-center justify-center text-white text-6xl font-black shadow-2xl uppercase italic rotate-3 hover:rotate-0 transition-transform duration-500">
                  {userName.charAt(0)}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-500 p-3 rounded-[20px] shadow-xl border-4 border-white animate-bounce">
                  <BadgeCheck className="w-6 h-6 text-white" />
                </div>
              </div>

              <div className="text-center">
                <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter leading-none mb-2">
                  {userName}
                </h2>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mb-8">{userEmail}</p>
                
                <div className="flex items-center justify-center gap-2 bg-slate-50 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8">
                  <MapPin className="w-4 h-4 text-green-600" /> Pereira, CO
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                    <span>Nivel Rescatista</span>
                    <span className="text-green-600">{historial.length}/20 Packs</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full transition-all duration-1000" 
                      style={{ width: `${Math.min((historial.length / 20) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter italic">Próximo rango: Guardián del Planeta</p>
                </div>
              </div>

              <Button variant="ghost" className="w-full mt-10 rounded-2xl py-7 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all">
                <Settings className="w-4 h-4 mr-2" /> Configurar Cuenta
              </Button>
            </Card>

            <Card className="border-none shadow-2xl bg-slate-900 rounded-[45px] text-white p-10 flex flex-col items-center text-center group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-green-500/20 transition-colors" />
              
              <div className="bg-white p-6 rounded-[35px] mb-8 shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <QrCode className="w-20 h-20 text-slate-900" />
              </div>
              <h3 className="font-black text-xl uppercase italic tracking-tighter">ID: RES-{userId || '000'}</h3>
              <div className="mt-4 flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                <ShieldCheck className="w-4 h-4 text-green-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-100">Miembro VIP</span>
              </div>
            </Card>
          </div>

          {/* --- COLUMNA DERECHA: DASHBOARD DE IMPACTO --- */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* CARDS DE IMPACTO */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-50 hover:shadow-xl transition-all group">
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Packs Rescatados</p>
                <p className="text-4xl font-black text-slate-900 tracking-tighter italic">{historial.length}</p>
              </div>

              <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-50 hover:shadow-xl transition-all group">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <TrendingDown className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Inversión Total</p>
                <p className="text-4xl font-black text-slate-900 tracking-tighter italic">${totalGastado.toLocaleString()}</p>
              </div>

              <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-50 hover:shadow-xl transition-all group">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Leaf className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Impacto CO2</p>
                <p className="text-4xl font-black text-slate-900 tracking-tighter italic">{co2Ahorrado} kg</p>
              </div>
            </div>

            {/* LISTADO DE ACTIVIDAD */}
            <div className="space-y-8">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3 italic uppercase tracking-tighter">
                  <History className="w-8 h-8 text-green-600" /> Cronología de Rescates
                </h3>
                <Badge variant="outline" className="rounded-full border-slate-200 text-slate-400 font-bold px-4 py-1">
                  Últimos {historial.length} movimientos
                </Badge>
              </div>
              
              <div className="space-y-4">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[50px] gap-4 shadow-inner">
                    <Loader2 className="w-10 h-10 animate-spin text-green-600" />
                    <p className="font-black uppercase text-[10px] tracking-[0.3em] text-slate-400">Sincronizando con el servidor...</p>
                  </div>
                ) : historial.length > 0 ? (
                  historial.map((item) => (
                    <div 
                      key={item.id} 
                      className="bg-white p-8 rounded-[35px] border border-transparent hover:border-green-100 flex flex-col md:flex-row items-center justify-between group transition-all hover:shadow-[0_15px_40px_rgba(0,0,0,0.03)]"
                    >
                      <div className="flex items-center gap-6 flex-1">
                        <div className="bg-slate-50 p-5 rounded-[25px] group-hover:bg-green-50 transition-colors">
                          <Calendar className="w-8 h-8 text-slate-300 group-hover:text-green-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                              {new Date(item.fecha_pedido).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                            </span>
                          </div>
                          <h4 className="font-black text-slate-800 uppercase italic text-xl tracking-tighter leading-none group-hover:text-green-600 transition-colors">
                            {item.nombre_producto}
                          </h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 flex items-center gap-2">
                            Código: <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-mono">{item.codigo_qr}</span>
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-8 mt-6 md:mt-0 w-full md:w-auto pt-6 md:pt-0 border-t md:border-t-0 border-slate-50">
                        <div className="text-right">
                          <p className="text-2xl font-black text-slate-900 tracking-tighter">${Number(item.precio_final).toLocaleString()}</p>
                          <Badge className="bg-green-100 text-green-700 rounded-lg font-black text-[9px] uppercase tracking-widest border-none px-3 py-1">
                            {item.estado || 'Rescatado'}
                          </Badge>
                        </div>
                        <ChevronRight className="text-slate-200 group-hover:text-green-600 group-hover:translate-x-2 transition-all hidden md:block" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-24 bg-white rounded-[50px] border-4 border-dashed border-slate-50">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Target className="w-10 h-10 text-slate-200" />
                    </div>
                    <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Tu historial está vacío por ahora</p>
                    <Button 
                      onClick={() => window.location.href='/catalog'}
                      variant="link" 
                      className="text-green-600 font-black mt-4 uppercase text-[10px] tracking-widest"
                    >
                      ¡Empieza a salvar comida ahora!
                    </Button>
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