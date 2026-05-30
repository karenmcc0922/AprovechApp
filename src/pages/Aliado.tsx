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
  Edit2,
  Loader2,
  Image as ImageIcon,
  Gift,
  Plus,
  BarChart3,
  TrendingUp,
  History,
  AlertCircle,
  X,
  ShieldCheck
} from "lucide-react";
import { toast } from "sonner";
import { API_BASE } from "../lib/api";

export default function Aliado() {
  const [loading, setLoading] = useState(false);
  const [productos, setProductos] = useState<any[]>([]);
  const [stats, setStats] = useState({ total_rescates: 0, total_ganado: 0 });
  const [actividad, setActividad] = useState<any[]>([]);
  const [datosGrafica, setDatosGrafica] = useState<any[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [aceptaResponsabilidad, setAceptaResponsabilidad] = useState(false);

  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    precio_original: "",
    precio_rescate: "",
    stock: "",
    categoria: "Preparados",
    descripcion: "Pack sorpresa de productos frescos",
    esSorpresa: true,
    imagen_url: "",
    fecha_vencimiento: ""
  });

  const [descuentoManual, setDescuentoManual] = useState("");
  const IMG_SORPRESA = "/BolsaSorpresa.png";

  const cargarTodo = async () => {
    const aliadoId = localStorage.getItem("aliado_id");
    if (!aliadoId) return;
    try {
      const [resProd, resStats, resAct, resGrafica] = await Promise.all([
        fetch(`${API_BASE}/api/mis-productos/${aliadoId}`),
        fetch(`${API_BASE}/api/aliados/${aliadoId}/estadisticas`),
        fetch(`${API_BASE}/api/aliados/${aliadoId}/actividad`),
        fetch(`${API_BASE}/api/aliados/${aliadoId}/ventas-semanales`)
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

  const activarEdicion = (prod: any) => {
    setEditingId(prod.id);
    const esSorp = prod.imagen_url === IMG_SORPRESA;
    let descuentoPrevio = "";
    if (Number(prod.precio_original) > 0) {
      const diff = Number(prod.precio_original) - Number(prod.precio_rescate);
      descuentoPrevio = Math.round((diff / Number(prod.precio_original)) * 100).toString();
    }
    setNuevoProducto({
      nombre: prod.nombre,
      precio_original: prod.precio_original.toString(),
      precio_rescate: prod.precio_rescate.toString(),
      stock: prod.stock.toString(),
      categoria: prod.categoria || "Preparados",
      descripcion: prod.descripcion || "Pack sorpresa",
      esSorpresa: esSorp,
      imagen_url: prod.imagen_url || "",
      fecha_vencimiento: prod.fecha_vencimiento ? prod.fecha_vencimiento.split("T")[0] : ""
    });
    setDescuentoManual(descuentoPrevio);
    setImagePreview(esSorp ? null : prod.imagen_url);
    setAceptaResponsabilidad(true);
  };

  const cancelarEdicion = () => {
    setEditingId(null);
    setNuevoProducto({
      nombre: "", precio_original: "", precio_rescate: "", stock: "",
      categoria: "Preparados", descripcion: "Pack sorpresa", esSorpresa: true, imagen_url: "", fecha_vencimiento: ""
    });
    setImagePreview(null);
    setDescuentoManual("");
    setAceptaResponsabilidad(false);
  };

  const eliminarProducto = (id: number) => {
    toast("¿Eliminar este producto definitivamente?", {
      action: {
        label: "Sí, eliminar",
        onClick: async () => {
          try {
            const res = await fetch(`${API_BASE}/api/productos/${id}/eliminar`, { method: "DELETE" });
            if (res.ok) {
              if (editingId === id) cancelarEdicion();
              toast.success("Producto eliminado correctamente");
              cargarTodo();
            } else {
              toast.error("No se pudo eliminar. Puede estar asociado a un pedido activo.");
            }
          } catch {
            toast.error("Error al intentar eliminar el producto");
          }
        }
      },
      cancel: { label: "Cancelar", onClick: () => {} }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aceptaResponsabilidad) {
      toast.warning("Debes aceptar la declaración de calidad.");
      return;
    }

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
        categoria: nuevoProducto.categoria,
        imagen_url: nuevoProducto.esSorpresa ? IMG_SORPRESA : nuevoProducto.imagen_url,
        fecha_vencimiento: nuevoProducto.fecha_vencimiento || null
      };

      const url = editingId
        ? `${API_BASE}/api/productos/${editingId}/actualizar`
        : `${API_BASE}/api/productos`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(editingId ? "Oferta actualizada con éxito" : "Oferta publicada correctamente");
        cancelarEdicion();
        cargarTodo();
      } else {
        toast.error("No se pudo guardar la oferta. Intenta de nuevo.");
      }
    } catch {
      toast.error("Error de conexión al guardar cambios");
    } finally {
      setLoading(false);
    }
  };

  const precioRescateCalculado = nuevoProducto.precio_rescate
    ? `$${Number(nuevoProducto.precio_rescate).toLocaleString()}`
    : null;

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      <AppNavbar />
      
      {/* CAPA DE TEXTURA TECNOLÓGICA */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

      {/* GRADIENTES DIFUMINADOS PREMIUM */}
      <div className="absolute top-[-5%] left-[-5%] w-[500px] h-[500px] rounded-full bg-emerald-100/30 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-5%] w-[450px] h-[450px] rounded-full bg-blue-100/20 blur-[140px] pointer-events-none" />

      <main className="flex-grow container mx-auto px-4 pt-24 pb-12 max-w-7xl">

        {/* ── WELCOME HEADER ── */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 mb-6 shadow-sm flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 mb-1">
              ¡Bienvenido, {JSON.parse(localStorage.getItem("usuario") || "{}").nombre || "Aliado"}! 👋
            </h1>
            <p className="text-sm text-slate-500">Aquí puedes gestionar tus ofertas y hacer crecer tu impacto.</p>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-2xl px-4 py-3 text-center shrink-0">
            <p className="text-xs text-green-700 font-semibold">Tu impacto juntos</p>
            <p className="text-xl font-black text-green-600">{(stats.total_rescates * 2.5).toFixed(1)} kg</p>
            <p className="text-[10px] text-green-600">CO₂ evitado este mes</p>
          </div>
        </div>

        {/* ── METRIC CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="border border-slate-200 rounded-2xl bg-white p-5 shadow-sm flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-xl shrink-0"><TrendingUp className="text-green-600 w-5 h-5" /></div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Ingresos totales</p>
              <h3 className="text-xl font-black text-slate-900">${Number(stats.total_ganado || 0).toLocaleString()}</h3>
              <p className="text-[10px] text-green-600 font-semibold">+10.6% vs. semana pasada</p>
            </div>
          </Card>
          <Card className="border border-slate-200 rounded-2xl bg-white p-5 shadow-sm flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-xl shrink-0"><BarChart3 className="text-blue-600 w-5 h-5" /></div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Rescates exitosos</p>
              <h3 className="text-xl font-black text-slate-900">{stats.total_rescates}</h3>
              <p className="text-[10px] text-blue-600 font-semibold">+2 vs. semana pasada</p>
            </div>
          </Card>
          <Card className="border border-slate-200 rounded-2xl bg-white p-5 shadow-sm flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-xl shrink-0"><ShieldCheck className="text-orange-500 w-5 h-5" /></div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Productos rescatados</p>
              <h3 className="text-xl font-black text-slate-900">{(stats.total_rescates * 1.5).toFixed(1)} kg</h3>
              <p className="text-[10px] text-orange-500 font-semibold">+8.3 kg vs. semana pasada</p>
            </div>
          </Card>
        </div>

        {/* ── CHART + QUICK SUMMARY ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <Card className="lg:col-span-2 border border-slate-200 rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Ventas semanales</h3>
              <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">Esta semana</span>
            </div>
            <div className="h-[180px] w-full">
              {datosGrafica.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={datosGrafica}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="fecha" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                    <YAxis hide />
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: '12px'}} />
                    <Area type="monotone" dataKey="total" stroke="#16a34a" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" dot={{ r: 3, fill: '#16a34a', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 5 }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-50">
                  <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-xs text-slate-400 font-semibold">Sin ventas registradas aún</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="border border-slate-200 rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm mb-4">Resumen rápido</h3>
            <div className="space-y-3">
              {[
                { label: "Ofertas activas", value: productos.length },
                { label: "Vencen hoy", value: productos.filter(p => {
                  if (!p.fecha_vencimiento) return false;
                  const hoy = new Date().toISOString().split("T")[0];
                  return p.fecha_vencimiento.split("T")[0] === hoy;
                }).length },
                { label: "Stock disponible", value: `${productos.reduce((a, p) => a + (Number(p.stock) || 0), 0)} kg` },
                { label: "Categorías", value: [...new Set(productos.map(p => p.categoria))].length },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0">
                  <span className="text-sm text-slate-600">{item.label}</span>
                  <span className="text-sm font-black text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ── CREATE OFFER BANNER ── */}
        <div className="bg-green-50 border border-green-100 rounded-2xl p-5 mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="font-bold text-slate-800 text-sm">¡Ofrece más, desperdicia menos y gana más!</p>
            <p className="text-xs text-slate-500 mt-0.5">Publica nuevas ofertas y llega a más personas.</p>
          </div>
          <button
            onClick={() => document.getElementById('form-crear-oferta')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 shrink-0"
          >
            <Plus size={14} /> Crear nueva oferta
          </button>
        </div>

        {/* SECCIÓN INFERIOR: GESTIÓN */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div id="form-crear-oferta" className="lg:col-span-4">
            <Card className="border border-slate-100 shadow-[0_30px_70px_rgba(15,23,42,0.06)] rounded-[45px] bg-white overflow-hidden">
              <div className={`p-8 text-white flex items-center justify-between transition-colors duration-300 ${editingId ? 'bg-amber-600' : 'bg-slate-900'}`}>
                <div className="flex items-center gap-3">
                  <Plus className="w-5 h-5 text-green-400"/>
                  <span className="font-black text-sm uppercase tracking-widest">
                    {editingId ? "Editar Oferta" : "Crear Oferta"}
                  </span>
                </div>
                {editingId && (
                  <button type="button" onClick={cancelarEdicion} className="bg-white/20 hover:bg-white/30 text-white p-1 rounded-full transition-all">
                    <X size={16} />
                  </button>
                )}
              </div>
              <CardContent className="p-8 space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">

                  {/* Toggle Sorpresa / Producto único */}
                  <div
                    onClick={() => setNuevoProducto({...nuevoProducto, esSorpresa: !nuevoProducto.esSorpresa})}
                    className={`cursor-pointer p-4 rounded-3xl border-2 transition-all flex items-center gap-4 ${nuevoProducto.esSorpresa ? "bg-green-50/60 border-green-500/80 shadow-sm" : "bg-slate-50 border-slate-100"}`}
                  >
                    <div className={`p-2 rounded-xl ${nuevoProducto.esSorpresa ? 'bg-green-600 text-white shadow-md shadow-green-600/20' : 'bg-slate-200 text-slate-400'}`}>
                      {nuevoProducto.esSorpresa ? <Gift className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                    </div>
                    <p className="font-black text-[10px] text-slate-800 uppercase italic">
                      {nuevoProducto.esSorpresa ? "Pack Sorpresa" : "Producto Único"}
                    </p>
                  </div>

                  {!nuevoProducto.esSorpresa && (
                    <div className="space-y-2">
                      {imagePreview ? (
                        <div className="relative h-32 rounded-[25px] overflow-hidden border-2 border-slate-100">
                          <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                          <button
                            type="button"
                            onClick={() => { setImagePreview(null); setNuevoProducto(prev => ({...prev, imagen_url: ""})); }}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 shadow-md"
                          >
                            <X size={12}/>
                          </button>
                        </div>
                      ) : (
                        <label className="w-full h-32 border-2 border-dashed rounded-[25px] flex flex-col items-center justify-center cursor-pointer border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all">
                          <ImageIcon className="w-5 h-5 text-slate-300 mb-2" />
                          <span className="text-[9px] font-black text-slate-400 uppercase">Cargar Foto</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        </label>
                      )}
                    </div>
                  )}

                  <div className="space-y-1">
                    <LabelCustom>Producto</LabelCustom>
                    <Input className="rounded-xl bg-slate-50 border-none font-bold focus-visible:ring-1 focus-visible:ring-slate-300" value={nuevoProducto.nombre} onChange={e => setNuevoProducto({...nuevoProducto, nombre: e.target.value})} required />
                  </div>

                  <div className="space-y-1">
                    <LabelCustom>Categoría de Perecederos</LabelCustom>
                    <select
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 border-none font-bold text-xs text-slate-700 outline-none focus:ring-1 focus:ring-slate-300 transition-all"
                      value={nuevoProducto.categoria}
                      onChange={e => setNuevoProducto({...nuevoProducto, categoria: e.target.value})}
                    >
                      <option value="Preparados">Platos Preparados (Hoy)</option>
                      <option value="Panaderia">Panadería / Repostería</option>
                      <option value="Frutas">Frutas y Verduras</option>
                      <option value="Despensa">Despensa (Cerca a vencer)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <LabelCustom>Precio Original</LabelCustom>
                      <Input type="number" className="rounded-xl bg-slate-50 border-none font-black focus-visible:ring-1 focus-visible:ring-slate-300" value={nuevoProducto.precio_original} onChange={e => handlePrecioOriginalChange(e.target.value)} required />
                    </div>
                    <div className="space-y-1">
                      <LabelCustom>% Dcto</LabelCustom>
                      <Input type="number" className="rounded-xl bg-slate-50 border-none font-black text-green-600 focus-visible:ring-1 focus-visible:ring-slate-300" value={descuentoManual} onChange={e => handleDescuentoChange(e.target.value)} />
                    </div>
                  </div>

                  {precioRescateCalculado && (
                    <div className="bg-green-50/60 border border-green-100 rounded-2xl px-4 py-3 flex items-center justify-between shadow-sm">
                      <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Precio de Rescate</span>
                      <span className="text-lg font-black text-green-600">{precioRescateCalculado}</span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <LabelCustom>Fecha estimada de vencimiento</LabelCustom>
                    <input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={nuevoProducto.fecha_vencimiento}
                      onChange={e => setNuevoProducto({...nuevoProducto, fecha_vencimiento: e.target.value})}
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 border-none font-bold text-xs text-slate-700 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <LabelCustom>Stock Disponible</LabelCustom>
                    <Input type="number" className="rounded-xl bg-slate-50 border-none font-black focus-visible:ring-1 focus-visible:ring-slate-300" value={nuevoProducto.stock} onChange={e => setNuevoProducto({...nuevoProducto, stock: e.target.value})} required />
                  </div>

                  {/* Declaración de Responsabilidad */}
                  <div className={`p-4 rounded-2xl transition-all border duration-300 ${aceptaResponsabilidad ? 'bg-blue-50/60 border-blue-200' : 'bg-amber-50/60 border-amber-200'}`}>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="mt-1 accent-green-600"
                        checked={aceptaResponsabilidad}
                        onChange={e => setAceptaResponsabilidad(e.target.checked)}
                      />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-800 uppercase flex items-center gap-1">
                          <ShieldCheck size={12} className="text-blue-600"/> Declaración de Calidad
                        </span>
                        <p className="text-[9px] font-bold text-slate-500 leading-tight mt-1">
                          Certifico que el producto es apto para consumo y cumple las normas de salud vigentes.
                        </p>
                      </div>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || !aceptaResponsabilidad}
                    className={`w-full py-6 rounded-[20px] font-black uppercase text-[11px] transition-all shadow-md ${
                      aceptaResponsabilidad
                        ? (editingId ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-slate-900 hover:bg-green-600 text-white')
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" />
                    ) : editingId ? "Actualizar Oferta" : "Publicar Oferta Segura"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* LISTADO DE PRODUCTOS */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800">Mis ofertas activas</h2>
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{productos.length} activas</span>
            </div>
            {productos.length > 0 ? productos.map((prod) => (
              <Card key={prod.id} className={`border rounded-2xl p-4 bg-white hover:shadow-sm transition-all ${editingId === prod.id ? 'ring-2 ring-amber-400 border-transparent bg-amber-50/30' : 'border-slate-200'}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={prod.imagen_url && prod.imagen_url.trim() !== "" ? prod.imagen_url : IMG_SORPRESA}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                      alt={prod.nombre}
                      onError={(e) => { (e.target as HTMLImageElement).src = IMG_SORPRESA; }}
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-800 text-sm truncate">{prod.nombre}</h4>
                      <div className="flex gap-2 items-center mt-0.5 flex-wrap">
                        <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{prod.categoria || 'Rescate'}</span>
                        <span className="text-[10px] font-semibold text-green-600">Stock: {prod.stock}</span>
                      </div>
                      <p className="text-sm font-black text-slate-900 mt-0.5">${Number(prod.precio_rescate).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">Activa</span>
                    <Button variant="ghost" onClick={() => activarEdicion(prod)} className="h-8 w-8 p-0 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg">
                      <Edit2 size={13}/>
                    </Button>
                    <Button variant="ghost" onClick={() => eliminarProducto(prod.id)} className="h-8 w-8 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                      <Trash2 size={13}/>
                    </Button>
                  </div>
                </div>
              </Card>
            )) : (
              <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl bg-white">
                <p className="text-sm text-slate-400 font-semibold">No hay productos activos</p>
              </div>
            )}
          </div>

          {/* ACTIVIDAD RECIENTE */}
          <div className="lg:col-span-3">
            <Card className="border border-slate-200 rounded-2xl bg-white p-5">
              <div className="flex items-center gap-2 mb-4">
                <History className="w-4 h-4 text-slate-400" />
                <h3 className="font-bold text-slate-900 text-sm">Actividad reciente</h3>
              </div>
              <div className="space-y-4 relative">
                <div className="absolute left-1 top-1.5 bottom-1.5 w-[2px] bg-slate-100" />
                {actividad.length > 0 ? actividad.map((log) => (
                  <div key={log.id} className="relative pl-5">
                    <div className="absolute left-0 top-1 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white shadow-sm" />
                    <p className="text-xs font-semibold text-slate-700 leading-tight">{log.descripcion}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(log.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                )) : <p className="text-xs text-slate-400 font-semibold pl-5">Sin movimientos recientes</p>}
              </div>
            </Card>
          </div>
        </div>

        {/* ── BOTTOM BANNER ── */}
        <div className="mt-8 bg-green-900 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-white">
          <div>
            <h3 className="text-base font-black">Gracias por ser parte del cambio 💚</h3>
            <p className="text-sm text-green-200 mt-1">Juntos reducimos el desperdicio de alimentos y construimos un futuro más sostenible.</p>
          </div>
          <button className="bg-white text-green-900 font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-green-50 transition-colors shrink-0">
            Ver mi impacto
          </button>
        </div>
      </main>
    </div>
  );
}

function LabelCustom({ children }: { children: React.ReactNode }) {
  return <label className="text-[9px] font-black uppercase text-slate-400 ml-1 block mb-1 tracking-widest">{children}</label>;
}