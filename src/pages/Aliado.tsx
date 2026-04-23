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
  History,
  CheckCircle2, // Nuevo icono para validación
  Search // Nuevo icono para búsqueda
} from "lucide-react";

export default function Aliado() {
  const [loading, setLoading] = useState(false);
  const [productos, setProductos] = useState<any[]>([]);
  const [stats, setStats] = useState({ total_rescates: 0, total_ganado: 0 });
  const [actividad, setActividad] = useState<any[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // ESTADOS PARA LA MEJORA 2: VALIDACIÓN DE PEDIDOS
  const [codigoBusqueda, setCodigoBusqueda] = useState("");
  const [pedidoEncontrado, setPedidoEncontrado] = useState<any>(null);
  const [buscandoPedido, setBuscandoPedido] = useState(false);

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
      const resProd = await fetch(`https://aprovechapp-api.onrender.com/api/mis-productos/${aliadoId}`);
      if (resProd.ok) setProductos(await resProd.json());

      const resStats = await fetch(`https://aprovechapp-api.onrender.com/api/aliados/${aliadoId}/estadisticas`);
      if (resStats.ok) setStats(await resStats.json());

      const resAct = await fetch(`https://aprovechapp-api.onrender.com/api/aliados/${aliadoId}/actividad`);
      if (resAct.ok) setActividad(await resAct.json());
    } catch (error) { console.error("Error sincronizando:", error); }
  };

  useEffect(() => { cargarTodo(); }, []);

  // LÓGICA MEJORA 2: BUSCAR Y CONFIRMAR PEDIDO
  const buscarPedido = async () => {
    const aliadoId = localStorage.getItem("aliado_id");
    if (!codigoBusqueda || !aliadoId) return;
    setBuscandoPedido(true);
    setPedidoEncontrado(null);
    try {
      const res = await fetch(`https://aprovechapp-api.onrender.com/api/pedidos/validar/${codigoBusqueda}/${aliadoId}`);
      if (res.ok) {
        setPedidoEncontrado(await res.json());
      } else {
        alert("Código no válido o no pertenece a este local");
      }
    } catch (error) { console.error(error); } 
    finally { setBuscandoPedido(false); }
  };

  const confirmarEntrega = async (pedidoId: number) => {
    try {
      const res = await fetch(`https://aprovechapp-api.onrender.com/api/pedidos/${pedidoId}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "Completado" })
      });
      if (res.ok) {
        alert("¡Entrega confirmada!");
        setPedidoEncontrado(null);
        setCodigoBusqueda("");
        cargarTodo();
      }
    } catch (error) { alert("Error al confirmar"); }
  };

  // LÓGICA DE PRODUCTOS (Existente)
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
        cargarTodo();
      }
    } catch (error) { alert("Error"); } finally { setLoading(false); }
  };

  const eliminarProducto = async (id: number) => {
    if (!confirm("¿Deseas eliminarlo?")) return;
    try {
      const res = await fetch(`https://aprovechapp-api.onrender.com/api/productos/${id}`, { method: "DELETE" });
      if (res.ok) cargarTodo();
    } catch (error) { alert("Error"); }
  };

  const editarStock = async (prod: any) => {
    const nuevoStock = prompt(`Stock para ${prod.nombre}:`, prod.stock);
    if (nuevoStock === null || nuevoStock === "") return;
    try {
      const res = await fetch(`https://aprovechapp-api.onrender.com/api/productos/${prod.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: prod.nombre, precio_rescate: prod.precio_rescate, stock: parseInt(nuevoStock) })
      });
      if (res.ok) cargarTodo();
    } catch (error) { alert("Error"); }
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
          <Card className="border-none shadow-sm rounded-[35px] bg-white p-8 border-l-4 border-green-500">
            <div className="flex items-center gap-5">
              <div className="bg-green-50 p-4 rounded-2xl"><TrendingUp className="text-green-600 w-6 h-6" /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Ventas Reales</p>
                <h3 className="text-2xl font-black text-slate-900">${Number(stats.total_ganado || 0).toLocaleString()}</h3>
              </div>
            </div>
          </Card>
          <Card className="border-none shadow-sm rounded-[35px] bg-white p-8">
            <div className="flex items-center gap-5">
              <div className="bg-blue-50 p-4 rounded-2xl"><DollarSign className="text-blue-600 w-6 h-6" /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Valor Inventario</p>
                <h3 className="text-2xl font-black text-slate-900">
                  ${productos.reduce((acc, p) => acc + (Number(p.precio_rescate) * Number(p.stock)), 0).toLocaleString()}
                </h3>
              </div>
            </div>
          </Card>
          <Card className="border-none shadow-sm rounded-[35px] bg-white p-8">
            <div className="flex items-center gap-5">
              <div className="bg-purple-50 p-4 rounded-2xl"><BarChart3 className="text-purple-600 w-6 h-6" /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Items en Tienda</p>
                <h3 className="text-2xl font-black text-slate-900">{productos.length} SKU</h3>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* COLUMNA 1: FORMULARIO */}
          <div className="lg:col-span-4">
            <Card className="border-none shadow-2xl rounded-[45px] bg-white overflow-hidden sticky top-32">
              <div className="bg-slate-900 p-8 text-white flex items-center gap-3">
                <Plus className="w-5 h-5 text-green-400"/>
                <span className="font-black text-sm uppercase tracking-widest">Crear Oferta</span>
              </div>
              <CardContent className="p-8 space-y-5">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div onClick={() => setNuevoProducto({...nuevoProducto, esSorpresa: !nuevoProducto.esSorpresa})} className={`cursor-pointer p-4 rounded-3xl border-2 transition-all flex justify-between items-center ${nuevoProducto.esSorpresa ? "bg-green-50 border-green-500" : "bg-slate-50 border-slate-100"}`}>
                    <div className="flex gap-4 items-center">
                      <div className={`p-2 rounded-xl ${nuevoProducto.esSorpresa ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                        {nuevoProducto.esSorpresa ? <Gift className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                      </div>
                      <p className="font-black text-[10px] uppercase italic">Pack Sorpresa</p>
                    </div>
                  </div>
                  {!nuevoProducto.esSorpresa && (
                    <div className="space-y-3">
                      {imagePreview ? (
                        <div className="relative h-32 rounded-[25px] overflow-hidden">
                          <img src={imagePreview} className="w-full h-full object-cover" />
                          <button onClick={removeImage} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"><X size={12}/></button>
                        </div>
                      ) : (
                        <label className="w-full h-32 border-2 border-dashed rounded-[25px] flex flex-col items-center justify-center cursor-pointer border-slate-200 hover:bg-slate-50">
                          <ImageIcon className="w-5 h-5 text-slate-300" />
                          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        </label>
                      )}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Producto</Label>
                    <Input className="rounded-xl bg-slate-50 border-none font-bold" value={nuevoProducto.nombre} onChange={e => setNuevoProducto({...nuevoProducto, nombre: e.target.value})} required />
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
                    <Label>Stock</Label>
                    <Input type="number" className="rounded-xl bg-slate-50 border-none font-black" value={nuevoProducto.stock} onChange={e => setNuevoProducto({...nuevoProducto, stock: e.target.value})} required />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-slate-900 py-6 rounded-[20px] font-black hover:bg-green-600 uppercase tracking-widest">
                    {loading ? <Loader2 className="animate-spin" /> : "Publicar ahora 🚀"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* COLUMNA 2: VALIDACIÓN + INVENTARIO */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* MEJORA 2: VALIDADOR DE CÓDIGO */}
            <Card className="border-none shadow-xl rounded-[35px] bg-green-600 p-6 text-white overflow-hidden relative">
              <div className="relative z-10">
                <h3 className="text-lg font-black uppercase italic tracking-tighter mb-1">Validar Rescate</h3>
                <p className="text-green-100 text-[9px] font-bold uppercase tracking-widest mb-4">Ingrese código del cliente</p>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Código ID" 
                    className="rounded-xl border-none bg-white/20 text-white placeholder:text-white/50 font-black"
                    value={codigoBusqueda}
                    onChange={(e) => setCodigoBusqueda(e.target.value)}
                  />
                  <Button onClick={buscarPedido} disabled={buscandoPedido} className="bg-white text-green-600 hover:bg-slate-100 rounded-xl font-black px-6">
                    {buscandoPedido ? <Loader2 className="animate-spin" /> : <Search size={18}/>}
                  </Button>
                </div>

                {pedidoEncontrado && (
                  <div className="mt-4 p-4 bg-white rounded-2xl flex items-center justify-between animate-in slide-in-from-top-2">
                    <div className="text-slate-900">
                      <p className="text-[9px] font-black text-slate-400 uppercase">{pedidoEncontrado.nombre_usuario}</p>
                      <p className="font-black text-xs uppercase">{pedidoEncontrado.nombre_producto}</p>
                    </div>
                    {pedidoEncontrado.estado !== 'Completado' ? (
                      <Button onClick={() => confirmarEntrega(pedidoEncontrado.id)} size="sm" className="bg-green-600 text-white rounded-lg font-black text-[9px] uppercase">Confirmar</Button>
                    ) : (
                      <CheckCircle2 className="text-green-500 w-5 h-5" />
                    )}
                  </div>
                )}
              </div>
            </Card>

            <h2 className="text-lg font-black text-slate-800 uppercase italic px-2">Inventario Activo</h2>
            <div className="grid gap-4">
              {productos.map((prod) => (
                <Card key={prod.id} className="border-none shadow-sm rounded-[30px] p-4 bg-white hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img src={prod.imagen_url || IMG_SORPRESA} className="w-14 h-14 rounded-xl object-cover" />
                      <div>
                        <h4 className="font-black text-slate-800 text-xs uppercase">{prod.nombre}</h4>
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase ${prod.stock === 0 ? "bg-red-100 text-red-600" : "bg-green-50 text-green-600"}`}>Stock: {prod.stock}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => editarStock(prod)} variant="outline" className="h-8 w-8 p-0 rounded-lg bg-slate-50 border-none text-slate-400 hover:text-blue-600"><Pencil size={12}/></Button>
                      <Button onClick={() => eliminarProducto(prod.id)} variant="outline" className="h-8 w-8 p-0 rounded-lg bg-slate-50 border-none text-slate-400 hover:text-red-500"><Trash2 size={12}/></Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* COLUMNA 3: HISTORIAL */}
          <div className="lg:col-span-3">
            <Card className="border-none shadow-sm rounded-[35px] bg-white p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-slate-900 rounded-lg"><History className="w-3 h-3 text-white" /></div>
                <h3 className="font-black text-slate-900 text-[10px] uppercase italic tracking-tighter">Actividad</h3>
              </div>
              <div className="space-y-6 relative pl-4 border-l-2 border-slate-50">
                {actividad.length === 0 ? (
                  <p className="text-[9px] font-bold text-slate-300 uppercase text-center italic">Sin registros</p>
                ) : (
                  actividad.map((log) => (
                    <div key={log.id} className="relative">
                      <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-white ${log.tipo_evento === 'VENTA' ? 'bg-green-500' : log.tipo_evento === 'STOCK' ? 'bg-blue-500' : 'bg-slate-400'}`} />
                      <p className="text-[10px] font-bold text-slate-700 leading-tight mb-1">{log.descripcion}</p>
                      <p className="text-[8px] font-black text-slate-400 uppercase">{new Date(log.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
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