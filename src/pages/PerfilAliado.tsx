import { useState, useEffect } from "react";
import AppNavbar from "../components/AppNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Store, MapPin, Mail, Hash, ShieldCheck, Loader2 } from "lucide-react";

export default function PerfilAliado() {
  const aliadoId = localStorage.getItem("aliado_id");
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  const [perfil, setPerfil] = useState({
    nombre_local: "",
    nit: "",
    correo_corporativo: "",
    direccion: "",
  });

  // 1. Cargar datos actuales del comercio
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
    setLoading(true);
    // Aquí iría el fetch PUT a tu API para actualizar la dirección
    setTimeout(() => {
      setEditMode(false);
      setLoading(false);
      alert("Perfil actualizado correctamente");
    }, 1000);
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNavbar />
      <main className="container mx-auto px-4 pt-28 pb-12 max-w-4xl">
        
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-green-700 p-4 rounded-3xl shadow-lg shadow-green-100">
            <Store className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900">Configuración del Local</h1>
            <p className="text-slate-500 font-medium">Gestiona la información pública de tu comercio.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Columna Izquierda: Datos Fijos */}
          <Card className="border-none shadow-sm rounded-[32px] bg-white p-6 h-fit">
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase">Estado de Cuenta</label>
                <div className="flex items-center gap-2 mt-1 text-green-600 font-bold">
                  <ShieldCheck className="w-4 h-4" /> Verificado
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase">NIT Registrado</label>
                <p className="text-slate-900 font-bold flex items-center gap-2 mt-1">
                  <Hash className="w-4 h-4 text-slate-300" /> {perfil.nit}
                </p>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase">Correo de Facturación</label>
                <p className="text-slate-900 font-bold flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4 text-slate-300" /> {perfil.correo_corporativo}
                </p>
              </div>
            </div>
          </Card>

          {/* Columna Derecha: Datos Editables */}
          <Card className="md:col-span-2 border-none shadow-xl rounded-[40px] bg-white overflow-hidden">
            <CardHeader className="p-8 bg-slate-900 text-white">
              <CardTitle className="text-xl font-bold">Información del Establecimiento</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Nombre Comercial</label>
                <Input 
                  disabled={!editMode} 
                  value={perfil.nombre_local} 
                  className="py-6 rounded-2xl bg-slate-50 border-none font-bold text-lg"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Dirección de Recogida</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input 
                    disabled={!editMode} 
                    value={perfil.direccion}
                    onChange={(e) => setPerfil({...perfil, direccion: e.target.value})}
                    className="pl-12 py-6 rounded-2xl bg-slate-50 border-none font-medium"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                {!editMode ? (
                  <Button onClick={() => setEditMode(true)} className="flex-1 bg-green-700 hover:bg-green-800 py-6 rounded-2xl font-black">
                    Editar Información
                  </Button>
                ) : (
                  <>
                    <Button onClick={() => setEditMode(false)} variant="outline" className="flex-1 py-6 rounded-2xl font-black">
                      Cancelar
                    </Button>
                    <Button onClick={handleUpdate} className="flex-1 bg-green-700 py-6 rounded-2xl font-black">
                      Guardar Cambios
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}