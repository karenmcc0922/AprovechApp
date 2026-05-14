import { useState, useEffect } from "react";
import AppNavbar from "../components/AppNavbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Trash2, 
  Loader2, 
  Image as ImageIcon,
  Gift, 
  Plus,
  BarChart3,
  TrendingUp,
  History
} from "lucide-react";

export default function Aliado() {
  const [loading, setLoading] = useState(false);
  const [productos, setProductos] = useState<any[]>([]);
  const [stats, setStats] = useState({ total_rescates: 0, total_ganado: 0 });
  const [actividad, setActividad] = useState<any[]>([]);
  const [datosGrafica, setDatosGrafica] = useState([]);
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

  const cargarTodo = async () => {
    const aliadoId = localStorage.getItem("aliado_id");
    if (!aliadoId) return;

    try {
      const [resProd, resStats, resAct, resGrafica] = await Promise.all([
        fetch(`https://aprovechapp-api.onrender.com/api/mis-productos/${aliadoId}`),
        fetch(`https://aprovechapp-api.onrender.com/api/aliados/${aliadoId}/estadisticas`),
        fetch(`https://aprovechapp-api.onrender.com/api/aliados/${aliadoId}/actividad`),
        fetch(`https://aprovechapp-api.onrender.com/api/aliados/${aliadoId}/ventas-semanales`)
      ]);

      if (resProd.ok) setProductos(await resProd.json());
      if (resStats.ok) setStats(await resStats.json());
      if (resAct.ok) setActividad(await resAct.json());
      if (resGrafica.ok) setDatosGrafica(await resGrafica.json());
      
    } catch (error) {
      console.error("Error al sincronizar datos:", error);
    }
  };

  useEffect(() => { cargarTodo(); }, []);

  // Lógica de Precios e Imágenes
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
        cargarTodo();
      }
    } catch (error) { alert("Error"); } finally { setLoading(false); }
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
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Panel de analíticas e inventario</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-black text-slate-700 uppercase tracking-tighter">Live Monitor</span>
            </div>
          </div>
        </div>

        {/* MÉTRICAS Y GRÁFICA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
          {/* Tarjetas Pequeñas */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <Card className="border-none shadow-sm rounded-[35px] bg-white p-6 flex items-center gap-5 border-l-4 border-green-500">
              <div className="bg-green-50 p-4 rounded-2xl"><TrendingUp className="text-green-600 w-6 h-6" /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ingresos Totales</p>
                <h3 className="text-2xl font-black text-slate-900">${Number(stats.total_ganado || 0).toLocaleString()}</h3>
              </div>
            </Card>
            <Card className="border-none shadow-sm rounded-[35px] bg-white p-6 flex items-center gap-5 border-l-4 border-blue-500">
              <div className="bg-blue-50 p-4 rounded-2xl"><BarChart3 className="text-blue-600 w-6 h-6" /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rescates Exitosos</p>
                <h3 className="text-2xl font-black text-slate-900">{stats.total_rescates}</h3>
              </div>
            </Card>
          </div>

          {/* Gráfica de Rendimiento */}
          <Card className="lg:col-span-8 border-none shadow-sm rounded-[35px] bg-white p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-slate-900 uppercase italic tracking-tighter">Ventas Semanales</h3>
              <div className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] font-black">ACTUALIZADO</div>
            </div>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={datosGrafica}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="fecha" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                  <YAxis hide />
                  <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                  <Area type="monotone" dataKey="total" stroke="#16a34a" strokeWidth={4} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* GESTIÓN Y ACTIVIDAD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* FORMULARIO */}
          <div className="lg:col-span-4">
            <Card className="border-none shadow-2xl rounded-[45px] bg-white overflow-hidden">
              <div className="bg-slate-900 p-8 text-white flex items-center gap-3">
                <Plus className="w-5 h-5 text-green-400"/>
                <span className="font-black text-sm uppercase tracking-widest">Crear Oferta</span>
              </div>
              <CardContent className="p-8 space-y-5">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div 
                    onClick={() => setNuevoProducto({...nuevoProducto, esSorpresa: !nuevoProducto.esSorpresa})}
                    className={`cursor-pointer p-4 rounded-3xl border-2 transition-all flex items-center gap-4 ${nuevoProducto.esSorpresa ? "bg-green-50 border-green-500" : "bg-slate-50 border-slate-100"}`}
                  >
                    <div className={`p-2 rounded-xl ${nuevoProducto.esSorpresa ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      {nuevoProducto.esSorpresa ? <Gift className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                    </div>
                    <p className="font-black text-[10px] text-slate-800 uppercase italic">
                      {nuevoProducto.esSorpresa ? "Pack Sorpresa" : "Producto Único"}
                    </p>
                  </div>

                  {!nuevoProducto.esSorpresa && (
                    <label className="w-full h-24 border-2 border-dashed rounded-[25px] flex flex-col items-center justify-center cursor-pointer border-slate-200">
                      {imagePreview ? <img src={imagePreview} className="h-full w-full object-cover rounded-[23px]" /> : <ImageIcon className="text-slate-300" />}
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
                  )}

                  <div className="space-y-1">
                    <Label>Producto</Label>
                    <Input className="rounded-xl bg-slate-50 border-none font-bold" value={nuevoProducto.nombre} onChange={e => setNuevoProducto({...nuevoProducto, nombre: e.target.value})} required />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Precio Original</Label>
                      <Input type="number" className="rounded-xl bg-slate-50 border-none font-black" value={nuevoProducto.precio_original} onChange={e => handlePrecioOriginalChange(e.target.value)} required />
                    </div>
                    <div className="space-y-1">
                      <Label>% Dcto</Label>
                      <Input type="number" className="rounded-xl bg-slate-50 border-none font-black text-green-600" value={descuentoManual} onChange={e => handleDescuentoChange(e.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label>Stock</Label>
                    <Input type="number" className="rounded-xl bg-slate-50 border-none font-black" value={nuevoProducto.stock} onChange={e => setNuevoProducto({...nuevoProducto, stock: e.target.value})} required />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full bg-slate-900 py-6 rounded-[20px] font-black uppercase text-[11px] tracking-widest hover:bg-green-600">
                    {loading ? <Loader2 className="animate-spin" /> : "Publicar Oferta"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* INVENTARIO */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-lg font-black text-slate-800 uppercase italic px-2">Mis Ofertas</h2>
            {productos.map((prod) => (
              <Card key={prod.id} className="border-none shadow-sm rounded-[30px] p-4 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img src={prod.imagen_url || IMG_SORPRESA} className="w-14 h-14 rounded-2xl object-cover" />
                    <div>
                      <h4 className="font-black text-slate-800 text-sm uppercase">{prod.nombre}</h4>
                      <p className="text-[10px] font-bold text-green-600 uppercase">Stock: {prod.stock}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-red-500"><Trash2 size={14}/></Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* HISTORIAL */}
          <div className="lg:col-span-3">
             <Card className="border-none shadow-sm rounded-[35px] bg-white p-6">
              <div className="flex items-center gap-3 mb-6">
                <History className="w-4 h-4 text-slate-400" />
                <h3 className="font-black text-slate-900 text-[10px] uppercase tracking-widest">Actividad</h3>
              </div>
              <div className="space-y-6 relative">
                <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-slate-50" />
                {actividad.map((log) => (
                  <div key={log.id} className="relative pl-6">
                    <div className="absolute left-0 top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm bg-green-500 z-10" />
                    <p className="text-[10px] font-bold text-slate-800 leading-tight">{log.descripcion}</p>
                    <p className="text-[8px] font-black text-slate-400 uppercase mt-1">
                      {new Date(log.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
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