import { useState, useEffect } from "react";
import AppNavbar from "../components/AppNavbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Package, 
  Trash2, 
  Loader2, 
  DollarSign, 
  Image as ImageIcon,
  X, 
  Gift, 
  CheckCircle2, 
  Plus,
  Pencil
} from "lucide-react";

export default function Aliado() {
  const [loading, setLoading] = useState(false);
  const [productos, setProductos] = useState<any[]>([]);
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

  const cargarProductos = async () => {
    const aliadoId = localStorage.getItem("aliado_id");
    if (!aliadoId) return;
    try {
      const res = await fetch(`https://aprovechapp-api.onrender.com/api/mis-productos/${aliadoId}`);
      if (res.ok) {
        const data = await res.json();
        setProductos(data);
      }
    } catch (error) { console.error(error); }
  };

  useEffect(() => { cargarProductos(); }, []);

  // --- FUNCIONES DE ARCHIVOS (Recuperadas para limpiar errores) ---
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

  // --- LÓGICA DE GESTIÓN (EDITAR Y ELIMINAR) ---
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
      if (res.ok) setProductos(productos.map(p => p.id === prod.id ? { ...p, stock: nuevoStock } : p));
    } catch (error) { alert("Error al editar"); }
  };

  // --- LÓGICA DE PRECIOS ---
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
        cargarProductos();
      }
    } catch (error) { alert("Error"); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <AppNavbar />
      <main className="container mx-auto px-4 pt-28 pb-12 max-w-7xl">
        
        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="border-none shadow-sm rounded-[32px] bg-white p-6 flex items-center gap-4">
            <div className="bg-green-100 p-4 rounded-2xl"><DollarSign className="text-green-600" /></div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ingresos Proyectados</p>
              <h3 className="text-2xl font-black text-slate-900">
                ${productos.reduce((acc, p) => acc + (Number(p.precio_rescate) * Number(p.stock)), 0).toLocaleString()}
              </h3>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FORMULARIO DE CREACIÓN */}
          <div className="space-y-6">
            <Card className="border-none shadow-xl rounded-[40px] bg-white overflow-hidden">
              <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                <span className="font-bold flex items-center gap-2 text-sm"><Plus className="w-4 h-4 text-green-400"/> NUEVA OFERTA</span>
              </div>

              <CardContent className="p-8 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Selector Sorpresa / Real */}
                  <div 
                    onClick={() => setNuevoProducto({...nuevoProducto, esSorpresa: !nuevoProducto.esSorpresa})}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex justify-between items-center ${nuevoProducto.esSorpresa ? "bg-green-50 border-green-500" : "bg-slate-50 border-slate-100"}`}
                  >
                    <div className="flex gap-3 items-center">
                      <div className={`p-2 rounded-xl ${nuevoProducto.esSorpresa ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                        {nuevoProducto.esSorpresa ? <Gift className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                      </div>
                      <p className="font-black text-xs text-slate-800 uppercase">Pack Sorpresa</p>
                    </div>
                    {nuevoProducto.esSorpresa && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                  </div>

                  {/* Subida de Imagen */}
                  {!nuevoProducto.esSorpresa && (
                    <div className="space-y-2">
                      <Label>Foto del Producto</Label>
                      {imagePreview ? (
                        <div className="relative h-32 rounded-2xl overflow-hidden shadow-inner">
                          <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                          <button onClick={removeImage} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"><X size={14}/></button>
                        </div>
                      ) : (
                        <label className="w-full h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer border-slate-300 hover:bg-slate-50">
                          <ImageIcon className="w-6 h-6 text-slate-300 mb-1" />
                          <span className="text-[9px] font-black text-slate-400 uppercase">Subir Foto Real</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        </label>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Nombre del Producto</Label>
                    <Input className="rounded-xl bg-slate-50 border-none" value={nuevoProducto.nombre} onChange={e => setNuevoProducto({...nuevoProducto, nombre: e.target.value})} required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Precio Original</Label>
                      <Input type="number" className="rounded-xl" value={nuevoProducto.precio_original} onChange={e => handlePrecioOriginalChange(e.target.value)} required />
                    </div>
                    <div>
                      <Label>Descuento %</Label>
                      <Input type="number" className="rounded-xl" value={descuentoManual} onChange={e => handleDescuentoChange(e.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Stock Disponible</Label>
                    <Input type="number" className="rounded-xl" value={nuevoProducto.stock} onChange={e => setNuevoProducto({...nuevoProducto, stock: e.target.value})} required />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full bg-slate-900 py-7 rounded-2xl font-black text-base shadow-lg hover:bg-green-600 transition-all">
                    {loading ? <Loader2 className="animate-spin" /> : "PUBLICAR RESCATE 🚀"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* LISTA DE INVENTARIO */}
          <div className="lg:col-span-2 space-y-5">
            <h2 className="text-xl font-black text-slate-800 flex gap-2 items-center"><Package className="text-slate-400"/> Inventario Activo</h2>
            <div className="grid gap-4">
              {productos.length === 0 ? (
                <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-slate-200 text-slate-400 font-bold uppercase text-xs">No hay ofertas activas</div>
              ) : (
                productos.map((prod) => (
                  <Card key={prod.id} className="border-none shadow-sm rounded-[32px] p-4 bg-white">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <img src={prod.imagen_url || IMG_SORPRESA} className="w-16 h-16 rounded-2xl object-cover shadow-sm" />
                        <div>
                          <h4 className="font-black text-slate-800 text-sm uppercase">{prod.nombre}</h4>
                          <p className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded inline-block mt-1 uppercase">Stock: {prod.stock}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-black text-slate-900">${Number(prod.precio_rescate).toLocaleString()}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => editarStock(prod)} variant="outline" className="h-10 w-10 p-0 rounded-xl border-slate-100 text-slate-400 hover:text-blue-600"><Pencil size={16}/></Button>
                          <Button onClick={() => eliminarProducto(prod.id)} variant="outline" className="h-10 w-10 p-0 rounded-xl border-slate-100 text-slate-400 hover:text-red-500"><Trash2 size={16}/></Button>
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

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-[10px] font-black uppercase text-slate-400 ml-1 block mb-1 tracking-widest">{children}</label>;
}