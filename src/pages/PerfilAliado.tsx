import { useState, useEffect } from "react";
import AppNavbar from "../components/AppNavbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Store, 
  MapPin, 
  Mail, 
  Hash, 
  ShieldCheck, 
  Loader2, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Camera,
  Save,
  X
} from "lucide-react";

export default function PerfilAliado() {
  const aliadoId = localStorage.getItem("aliado_id");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [perfil, setPerfil] = useState({
    nombre_local: "",
    nit: "",
    correo_corporativo: "",
    direccion: "",
  });

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const response = await fetch(`https://aprovechapp-api.onrender.com/api/perfil-aliado/${aliadoId}`);
        if (response.ok) {
          const data = await response.json();
          setPerfil(data);
        }
      } catch (error) {
        console.error("Error cargando perfil:", error);
      } finally {
        setLoading(false);
      }
    };
    if (aliadoId) fetchPerfil();
  }, [aliadoId]);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await fetch(`https://aprovechapp-api.onrender.com/api/actualizar-perfil/${aliadoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nombre_local: perfil.nombre_local,
            direccion: perfil.direccion
        }),
      });

      setTimeout(() => {
        setEditMode(false);
        setUpdating(false);
        // Podrías usar un toast aquí si tienes la librería configurada
        alert("¡Información actualizada con éxito! 🥑");
      }, 800);
      
    } catch (error) {
      alert("Error al conectar con el servidor");
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#F8FAFC] gap-6">
      <div className="relative">
        <Loader2 className="animate-spin text-green-600 w-16 h-16" />
        <Store className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-300 w-6 h-6" />
      </div>
      <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] animate-pulse">Sincronizando establecimiento...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AppNavbar />
      
      <main className="container mx-auto px-6 pt-32 pb-20 max-w-6xl">
        
        {/* --- HERO BANNER --- */}
        <div className="relative h-64 w-full bg-slate-900 rounded-[50px] mb-20 overflow-hidden shadow-2xl shadow-slate-200">
          <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1556742044-3c52d6e88c62?q=80&w=2070')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
          
          <div className="absolute -bottom-10 left-12 flex items-end gap-8">
            <div className="relative group">
              <div className="h-44 w-44 bg-white rounded-[40px] shadow-2xl flex items-center justify-center border-[8px] border-white overflow-hidden relative">
                <div className="bg-green-50 w-full h-full flex items-center justify-center">
                   <Store className="w-20 h-20 text-green-600" />
                </div>
              </div>
              <button className="absolute bottom-2 right-2 bg-slate-900 text-white p-3 rounded-2xl shadow-xl hover:bg-green-600 transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0">
                <Camera size={18} />
              </button>
            </div>

            <div className="mb-14">
              <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
                {perfil.nombre_local || "Mi Local"}
              </h1>
              <div className="flex items-center gap-3 mt-4">
                <span className="flex items-center gap-1.5 bg-green-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest shadow-lg shadow-green-500/20">
                  <CheckCircle className="w-3 h-3" /> VERIFICADO
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md text-white/80 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest border border-white/10">
                  <MapPin className="w-3 h-3" /> {perfil.direccion.split(',')[0]}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* --- SIDEBAR INFO --- */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-[40px] bg-white p-10">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Información Legal</p>
              <div className="space-y-8">
                <div className="group">
                  <label className="text-[10px] font-black text-slate-300 uppercase block mb-2 tracking-tighter">Número de NIT</label>
                  <p className="text-slate-900 font-black flex items-center gap-3 text-lg">
                    <Hash className="w-5 h-5 text-green-600" /> {perfil.nit || "Pendiente"}
                  </p>
                </div>
                <div className="group">
                  <label className="text-[10px] font-black text-slate-300 uppercase block mb-2 tracking-tighter">E-mail Corporativo</label>
                  <p className="text-slate-900 font-black flex items-center gap-3 text-sm break-all">
                    <Mail className="w-5 h-5 text-green-600" /> {perfil.correo_corporativo}
                  </p>
                </div>
                <div className="pt-8 border-t border-slate-50">
                   <div className="flex items-center gap-3 bg-green-50 text-green-700 px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest">
                     <ShieldCheck className="w-5 h-5" /> Aliado Estratégico
                   </div>
                </div>
              </div>
            </Card>

            <Card className="border-none shadow-sm rounded-[35px] bg-indigo-900 p-8 text-white relative overflow-hidden">
               <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-indigo-300" />
                  <h3 className="font-black text-[10px] uppercase tracking-widest">Atención</h3>
                </div>
                <p className="text-sm font-bold leading-relaxed text-indigo-100">
                  ¿Vas a cambiar de dirección? Recuerda avisar a tus rescatistas frecuentes para que no pierdan tus ofertas.
                </p>
               </div>
               <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
            </Card>
          </div>

          {/* --- MAIN FORM --- */}
          <Card className="lg:col-span-8 border-none shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-[50px] bg-white overflow-hidden">
            <CardHeader className="p-12 pb-0">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Ajustes del Local</h2>
                  <p className="text-slate-400 font-bold text-xs uppercase mt-2 tracking-widest">Personaliza tu presencia en la app</p>
                </div>
                {!editMode && (
                  <Button 
                    onClick={() => setEditMode(true)} 
                    className="bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-[20px] font-black px-8 py-6 border-none shadow-none transition-all active:scale-95"
                  >
                    Editar Perfil
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-12 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Nombre Comercial</label>
                  <Input 
                    disabled={!editMode} 
                    value={perfil.nombre_local} 
                    onChange={(e) => setPerfil({...perfil, nombre_local: e.target.value})}
                    className={`py-8 rounded-[25px] border-none font-black text-xl transition-all ${
                      editMode ? "bg-slate-50 ring-2 ring-green-500/20 shadow-inner" : "bg-slate-50/50 text-slate-500"
                    }`}
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Código Interno</label>
                  <div className="py-5 px-8 rounded-[25px] bg-slate-100/50 text-slate-400 font-mono text-xs border border-slate-50 flex items-center justify-between">
                    <span>ALI-{aliadoId?.padStart(4, '0')}</span>
                    <Clock size={14} className="opacity-30" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Punto de Recogida Principal</label>
                <div className="relative group">
                  <MapPin className={`absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 transition-colors ${editMode ? "text-green-600" : "text-slate-300"}`} />
                  <Input 
                    disabled={!editMode} 
                    value={perfil.direccion}
                    onChange={(e) => setPerfil({...perfil, direccion: e.target.value})}
                    className={`pl-16 py-8 rounded-[25px] border-none font-bold text-slate-700 transition-all ${
                      editMode ? "bg-slate-50 ring-2 ring-green-500/20 shadow-inner" : "bg-slate-50/50"
                    }`}
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter ml-2">
                   * Esta dirección será visible para todos los rescatistas en el mapa principal.
                </p>
              </div>

              {/* BOTONES DE ACCIÓN DINÁMICOS */}
              {editMode && (
                <div className="pt-10 flex gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <Button 
                    disabled={updating}
                    onClick={() => setEditMode(false)} 
                    variant="ghost" 
                    className="flex-1 py-8 rounded-[25px] font-black text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    <X size={18} className="mr-2" /> Cancelar
                  </Button>
                  <Button 
                    disabled={updating}
                    onClick={handleUpdate} 
                    className="flex-[2] bg-slate-900 hover:bg-green-600 text-white py-8 rounded-[25px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 transition-all active:scale-95"
                  >
                    {updating ? (
                      <Loader2 className="animate-spin w-5 h-5 mr-2" />
                    ) : (
                      <span className="flex items-center gap-2">
                         <Save size={18} /> Guardar Configuración
                      </span>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}