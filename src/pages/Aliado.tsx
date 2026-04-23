import { useState, useEffect } from "react";
import AppNavbar from "../components/AppNavbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Trash2, 
  Loader2, 
  DollarSign, 
  Image as ImageIcon,
  X, 
  Gift, 
  CheckCircle2, 
  Plus,
  Pencil,
  BarChart3,
  TrendingUp,
  AlertCircle
} from "lucide-react";

export default function Aliado() {
  const [loading, setLoading] = useState(false);
  const [productos, setProductos] = useState<any[]>([]);
  const [stats, setStats] = useState({ total_rescates: 0, total_ganado: 0 });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    precio_original: "",
    precio_rescate: "",
    stock: "",
    descripcion: "Pack sorpresa de productos frescos",
    esSorpresa: true,
    imagen_url: ""
  });

  const [descuentoManual, setDescuentoManual] = useState("");
  const IMG_SORPRESA = "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&q=80";

  // 1. CARGAR PRODUCTOS Y ESTADÍSTICAS
  const cargarDatos = async () => {
    const aliadoId = localStorage.getItem("aliado_id");
    if (!aliadoId) return;

    try {
      // Cargar Productos
      const resProd = await fetch(`https://aprovechapp-api.onrender.com/api/mis-productos/${aliadoId}`);
      if (resProd.ok) setProductos(await resProd.json());

      // Cargar Estadísticas (Ventas Reales)
      const resStats = await fetch(`https://aprovechapp-api.onrender.com/api/aliados/${aliadoId}/estadisticas`);
      if (resStats.ok) setStats(await resStats.json());
      
    } catch (error) {
      console.error("Error al sincronizar datos:", error);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  // 2. LÓGICA DE FORMULARIO
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        setNuevoProducto(prev => ({ ...prev, esSorpresa: false, imagen_url: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setNuevoProducto(prev => ({ ...prev, esSorpresa: true, imagen_url: "" }));
  };

  const handlePrecioOriginalChange = (val: string) => {
    const original = Number(val);
    const desc = Number(descuentoManual);
    let rescate = nuevoProducto.precio_rescate;
    if (original > 0 && desc > 0) rescate = Math.round(original * (1 - desc / 100)).toString();
    setNuevoProducto({ ...nuevoProducto, precio_original: val, precio_rescate: rescate });
  };

  const handleDescuentoChange = (val: string) => {
    const original = Number(nuevoProducto.precio_original);
    setDescuentoManual(val);
    if (original > 0 && Number(val) > 0) {
      const nuevoRescate = Math.round(original * (1 - Number(val) / 100));
      setNuevoProducto({ ...nuevoProducto, precio_rescate: nuevoRescate.toString() });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const aliadoId = localStorage.getItem("aliado_id");
    if (!aliadoId) return;
    setLoading(true);
    try {
      const payload = {
        aliado_id: parseInt(aliadoId),
        nombre: nuevoProducto.nombre,
        precio_original: parseFloat(nuevoProducto.precio_original),
        precio_rescate: parseFloat(nuevoProducto.precio_rescate),
        stock: parseInt(nuevoProducto.stock),
        imagen_url: nuevoProducto.esSorpresa ? IMG_SORPRESA : nuevoProducto.imagen_url
      };
      const res = await fetch("https://aprovechapp-api.onrender.com/api/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setNuevoProducto({ nombre: "", precio_original: "", precio_rescate: "", stock: "", descripcion: "Pack sorpresa", esSorpresa: true, imagen_url: "" });
        setImagePreview(null);
        setDescuentoManual("");
        cargarDatos();
      }
    } catch (error) { alert("Error"); } finally { setLoading(false); }
  };

  const eliminarProducto = async (id: number) => {
    if (!confirm("¿Deseas eliminar esta oferta permanentemente?")) return;
    try {
      const res = await fetch(`https://aprovechapp-api.onrender.com/api/productos/${id}`, { method: "DELETE" });
      if (res.ok) setProductos(productos.filter(p => p.id !== id));
    } catch (error) { alert("Error al eliminar"); }
  };

  const editarStock = async (prod: any) => {
    const nuevoStock = prompt(`Actualizar stock para ${prod.nombre}:`, prod.stock);
    if (nuevoStock === null || nuevoStock === "") return;
    try {
      const res = await fetch(`https://aprovechapp-api.onrender.com/api/productos/${prod.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          nombre: prod.nombre, 
          precio_rescate: prod.precio_rescate, 
          stock: parseInt(nuevoStock) 
        })
      });
      if (res.ok) cargarDatos();
    } catch (error) { alert("Error al editar"); }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AppNavbar />
      <main className="container mx-auto px-4 pt-32 pb-12 max-w-7xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">
              Dashboard <span className="text-green-600">Aliado</span>
            </h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Control de inventario y métricas de impacto</p>
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             <span className="text-xs font-black text-slate-700 uppercase tracking-tighter">Conexión Segura con TiDB</span>
          </div>
        </div>

        {/* MÉTRICAS MEJORADAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Ganancia Real */}
          <Card className="border-none shadow-sm rounded-[35px] bg-white p-8 flex items-center gap-5 transition-transform hover:scale-[1.02] border-l-4 border-green-500">
            <div className="bg-green-50 p-4 rounded-2xl"><TrendingUp className="text-green-600 w-6 h-6" /></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ventas Reales</p>
              <h3 className="text-2xl font-black text-slate-900">${Number(stats.total_ganado || 0).toLocaleString()}</h3>
              <p className="text-[9px] text-green-600 font-bold uppercase">{stats.total_rescates} pedidos completados</p>
            </div>
          </Card>

          {/* Ganancia Potencial */}
          <Card className="border-none shadow-sm rounded-[35px] bg-white p-8 flex items-center gap-5 transition-transform hover:scale-[1.02]">
            <div className="bg-blue-50 p-4 rounded-2xl"><DollarSign className="text-blue-600 w-6 h-6" /></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Valor Inventario</p>
              <h3 className="text-2xl font-black text-slate-900">
                ${productos.reduce((acc, p) => acc + (Number(p.precio_rescate) * Number(p.stock)), 0).toLocaleString()}
              </h3>
              <p className="text-[9px] text-blue-600 font-bold uppercase">Dinero por recuperar</p>
            </div>
          </Card>

          {/* Variedad de Ofertas */}
          <Card className="border-none shadow-sm rounded-[35px] bg-white p-8 flex items-center gap-5 transition-transform hover:scale-[1.02]">
            <div className="bg-purple-50 p-4 rounded-2xl"><BarChart3 className="text-purple-600 w-6 h-6" /></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ofertas Activas</p>
              <h3 className="text-2xl font-black text-slate-900">{productos.length} Items</h3>
              <p className="text-[9px] text-purple-600 font-bold uppercase">Gestión de excedentes</p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* FORMULARIO */}
          <div className="space-y-6">
            <Card className="border-none shadow-2xl rounded-[45px] bg-white overflow-hidden">
              <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Plus className="w-5 h-5 text-green-400"/>
                  <span className="font-black text-sm uppercase tracking-widest">Crear Nueva Oferta</span>
                </div>
              </div>

              <CardContent className="p-10 space-y-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Selector Sorpresa */}
                  <div 
                    onClick={() => setNuevoProducto({...nuevoProducto, esSorpresa: !nuevoProducto.esSorpresa})}
                    className={`cursor-pointer p-5 rounded-3xl border-2 transition-all flex justify-between items-center ${nuevoProducto.esSorpresa ? "bg-green-50 border-green-500 shadow-inner" : "bg-slate-50 border-slate-100"}`}
                  >
                    <div className="flex gap-4 items-center">
                      <div className={`p-3 rounded-2xl ${nuevoProducto.esSorpresa ? 'bg-green-600 text-white shadow-lg' : 'bg-slate-200 text-slate-400'}`}>
                        {nuevoProducto.esSorpresa ? <Gift className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                      </div>
                      <p className="font-black text-xs text-slate-800 uppercase tracking-tight">
                        {nuevoProducto.esSorpresa ? "Pack Sorpresa" : "Producto Único"}
                      </p>
                    </div>
                    {nuevoProducto.esSorpresa && <CheckCircle2 className="w-6 h-6 text-green-600" />}
                  </div>

                  {/* Imagen */}
                  {!nuevoProducto.esSorpresa && (
                    <div className="space-y-3">
                      <Label>Imagen Real</Label>
                      {imagePreview ? (
                        <div className="relative h-40 rounded-[30px] overflow-hidden shadow-xl border-4 border-white">
                          <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                          <button onClick={removeImage} className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"><X size={16}/></button>
                        </div>
                      ) : (
                        <label className="w-full h-40 border-2 border-dashed rounded-[30px] flex flex-col items-center justify-center cursor-pointer border-slate-200 hover:bg-slate-50 hover:border-green-400 transition-all group">
                          <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-green-50 transition-colors">
                            <ImageIcon className="w-6 h-6 text-slate-300 group-hover:text-green-500" />
                          </div>
                          <span className="text-[10px] font-black text-slate-400 uppercase mt-3 tracking-widest">Cargar Fotografía</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        </label>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>¿Qué vas a rescatar?</Label>
                    <Input className="rounded-2xl bg-slate-50 border-none py-6 font-bold text-slate-700" placeholder="Ej: Bolsa de Croissants" value={nuevoProducto.nombre} onChange={e => setNuevoProducto({...nuevoProducto, nombre: e.target.value})} required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Precio Base</Label>
                      <Input type="number" className="rounded-2xl bg-slate-50 border-none py-6 font-black" placeholder="30000" value={nuevoProducto.precio_original} onChange={e => handlePrecioOriginalChange(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Descuento %</Label>
                      <Input type="number" className="rounded-2xl bg-slate-50 border-none py-6 font-black text-green-600" placeholder="50" value={descuentoManual} onChange={e => handleDescuentoChange(e.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Cantidad de Packs (Stock)</Label>
                    <Input type="number" className="rounded-2xl bg-slate-50 border-none py-6 font-black" placeholder="5" value={nuevoProducto.stock} onChange={e => setNuevoProducto({...nuevoProducto, stock: e.target.value})} required />
                  </div>

                  <div className="pt-4">
                    <Button type="submit" disabled={loading} className="w-full bg-slate-900 py-8 rounded-[25px] font-black text-sm tracking-widest shadow-xl hover:bg-green-600 transition-all uppercase">
                      {loading ? <Loader2 className="animate-spin" /> : "Publicar ahora 🚀"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* LISTA DE INVENTARIO */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-800 flex gap-3 items-center uppercase tracking-tighter italic">
                   Tu Inventario <span className="text-green-600">Actual</span>
                </h2>
                <Badge className="bg-slate-200 text-slate-600 border-none font-black px-4 py-1 rounded-full uppercase text-[10px]">
                  {productos.length} items activos
                </Badge>
            </div>
            
            <div className="grid gap-5">
              {productos.length === 0 ? (
                <div className="bg-white rounded-[45px] py-32 text-center border-2 border-dashed border-slate-100 flex flex-col items-center">
                    <img src="/logo.png" className="w-12 h-12 grayscale opacity-20 mb-4" />
                    <p className="font-black text-slate-300 uppercase text-[10px] tracking-widest">Aún no tienes ofertas publicadas</p>
                </div>
              ) : (
                productos.map((prod) => (
                  <Card key={prod.id} className="border-none shadow-sm rounded-[35px] p-6 bg-white hover:shadow-xl transition-shadow group">
                    <div className="flex items-center justify-between gap-6 flex-wrap md:flex-nowrap">
                      <div className="flex items-center gap-6">
                        <div className="relative">
                            <img src={prod.imagen_url || IMG_SORPRESA} className="w-20 h-20 rounded-[25px] object-cover shadow-md group-hover:scale-105 transition-transform" />
                            {prod.stock < 3 && prod.stock > 0 && (
                              <div className="absolute -top-2 -right-2 bg-amber-500 p-1 rounded-full border-2 border-white shadow-lg">
                                <AlertCircle size={12} className="text-white" />
                              </div>
                            )}
                        </div>
                        <div>
                          <h4 className="font-black text-slate-800 text-base uppercase tracking-tight mb-1">{prod.nombre}</h4>
                          <div className="flex gap-2 items-center flex-wrap">
                             <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase transition-all ${
                               prod.stock === 0 
                               ? "bg-red-100 text-red-600 animate-pulse" 
                               : "bg-green-50 text-green-600"
                             }`}>
                                {prod.stock === 0 ? "¡AGOTADO!" : `Stock: ${prod.stock}`}
                             </span>
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ref: #${prod.id}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                        <div className="text-right">
                          <p className="text-2xl font-black text-slate-900 tracking-tighter">${Number(prod.precio_rescate).toLocaleString()}</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest line-through">${Number(prod.precio_original).toLocaleString()}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => editarStock(prod)} variant="outline" className="h-12 w-12 p-0 rounded-2xl border-slate-50 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all border-none"><Pencil size={18}/></Button>
                          <Button onClick={() => eliminarProducto(prod.id)} variant="outline" className="h-12 w-12 p-0 rounded-2xl border-slate-50 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all border-none"><Trash2 size={18}/></Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Subcomponentes
function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-[10px] font-black uppercase text-slate-400 ml-1 block mb-2 tracking-widest">{children}</label>;
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>{children}</span>;
}