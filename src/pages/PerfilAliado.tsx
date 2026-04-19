import { useState, useEffect } from "react";
import AppNavbar from "../components/AppNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  AlertCircle 
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

  // 1. Cargar datos del perfil desde la API
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

// 2. Lógica para guardar cambios corregida
  const handleUpdate = async () => {
    setUpdating(true);
    try {
      // Eliminamos el "const response =" porque no lo estamos leyendo abajo
      await fetch(`https://aprovechapp-api.onrender.com/api/actualizar-perfil/${aliadoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nombre_local: perfil.nombre_local,
            direccion: perfil.direccion
        }),
      });

      // El resto sigue igual para la simulación de la demo
      setTimeout(() => {
        setEditMode(false);
        setUpdating(false);
        alert("¡Información actualizada con éxito! 🥑");
      }, 1000);
      
    } catch (error) {
      alert("Error al conectar con el servidor");
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
      <Loader2 className="animate-spin text-green-600 w-12 h-12" />
      <p className="text-slate-500 font-bold animate-pulse">Cargando tu local...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNavbar />
      
      <main className="container mx-auto px-4 pt-28 pb-12 max-w-5xl">
        
        {/* --- BANNER DE PORTADA --- */}
        <div className="relative h-56 w-full bg-gradient-to-r from-green-800 to-slate-900 rounded-[40px] mb-16 overflow-hidden shadow-2xl shadow-green-100/50">
          <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200')] bg-cover bg-center"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
          
          <div className="absolute -bottom-8 left-10 flex items-end gap-6">
            <div className="h-36 w-36 bg-white rounded-[32px] shadow-2xl flex items-center justify-center border-[6px] border-white overflow-hidden">
               <div className="bg-green-50 w-full h-full flex items-center justify-center">
                  <Store className="w-16 h-16 text-green-700" />
               </div>
            </div>
            <div className="mb-12">
              <h1 className="text-4xl font-black text-white tracking-tight">{perfil.nombre_local}</h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-black backdrop-blur-md border border-green-500/30">
                  <CheckCircle className="w-3 h-3" /> COMERCIO VERIFICADO
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- COLUMNA LATERAL (INFO FIJA) --- */}
          <div className="space-y-6">
            <Card className="border-none shadow-sm rounded-[32px] bg-white p-8">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Datos de Registro</h3>
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Identificación Fiscal</label>
                  <p className="text-slate-900 font-black flex items-center gap-2">
                    <Hash className="w-4 h-4 text-green-600" /> {perfil.nit}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Correo de Negocio</label>
                  <p className="text-slate-900 font-black flex items-center gap-2 break-all">
                    <Mail className="w-4 h-4 text-green-600" /> {perfil.correo_corporativo}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-50">
                   <div className="flex items-center gap-2 text-green-600 font-black text-xs">
                     <ShieldCheck className="w-4 h-4" /> CUENTA ACTIVA
                   </div>
                </div>
              </div>
            </Card>

            <Card className="border-none shadow-sm rounded-[32px] bg-amber-50 p-6 border border-amber-100">
               <div className="flex items-center gap-2 mb-3 text-amber-700">
                 <Clock className="w-5 h-5" />
                 <h3 className="font-black text-xs uppercase tracking-wider">Recordatorio</h3>
               </div>
               <p className="text-[13px] text-amber-800 font-medium leading-relaxed">
                 Mantén tu dirección actualizada para que los rescatistas lleguen sin problemas a tu local.
               </p>
            </Card>
          </div>

          {/* --- COLUMNA PRINCIPAL (FORMULARIO) --- */}
          <Card className="lg:col-span-2 border-none shadow-xl rounded-[48px] bg-white overflow-hidden transition-all">
            <CardHeader className="p-10 pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl font-black text-slate-900">Configuración General</CardTitle>
                  <p className="text-slate-500 font-medium text-sm mt-1">Actualiza los detalles de tu establecimiento</p>
                </div>
                {!editMode && (
                  <Button 
                    onClick={() => setEditMode(true)} 
                    className="bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-2xl font-black px-6 border-none shadow-none"
                  >
                    Editar
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase ml-2">Nombre del Local</label>
                  <Input 
                    disabled={!editMode} 
                    value={perfil.nombre_local} 
                    onChange={(e) => setPerfil({...perfil, nombre_local: e.target.value})}
                    className={`py-7 rounded-[20px] border-none font-bold text-lg transition-all ${
                      editMode ? "bg-slate-50 ring-2 ring-green-500/20" : "bg-slate-100/50"
                    }`}
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase ml-2 italic text-slate-300">
                    ID Interno (No editable)
                  </label>
                  <div className="py-4 px-6 rounded-[20px] bg-slate-50 text-slate-400 font-mono text-sm border border-slate-100 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> ALI-{aliadoId?.padStart(4, '0')}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase ml-2">Dirección Principal de Recogida</label>
                <div className="relative">
                  <MapPin className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${editMode ? "text-green-600" : "text-slate-400"}`} />
                  <Input 
                    disabled={!editMode} 
                    value={perfil.direccion}
                    onChange={(e) => setPerfil({...perfil, direccion: e.target.value})}
                    className={`pl-14 py-7 rounded-[20px] border-none font-bold text-slate-700 transition-all ${
                      editMode ? "bg-slate-50 ring-2 ring-green-500/20" : "bg-slate-100/50"
                    }`}
                  />
                </div>
                <p className="text-[11px] text-slate-400 font-medium ml-2">
                  Esta ubicación aparecerá en el mapa de los usuarios al buscar comida.
                </p>
              </div>

              {/* BOTONES DE ACCIÓN */}
              {editMode && (
                <div className="pt-6 flex gap-4 animate-in fade-in zoom-in-95 duration-300">
                  <Button 
                    disabled={updating}
                    onClick={() => setEditMode(false)} 
                    variant="ghost" 
                    className="flex-1 py-7 rounded-[24px] font-black text-slate-400 hover:text-slate-600"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    disabled={updating}
                    onClick={handleUpdate} 
                    className="flex-[2] bg-slate-900 hover:bg-green-700 text-white py-7 rounded-[24px] font-black shadow-2xl shadow-slate-200 transition-all active:scale-95"
                  >
                    {updating ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="animate-spin w-5 h-5" /> Guardando...
                      </div>
                    ) : "GUARDAR CAMBIOS 💾"}
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