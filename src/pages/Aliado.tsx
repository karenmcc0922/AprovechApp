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
  Plus,
  Pencil,
  BarChart3,
  TrendingUp,
  History // Icono para el historial
} from "lucide-react";

export default function Aliado() {
  const [loading, setLoading] = useState(false);
  const [productos, setProductos] = useState<any[]>([]);
  const [stats, setStats] = useState({ total_rescates: 0, total_ganado: 0 });
  const [actividad, setActividad] = useState<any[]>([]); // Estado para el historial
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

  // 1. CARGAR TODOS LOS DATOS
  const cargarTodo = async () => {
    const aliadoId = localStorage.getItem("aliado_id");
    if (!aliadoId) return;

    try {
      // Cargar Productos
      const resProd = await fetch(`https://aprovechapp-api.onrender.com/api/mis-productos/${aliadoId}`);
      if (resProd.ok) setProductos(await resProd.json());

      // Cargar Estadísticas
      const resStats = await fetch(`https://aprovechapp-api.onrender.com/api/aliados/${aliadoId}/estadisticas`);
      if (resStats.ok) setStats(await resStats.json());

      // Cargar Historial de Actividad
      const resAct = await fetch(`https://aprovechapp-api.onrender.com/api/aliados/${aliadoId}/actividad`);
      if (resAct.ok) setActividad(await resAct.json());
      
    } catch (error) {
      console.error("Error al sincronizar datos:", error);
    }
  };

  useEffect(() => { cargarTodo(); }, []);

  // 2. LÓGICA DE MANEJO DE IMÁGENES Y PRECIOS (Sin cambios)
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

  // 3. ACCIONES DE PRODUCTO
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
        cargarTodo(); // Recargamos todo para actualizar lista e historial
      }
    } catch (error) { alert("Error"); } finally { setLoading(false); }
  };

  const eliminarProducto = async (id: number) => {
    if (!confirm("¿Deseas eliminar esta oferta permanentemente?")) return;
    try {
      const res = await fetch(`https://aprovechapp-api.onrender.com/api/productos/${id}`, { method: "DELETE" });
      if (res.ok) cargarTodo();
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
      if (res.ok) cargarTodo();
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
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Control de inventario y trazabilidad</p>
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             <span className="text-xs font-black text-slate-700 uppercase tracking-tighter">Nodo TiDB Cloud Activo</span>
          </div>
        </div>

        {/* MÉTRICAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-none shadow-sm rounded-[35px] bg-white p-8 flex items-center gap-5 transition-transform hover:scale-[1.02] border-l-4 border-green-500">
            <div className="bg-green-50 p-4 rounded-2xl"><TrendingUp className="text-green-600 w-6 h-6" /></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ventas Reales</p>
              <h3 className="text-2xl font-black text-slate-900">${Number(stats.total_ganado || 0).toLocaleString()}</h3>
              <p className="text-[9px] text-green-600 font-bold uppercase">{stats.total_rescates} rescates hoy</p>
            </div>
          </Card>

          <Card className="border-none shadow-sm rounded-[35px] bg-white p-8 flex items-center gap-5 transition-transform hover:scale-[1.02]">
            <div className="bg-blue-50 p-4 rounded-2xl"><DollarSign className="text-blue-600 w-6 h-6" /></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Valor Inventario</p>
              <h3 className="text-2xl font-black text-slate-900">
                ${productos.reduce((acc, p) => acc + (Number(p.precio_rescate) * Number(p.stock)), 0).toLocaleString()}
              </h3>
              <p className="text-[9px] text-blue-600 font-bold uppercase">Por recuperar</p>
            </div>
          </Card>

          <Card className="border-none shadow-sm rounded-[35px] bg-white p-8 flex items-center gap-5 transition-transform hover:scale-[1.02]">
            <div className="bg-purple-50 p-4 rounded-2xl"><BarChart3 className="text-purple-600 w-6 h-6" /></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Items en Tienda</p>
              <h3 className="text-2xl font-black text-slate-900">{productos.length} SKU</h3>
              <p className="text-[9px] text-purple-600 font-bold uppercase">Ofertas activas</p>
            </div>
          </Card>
        </div>

        {/* CONTENIDO PRINCIPAL: 3 COLUMNAS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* COLUMNA 1: FORMULARIO (Ancho 4) */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-none shadow-2xl rounded-[45px] bg-white overflow-hidden sticky top-32">
              <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Plus className="w-5 h-5 text-green-400"/>
                  <span className="font-black text-sm uppercase tracking-widest">Crear Oferta</span>
                </div>
              </div>

              <CardContent className="p-8 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div 
                    onClick={() => setNuevoProducto({...nuevoProducto, esSorpresa: !nuevoProducto.esSorpresa})}
                    className={`cursor-pointer p-4 rounded-3xl border-2 transition-all flex justify-between items-center ${nuevoProducto.esSorpresa ? "bg-green-50 border-green-500 shadow-inner" : "bg-slate-50 border-slate-100"}`}
                  >
                    <div className="flex gap-4 items-center">
                      <div className={`p-2 rounded-xl ${nuevoProducto.esSorpresa ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                        {nuevoProducto.esSorpresa ? <Gift className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                      </div>
                      <p className="font-black text-[10px] text-slate-800 uppercase italic">
                        {nuevoProducto.esSorpresa ? "Pack Sorpresa" : "Producto Único"}
                      </p>
                    </div>
                  </div>

                  {!nuevoProducto.esSorpresa && (
                    <div className="space-y-3">
                      {imagePreview ? (
                        <div className="relative h-32 rounded-[25px] overflow-hidden border-2 border-slate-100">
                          <img src={imagePreview} className="w-full h-full object-cover" />
                          <button onClick={removeImage} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"><X size={12}/></button>
                        </div>
                      ) : (
                        <label className="w-full h-32 border-2 border-dashed rounded-[25px] flex flex-col items-center justify-center cursor-pointer border-slate-200 hover:bg-slate-50 transition-all">
                          <ImageIcon className="w-5 h-5 text-slate-300 mb-2" />
                          <span className="text-[9px] font-black text-slate-400 uppercase">Cargar Foto</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        </label>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Producto</Label>
                    <Input className="rounded-xl bg-slate-50 border-none font-bold" placeholder="Nombre" value={nuevoProducto.nombre} onChange={e => setNuevoProducto({...nuevoProducto, nombre: e.target.value})} required />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Precio Original</Label>
                      <Input type="number" className="rounded-xl bg-slate-50 border-none font-black" value={nuevoProducto.precio_original} onChange={e => handlePrecioOriginalChange(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label>% Dcto</Label>
                      <Input type="number" className="rounded-xl bg-slate-50 border-none font-black text-green-600" value={descuentoManual} onChange={e => handleDescuentoChange(e.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Stock Disponible</Label>
                    <Input type="number" className="rounded-xl bg-slate-50 border-none font-black" value={nuevoProducto.stock} onChange={e => setNuevoProducto({...nuevoProducto, stock: e.target.value})} required />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full bg-slate-900 py-6 rounded-[20px] font-black text-[11px] tracking-widest hover:bg-green-600 transition-all uppercase">
                    {loading ? <Loader2 className="animate-spin" /> : "Publicar ahora 🚀"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* COLUMNA 2: INVENTARIO (Ancho 5) */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-lg font-black text-slate-800 uppercase italic">Inventario Activo</h2>
            <div className="grid gap-4">
              {productos.map((prod) => (
                <Card key={prod.id} className="border-none shadow-sm rounded-[30px] p-5 bg-white hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img src={prod.imagen_url || IMG_SORPRESA} className="w-16 h-16 rounded-2xl object-cover" />
                      <div>
                        <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight">{prod.nombre}</h4>
                        <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase ${prod.stock === 0 ? "bg-red-100 text-red-600" : "bg-green-50 text-green-600"}`}>
                          Stock: {prod.stock}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => editarStock(prod)} variant="outline" className="h-10 w-10 p-0 rounded-xl border-none bg-slate-50 text-slate-400 hover:text-blue-600"><Pencil size={14}/></Button>
                      <Button onClick={() => eliminarProducto(prod.id)} variant="outline" className="h-10 w-10 p-0 rounded-xl border-none bg-slate-50 text-slate-400 hover:text-red-500"><Trash2 size={14}/></Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* COLUMNA 3: HISTORIAL (Ancho 3) */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="border-none shadow-sm rounded-[35px] bg-white p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-slate-900 rounded-xl">
                  <History className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-black text-slate-900 text-xs uppercase tracking-tighter italic">Actividad Reciente</h3>
              </div>

              <div className="space-y-8 relative">
                {/* Línea de tiempo vertical */}
                <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-slate-50" />

                {actividad.length === 0 ? (
                  <p className="text-[10px] font-bold text-slate-400 uppercase text-center py-4 italic">Sin movimientos registrados</p>
                ) : (
                  actividad.map((log) => (
                    <div key={log.id} className="relative pl-8">
                      {/* Círculo indicador */}
                      <div className={`absolute left-0 top-1 w-4 h-4 rounded-full border-4 border-white shadow-sm z-10 ${
                        log.tipo_evento === 'VENTA' ? 'bg-green-500' : 
                        log.tipo_evento === 'STOCK' ? 'bg-blue-500' : 'bg-slate-900'
                      }`} />
                      
                      <p className="text-[11px] font-bold text-slate-800 leading-tight">{log.descripcion}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase mt-1 tracking-widest">
                        {new Date(log.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-[9px] font-black uppercase text-slate-400 ml-1 block mb-1 tracking-widest">{children}</label>;
}