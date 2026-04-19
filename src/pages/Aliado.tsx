import { useState, useEffect } from "react";
import AppNavbar from "../components/AppNavbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Package, Trash2, Loader2, 
  TrendingUp, Leaf, DollarSign, Store,
  Percent, Image as Gift,
  CheckCircle2
} from "lucide-react";

export default function Aliado() {
  const [loading, setLoading] = useState(false);
  const [productos, setProductos] = useState([]);
  
  // Estado para el formulario
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

  // --- LÓGICA DE CÁLCULOS INTELIGENTES ---

  const handlePrecioOriginalChange = (val: string) => {
    const original = Number(val);
    const desc = Number(descuentoManual);
    let rescate = nuevoProducto.precio_rescate;

    if (original > 0 && desc > 0) {
      rescate = Math.round(original * (1 - desc / 100)).toString();
    }
    setNuevoProducto({ ...nuevoProducto, precio_original: val, precio_rescate: rescate });
  };

  const handlePrecioRescateChange = (val: string) => {
    const original = Number(nuevoProducto.precio_original);
    const rescate = Number(val);
    
    if (original > 0 && rescate > 0) {
      const pct = Math.round(((original - rescate) / original) * 100);
      setDescuentoManual(pct.toString());
    }
    setNuevoProducto({ ...nuevoProducto, precio_rescate: val });
  };

  const handleDescuentoChange = (val: string) => {
    const original = Number(nuevoProducto.precio_original);
    const pct = Number(val);
    setDescuentoManual(val);

    if (original > 0 && pct > 0) {
      const nuevoRescate = Math.round(original * (1 - pct / 100));
      setNuevoProducto({ ...nuevoProducto, precio_rescate: nuevoRescate.toString() });
    }
  };

  // --- PETICIONES API ---

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
    
    // Lógica de imagen: Prioridad a Pack Sorpresa o URL manual
    const imgFinal = nuevoProducto.esSorpresa 
      ? IMG_SORPRESA 
      : (nuevoProducto.imagen_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500");

    try {
      const res = await fetch("https://aprovechapp-api.onrender.com/api/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...nuevoProducto, 
          imagen_url: imgFinal,
          aliado_id: parseInt(aliadoId) 
        })
      });
      if (res.ok) {
        setNuevoProducto({ 
          nombre: "", precio_original: "", precio_rescate: "", 
          stock: "", descripcion: "Pack sorpresa", esSorpresa: true, imagen_url: "" 
        });
        setDescuentoManual("");
        cargarProductos();
      }
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    ganancias: productos.reduce((acc: number, curr: any) => acc + (Number(curr.precio_rescate) * 5), 0),
    packsVendidos: productos.length * 12,
    co2Ahorrado: (productos.length * 12 * 2.5).toFixed(1)
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNavbar />
      
      <main className="container mx-auto px-4 pt-28 pb-12 max-w-7xl">
        
        {/* Dashboard de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="border-none shadow-sm bg-white rounded-[32px]">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-green-100 p-4 rounded-2xl"><DollarSign className="text-green-600 w-6 h-6" /></div>
              <div>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider">Dinero Recuperado</p>
                <h3 className="text-2xl font-black text-slate-900">${stats.ganancias.toLocaleString()}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white rounded-[32px]">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-blue-100 p-4 rounded-2xl"><TrendingUp className="text-blue-600 w-6 h-6" /></div>
              <div>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider">Rescates Exitosos</p>
                <h3 className="text-2xl font-black text-slate-900">{stats.packsVendidos} packs</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-green-900 rounded-[32px] text-white">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-white/20 p-4 rounded-2xl"><Leaf className="text-green-300 w-6 h-6" /></div>
              <div>
                <p className="text-green-200/70 text-[10px] font-black uppercase tracking-wider">Impacto CO2</p>
                <h3 className="text-2xl font-black">{stats.co2Ahorrado}kg CO2e</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna Formulario */}
          <div className="space-y-6">
            <Card className="border-none shadow-xl rounded-[40px] bg-white overflow-hidden">
              <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Store className="w-5 h-5 text-green-400" />
                  <span className="font-bold text-sm uppercase tracking-tight">Panel del Aliado</span>
                </div>
                <div className="flex items-center gap-1.5 bg-green-500/20 px-3 py-1 rounded-full">
                   <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                   <span className="text-[10px] font-black">EN LÍNEA</span>
                </div>
              </div>

              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* SELECTOR DE PACK SORPRESA (CHECK CUSTOM) */}
                  <div 
                    onClick={() => setNuevoProducto({...nuevoProducto, esSorpresa: !nuevoProducto.esSorpresa})}
                    className={`cursor-pointer flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                      nuevoProducto.esSorpresa 
                        ? "bg-green-50 border-green-500 shadow-sm" 
                        : "bg-slate-50 border-slate-100 border-dashed"
                    }`}
                  >
                    <div className="flex gap-3 items-center">
                      <div className={`p-2 rounded-xl ${nuevoProducto.esSorpresa ? "bg-green-600 text-white" : "bg-slate-200 text-slate-400"}`}>
                        {nuevoProducto.esSorpresa ? <Gift className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-sm">
                          {nuevoProducto.esSorpresa ? "Pack Sorpresa" : "Producto Único"}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">
                          {nuevoProducto.esSorpresa ? "Imagen automática ✨" : "Requiere foto manual"}
                        </p>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      nuevoProducto.esSorpresa ? "bg-green-600 border-green-600" : "border-slate-300"
                    }`}>
                      {nuevoProducto.esSorpresa && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Nombre del Pack / Producto</Label>
                    <Input placeholder="Ej: Bolsa de Repostería" className="rounded-xl border-slate-100 bg-slate-50 py-6" value={nuevoProducto.nombre} onChange={e => setNuevoProducto({...nuevoProducto, nombre: e.target.value})} required />
                  </div>
                  
                  {/* Calculadora de Precios */}
                  <div className="space-y-4 p-5 bg-green-50/30 rounded-3xl border border-green-100">
                    <div className="space-y-2">
                      <Label className="text-green-700">Precio Original (Antes)</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
                        <Input type="number" placeholder="30000" className="pl-10 rounded-xl border-none shadow-sm py-6 font-black text-lg" value={nuevoProducto.precio_original} onChange={e => handlePrecioOriginalChange(e.target.value)} required />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Descuento (%)</Label>
                        <div className="relative">
                          <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input type="number" placeholder="50" className="pl-10 rounded-xl border-none bg-white py-6 font-bold" value={descuentoManual} onChange={e => handleDescuentoChange(e.target.value)} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Precio Oferta</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input type="number" placeholder="15000" className="pl-10 rounded-xl border-none bg-white py-6 font-bold text-green-700" value={nuevoProducto.precio_rescate} onChange={e => handlePrecioRescateChange(e.target.value)} required />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Stock</Label>
                      <Input type="number" placeholder="5" className="rounded-xl border-slate-100 bg-slate-50 py-6 font-bold" value={nuevoProducto.stock} onChange={e => setNuevoProducto({...nuevoProducto, stock: e.target.value})} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Imagen URL</Label>
                      <Input 
                        disabled={nuevoProducto.esSorpresa} 
                        placeholder={nuevoProducto.esSorpresa ? "Genérica Activa" : "https://..."} 
                        className="rounded-xl border-slate-100 bg-slate-50 py-6 text-xs" 
                        value={nuevoProducto.imagen_url} 
                        onChange={e => setNuevoProducto({...nuevoProducto, imagen_url: e.target.value})} 
                      />
                    </div>
                  </div>

                  <Button disabled={loading || !nuevoProducto.precio_original} className="w-full bg-slate-900 hover:bg-green-700 py-8 rounded-[24px] font-black text-lg shadow-xl transition-all active:scale-95">
                    {loading ? <Loader2 className="animate-spin" /> : "PUBLICAR EN CATÁLOGO 🚀"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Inventario a la Derecha */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black flex items-center gap-2 text-slate-800">
                <Package className="text-slate-400" /> Inventario Activo
              </h2>
              <span className="bg-white px-4 py-1.5 rounded-full text-[10px] font-black text-slate-400 border border-slate-100 shadow-sm uppercase tracking-widest">
                {productos.length} items publicados
              </span>
            </div>
            
            <div className="grid gap-4">
              {productos.length === 0 ? (
                <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-slate-200">
                  <Package className="text-slate-200 w-16 h-16 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold">No hay productos activos aún.</p>
                </div>
              ) : (
                productos.map((prod: any) => (
                  <Card key={prod.id} className="border-none shadow-sm rounded-[32px] bg-white overflow-hidden hover:shadow-md transition-all">
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 border border-slate-50">
                            <img 
                              src={prod.imagen_url || IMG_SORPRESA} 
                              alt="Producto" 
                              className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                          <h3 className="font-black text-slate-800 uppercase text-sm tracking-tight">{prod.nombre}</h3>
                          <div className="flex gap-2 mt-1.5">
                            <span className="text-[9px] font-black px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md uppercase">Stock: {prod.stock}</span>
                            <span className="text-[9px] font-black px-2 py-0.5 bg-green-100 text-green-700 rounded-md">
                              -{Math.round(((prod.precio_original - prod.precio_rescate) / prod.precio_original) * 100)}% OFF
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 pr-4">
                        <div className="text-right">
                          <p className="text-[10px] text-slate-300 font-bold line-through">${Number(prod.precio_original).toLocaleString()}</p>
                          <p className="text-xl font-black text-slate-900">${Number(prod.precio_rescate).toLocaleString()}</p>
                        </div>
                        <Button variant="ghost" className="h-12 w-12 rounded-2xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all">
                          <Trash2 className="w-5 h-5" />
                        </Button>
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

// Estilos rápidos para evitar errores de Shadcn faltante
function Label({ children, className }: { children: React.ReactNode, className?: string }) {
  return <label className={`text-[10px] font-black uppercase text-slate-400 ml-1 block mb-1 ${className}`}>{children}</label>;
}