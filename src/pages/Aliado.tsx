import { useState, useEffect } from "react";
import AppNavbar from "../components/AppNavbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
  Package, Trash2, Loader2, 
  TrendingUp, Leaf, DollarSign, Store,
  Percent, Image as Gift
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
    esSorpresa: true, // Por defecto true para fomentar rescates ciegos
    imagen_url: ""
  });

  const [descuentoManual, setDescuentoManual] = useState("");

  const IMG_SORPRESA = "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&q=80";

  // --- LÓGICA DE CÁLCULOS ---

  // Al cambiar Precio Original: Recalcular precio rescate si hay descuento
  const handlePrecioOriginalChange = (val: string) => {
    const original = Number(val);
    const desc = Number(descuentoManual);
    let rescate = nuevoProducto.precio_rescate;

    if (original > 0 && desc > 0) {
      rescate = Math.round(original * (1 - desc / 100)).toString();
    }
    setNuevoProducto({ ...nuevoProducto, precio_original: val, precio_rescate: rescate });
  };

  // Al cambiar Precio Rescate: Recalcular % Descuento
  const handlePrecioRescateChange = (val: string) => {
    const original = Number(nuevoProducto.precio_original);
    const rescate = Number(val);
    
    if (original > 0 && rescate > 0) {
      const pct = Math.round(((original - rescate) / original) * 100);
      setDescuentoManual(pct.toString());
    }
    setNuevoProducto({ ...nuevoProducto, precio_rescate: val });
  };

  // Al cambiar % Descuento: Recalcular Precio Rescate
  const handleDescuentoChange = (val: string) => {
    const original = Number(nuevoProducto.precio_original);
    const pct = Number(val);
    setDescuentoManual(val);

    if (original > 0 && pct > 0) {
      const nuevoRescate = Math.round(original * (1 - pct / 100));
      setNuevoProducto({ ...nuevoProducto, precio_rescate: nuevoRescate.toString() });
    }
  };

  // --- API ---

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
    
    // Lógica de imagen por defecto
    const imgFinal = nuevoProducto.esSorpresa && !nuevoProducto.imagen_url 
      ? IMG_SORPRESA 
      : (nuevoProducto.imagen_url || "https://via.placeholder.com/500?text=Pack+Aprovecha");

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
        
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="border-none shadow-sm bg-white rounded-[32px] overflow-hidden">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-green-100 p-4 rounded-2xl"><DollarSign className="text-green-600 w-6 h-6" /></div>
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Dinero Recuperado</p>
                <h3 className="text-2xl font-black text-slate-900">${stats.ganancias.toLocaleString()}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white rounded-[32px] overflow-hidden">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-blue-100 p-4 rounded-2xl"><TrendingUp className="text-blue-600 w-6 h-6" /></div>
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Rescates Exitosos</p>
                <h3 className="text-2xl font-black text-slate-900">{stats.packsVendidos} packs</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-green-900 rounded-[32px] overflow-hidden">
            <CardContent className="p-6 flex items-center gap-4 text-white">
              <div className="bg-white/20 p-4 rounded-2xl"><Leaf className="text-green-300 w-6 h-6" /></div>
              <div>
                <p className="text-green-200/70 text-xs font-bold uppercase tracking-wider">Planeta Salvado</p>
                <h3 className="text-2xl font-black">{stats.co2Ahorrado}kg CO2e</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Formulario mejorado */}
          <div className="space-y-6">
            <Card className="border-none shadow-xl rounded-[40px] bg-white overflow-hidden">
              <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Store className="w-5 h-5 text-green-400" />
                  <span className="font-bold">Publicar Rescate</span>
                </div>
                <Badge className="bg-green-500 text-white border-none px-3 py-1">VIVO</Badge>
              </div>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Switch Sorpresa */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <div className="flex gap-3 items-center">
                      <Gift className={`w-5 h-5 ${nuevoProducto.esSorpresa ? 'text-green-600' : 'text-slate-300'}`} />
                      <div>
                        <Label className="font-black text-slate-800 text-sm">¿Pack Sorpresa?</Label>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Usa imagen genérica</p>
                      </div>
                    </div>
                    <Switch 
                      checked={nuevoProducto.esSorpresa}
                      onCheckedChange={(val) => setNuevoProducto({...nuevoProducto, esSorpresa: val})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nombre del Pack</Label>
                    <Input placeholder="Ej: Bolsa sorpresa Panes" className="rounded-xl border-slate-100 bg-slate-50 py-6" value={nuevoProducto.nombre} onChange={e => setNuevoProducto({...nuevoProducto, nombre: e.target.value})} required />
                  </div>
                  
                  {/* Sección de Precios e Inteligencia */}
                  <div className="space-y-4 p-4 bg-green-50/50 rounded-3xl border border-green-100">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-green-700 ml-1">Precio Original</Label>
                      <Input type="number" placeholder="30000" className="rounded-xl border-none shadow-sm py-6 font-bold" value={nuevoProducto.precio_original} onChange={e => handlePrecioOriginalChange(e.target.value)} required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Descuento (%)</Label>
                        <div className="relative">
                          <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input type="number" placeholder="50" className="pl-10 rounded-xl border-none bg-white py-6 font-bold" value={descuentoManual} onChange={e => handleDescuentoChange(e.target.value)} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Precio Rescate</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input type="number" placeholder="15000" className="pl-10 rounded-xl border-none bg-white py-6 font-bold" value={nuevoProducto.precio_rescate} onChange={e => handlePrecioRescateChange(e.target.value)} required />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Stock</Label>
                      <Input type="number" placeholder="5" className="rounded-xl border-slate-100 bg-slate-50 py-6" value={nuevoProducto.stock} onChange={e => setNuevoProducto({...nuevoProducto, stock: e.target.value})} required />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Imagen URL</Label>
                      <Input 
                        disabled={nuevoProducto.esSorpresa} 
                        placeholder={nuevoProducto.esSorpresa ? "Predeterminada" : "https://..."} 
                        className="rounded-xl border-slate-100 bg-slate-50 py-6 text-xs" 
                        value={nuevoProducto.imagen_url} 
                        onChange={e => setNuevoProducto({...nuevoProducto, imagen_url: e.target.value})} 
                      />
                    </div>
                  </div>

                  <Button disabled={loading} className="w-full bg-slate-900 hover:bg-green-700 py-7 rounded-2xl font-black text-lg shadow-lg transition-all active:scale-95">
                    {loading ? <Loader2 className="animate-spin" /> : "PUBLICAR OFERTA 🚀"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Inventario */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-black flex items-center gap-2">
              <Package className="text-slate-400" /> Inventario Activo
            </h2>
            
            <div className="grid gap-4">
              {productos.map((prod: any) => (
                <div key={prod.id} className="bg-white p-6 rounded-[32px] shadow-sm flex items-center justify-between border border-slate-50 hover:border-green-200 transition-all group">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100">
                        <img 
                          src={prod.imagen_url || IMG_SORPRESA} 
                          alt="Producto" 
                          className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 uppercase tracking-tight">{prod.nombre}</h3>
                      <div className="flex gap-3 mt-1">
                        <span className="text-[10px] font-black px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md uppercase">Stock: {prod.stock}</span>
                        <span className="text-[10px] font-black px-2 py-0.5 bg-green-100 text-green-700 rounded-md">
                          -{Math.round(((prod.precio_original - prod.precio_rescate) / prod.precio_original) * 100)}% OFF
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
          </div>
        </div>
      </main>
    </div>
  );
}

// Helpers locales para el estilo
function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return <span className={`text-[10px] font-black rounded-full ${className}`}>{children}</span>;
}

function Label({ children, className }: { children: React.ReactNode, className?: string }) {
  return <label className={`block ${className}`}>{children}</label>;
}