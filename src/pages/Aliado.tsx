import { useState, useEffect } from "react";
import AppNavbar from "../components/AppNavbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, Package, Trash2, Tag, Loader2, 
  TrendingUp, Leaf, DollarSign, Store 
} from "lucide-react";

export default function Aliado() {
  const [loading, setLoading] = useState(false);
  const [productos, setProductos] = useState([]);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    precio_original: "",
    precio_rescate: "",
    stock: "",
    descripcion: "Pack sorpresa de productos frescos"
  });

  // Estadísticas calculadas (Simuladas basadas en productos reales + un factor de éxito)
  const stats = {
    ganancias: productos.reduce((acc: number, curr: any) => acc + (Number(curr.precio_rescate) * 5), 0),
    packsVendidos: productos.length * 12, // Simulación
    co2Ahorrado: (productos.length * 12 * 2.5).toFixed(1) // 2.5kg por pack aprox
  };

  const cargarProductos = async () => {
    const aliadoId = localStorage.getItem("aliado_id");
    if (!aliadoId) return;
    try {
      const res = await fetch(`https://aprovechapp-api.onrender.com/api/mis-productos/${aliadoId}`);
      if (res.ok) {
        const data = await res.json();
        setProductos(data);
      }
    } catch (error) {
      console.error("Error cargando productos:", error);
    }
  };

  useEffect(() => { cargarProductos(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const aliadoId = localStorage.getItem("aliado_id");
    if (!aliadoId) return;

    setLoading(true);
    try {
      const res = await fetch("https://aprovechapp-api.onrender.com/api/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...nuevoProducto, aliado_id: parseInt(aliadoId) })
      });
      if (res.ok) {
        setNuevoProducto({ nombre: "", precio_original: "", precio_rescate: "", stock: "", descripcion: "Pack sorpresa" });
        cargarProductos();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNavbar />
      
      <main className="container mx-auto px-4 pt-28 pb-12 max-w-7xl">
        
        {/* --- SECCIÓN DE ESTADÍSTICAS (MÉTRICAS) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="border-none shadow-sm bg-white rounded-[32px] overflow-hidden">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-green-100 p-4 rounded-2xl">
                <DollarSign className="text-green-600 w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Dinero Recuperado</p>
                <h3 className="text-2xl font-black text-slate-900">${stats.ganancias.toLocaleString()}</h3>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white rounded-[32px] overflow-hidden">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-blue-100 p-4 rounded-2xl">
                <TrendingUp className="text-blue-600 w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Rescates Exitosos</p>
                <h3 className="text-2xl font-black text-slate-900">{stats.packsVendidos} packs</h3>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-green-900 rounded-[32px] overflow-hidden">
            <CardContent className="p-6 flex items-center gap-4 text-white">
              <div className="bg-white/20 p-4 rounded-2xl">
                <Leaf className="text-green-300 w-6 h-6" />
              </div>
              <div>
                <p className="text-green-200/70 text-xs font-bold uppercase tracking-wider">Planeta Salvado</p>
                <h3 className="text-2xl font-black">{stats.co2Ahorrado}kg CO2e</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna Izquierda: Formulario */}
          <div className="space-y-6">
            <Card className="border-none shadow-xl rounded-[40px] bg-white overflow-hidden">
              <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Store className="w-5 h-5 text-green-400" />
                  <span className="font-bold">Estado del Local</span>
                </div>
                <Badge className="bg-green-500 text-white border-none px-3 py-1">ABIERTO</Badge>
              </div>
              <CardContent className="p-8">
                <h2 className="text-xl font-black mb-6 flex items-center gap-2 text-slate-800">
                  <Plus className="text-green-600" /> Publicar Oferta
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nombre del Pack</Label>
                    <Input placeholder="Ej: Bolsa de Panes Variados" className="rounded-xl border-slate-100 bg-slate-50 py-6" value={nuevoProducto.nombre} onChange={e => setNuevoProducto({...nuevoProducto, nombre: e.target.value})} required />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Precio Original</Label>
                      <Input type="number" placeholder="30000" className="rounded-xl border-slate-100 bg-slate-50 py-6" value={nuevoProducto.precio_original} onChange={e => setNuevoProducto({...nuevoProducto, precio_original: e.target.value})} required />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Precio Rescate</Label>
                      <Input type="number" placeholder="12000" className="rounded-xl border-slate-100 bg-slate-50 py-6" value={nuevoProducto.precio_rescate} onChange={e => setNuevoProducto({...nuevoProducto, precio_rescate: e.target.value})} required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Unidades Disponibles</Label>
                    <Input type="number" placeholder="5" className="rounded-xl border-slate-100 bg-slate-50 py-6" value={nuevoProducto.stock} onChange={e => setNuevoProducto({...nuevoProducto, stock: e.target.value})} required />
                  </div>

                  <Button disabled={loading} className="w-full bg-green-600 hover:bg-green-700 py-7 rounded-2xl font-black text-lg shadow-lg shadow-green-100 transition-all active:scale-95">
                    {loading ? <Loader2 className="animate-spin" /> : "PUBLICAR AHORA 🚀"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Columna Derecha: Inventario */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-black flex items-center gap-2">
                <Package className="text-slate-400" /> Inventario Activo
              </h2>
              <span className="text-xs font-bold text-slate-400 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
                {productos.length} Productos publicados
              </span>
            </div>
            
            {productos.length === 0 ? (
              <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-slate-200">
                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="text-slate-300 w-10 h-10" />
                </div>
                <h3 className="text-slate-800 font-black text-xl">¿Qué rescataremos hoy?</h3>
                <p className="text-slate-400 font-medium">Aún no tienes productos activos en el catálogo.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {productos.map((prod: any) => (
                  <div key={prod.id} className="bg-white p-6 rounded-[32px] shadow-sm flex items-center justify-between border border-slate-50 hover:border-green-200 transition-all group">
                    <div className="flex items-center gap-5">
                      <div className="bg-green-50 p-4 rounded-[20px] group-hover:bg-green-600 transition-colors">
                        <Tag className="text-green-600 w-6 h-6 group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-800 uppercase tracking-tight">{prod.nombre}</h3>
                        <div className="flex gap-3 mt-1">
                          <span className="text-[10px] font-black px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md">STOCK: {prod.stock}</span>
                          <span className="text-[10px] font-black px-2 py-0.5 bg-green-100 text-green-700 rounded-md">
                            -{Math.round(((prod.precio_original - prod.precio_rescate) / prod.precio_original) * 100)}% DESC
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-xs text-slate-300 font-bold line-through">${Number(prod.precio_original).toLocaleString()}</p>
                        <p className="text-xl font-black text-slate-900">${Number(prod.precio_rescate).toLocaleString()}</p>
                      </div>
                      <Button variant="ghost" className="h-12 w-12 rounded-2xl text-red-400 hover:text-red-600 hover:bg-red-50 transition-all">
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Pequeño componente Badge y Label que suelen ser de Shadcn
function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return <span className={`text-[10px] font-black rounded-full ${className}`}>{children}</span>;
}

function Label({ children, className }: { children: React.ReactNode, className?: string }) {
  return <label className={`block ${className}`}>{children}</label>;
}