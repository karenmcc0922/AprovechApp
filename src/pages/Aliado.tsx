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
  Plus
} from "lucide-react";

export default function Aliado() {
  const [loading, setLoading] = useState(false);
  const [productos, setProductos] = useState([]);
  
  // Estados para la imagen y previsualización
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    precio_original: "",
    precio_rescate: "",
    stock: "",
    descripcion: "Pack sorpresa de productos frescos",
    esSorpresa: true
  });

  const [descuentoManual, setDescuentoManual] = useState("");
  const IMG_SORPRESA = "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&q=80";

  // --- MANEJO DE ARCHIVOS ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      // Si sube foto, desactivamos "esSorpresa" para que se vea la foto real
      setNuevoProducto({ ...nuevoProducto, esSorpresa: false });
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
  };

  // --- LÓGICA DE PRECIOS INTELIGENTES ---
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

  // --- API: CARGAR PRODUCTOS ---
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
      console.error("Error al cargar productos:", error); 
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  // --- API: ENVIAR PRODUCTO ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Formulario enviado..."); // Para debug en consola

    const aliadoId = localStorage.getItem("aliado_id");
    if (!aliadoId) {
      alert("No se encontró ID de aliado. Por favor, inicia sesión de nuevo.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("nombre", nuevoProducto.nombre);
      formData.append("precio_original", nuevoProducto.precio_original);
      formData.append("precio_rescate", nuevoProducto.precio_rescate);
      formData.append("stock", nuevoProducto.stock);
      formData.append("descripcion", nuevoProducto.descripcion);
      formData.append("aliado_id", aliadoId);
      formData.append("es_sorpresa", String(nuevoProducto.esSorpresa));

      // Si hay archivo y no es sorpresa, mandamos el archivo
      if (selectedFile && !nuevoProducto.esSorpresa) {
        formData.append("imagen", selectedFile);
      } else {
        // Si es sorpresa, mandamos la URL por defecto
        formData.append("imagen_url_default", IMG_SORPRESA);
      }

      const res = await fetch("https://aprovechapp-api.onrender.com/api/productos", {
        method: "POST",
        body: formData, // Importante: FormData no lleva "Content-Type" manual
      });

      if (res.ok) {
        alert("¡Producto publicado con éxito! 🚀");
        // Reset de estados
        setNuevoProducto({ 
          nombre: "", precio_original: "", precio_rescate: "", 
          stock: "", descripcion: "Pack sorpresa de productos frescos", esSorpresa: true 
        });
        setImagePreview(null);
        setSelectedFile(null);
        setDescuentoManual("");
        cargarProductos();
      } else {
        const err = await res.json();
        alert("Error del servidor: " + (err.message || "No se pudo publicar"));
      }
    } catch (error) {
      console.error("Error de red:", error);
      alert("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
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
              <p className="text-slate-500 text-[10px] font-black uppercase">Ingresos Estimados</p>
              <h3 className="text-2xl font-black text-slate-900">
                ${productos.reduce((acc: number, curr: any) => acc + (Number(curr.precio_rescate) * Number(curr.stock)), 0).toLocaleString()}
              </h3>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario */}
          <div className="space-y-6">
            <Card className="border-none shadow-xl rounded-[40px] bg-white overflow-hidden">
              <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                <span className="font-bold flex items-center gap-2"><Plus className="w-4 h-4 text-green-400"/> Nueva Oferta</span>
              </div>

              <CardContent className="p-8 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  
                  {/* Toggle Sorpresa */}
                  <div 
                    onClick={() => setNuevoProducto({...nuevoProducto, esSorpresa: !nuevoProducto.esSorpresa})}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex justify-between items-center ${nuevoProducto.esSorpresa ? "bg-green-50 border-green-500" : "bg-slate-50 border-slate-100"}`}
                  >
                    <div className="flex gap-3 items-center">
                      <div className={`p-2 rounded-xl ${nuevoProducto.esSorpresa ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                        {nuevoProducto.esSorpresa ? <Gift className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-black text-sm text-slate-800">Pack Sorpresa</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">
                          {nuevoProducto.esSorpresa ? "Usa imagen de regalo" : "Sube una foto real"}
                        </p>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${nuevoProducto.esSorpresa ? 'bg-green-600 border-green-600' : 'border-slate-300'}`}>
                      {nuevoProducto.esSorpresa && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                  </div>

                  {/* Carga de Imagen */}
                  <div className="space-y-2">
                    <Label>Foto del Producto</Label>
                    <div className="relative">
                      {imagePreview ? (
                        <div className="relative w-full h-44 rounded-[28px] overflow-hidden border-2 border-green-500">
                          <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                          <button type="button" onClick={removeImage} className="absolute top-3 right-3 bg-red-500 text-white p-1.5 rounded-full shadow-lg">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className={`w-full h-36 border-2 border-dashed rounded-[28px] flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all ${nuevoProducto.esSorpresa ? 'opacity-50 border-slate-200' : 'border-slate-300'}`}>
                          <ImageIcon className="w-8 h-8 text-slate-300 mb-2" />
                          <span className="text-[10px] font-black text-slate-400 uppercase text-center px-4">
                            {nuevoProducto.esSorpresa ? "Opcional en modo sorpresa" : "Haz clic para subir foto"}
                          </span>
                          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Nombre del producto</Label>
                    <Input placeholder="Ej: Bolsa de Panes" className="rounded-xl bg-slate-50 py-6 border-none" value={nuevoProducto.nombre} onChange={e => setNuevoProducto({...nuevoProducto, nombre: e.target.value})} required />
                  </div>

                  {/* Precios */}
                  <div className="bg-green-50/50 p-5 rounded-[32px] border border-green-100/50 space-y-4">
                    <div className="space-y-1">
                      <Label className="text-green-700">Precio Original</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
                        <Input type="number" placeholder="0" className="pl-10 rounded-xl bg-white border-none py-6 font-black text-lg" value={nuevoProducto.precio_original} onChange={e => handlePrecioOriginalChange(e.target.value)} required />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label>Descuento %</Label>
                        <Input type="number" placeholder="0" className="rounded-xl bg-white border-none py-6 font-bold" value={descuentoManual} onChange={e => handleDescuentoChange(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label>Precio Oferta</Label>
                        <Input type="number" placeholder="0" className="rounded-xl bg-white border-none py-6 font-black text-green-700" value={nuevoProducto.precio_rescate} onChange={e => handlePrecioRescateChange(e.target.value)} required />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Unidades Disponibles</Label>
                    <Input type="number" placeholder="1" className="rounded-xl bg-slate-50 py-6 border-none font-bold" value={nuevoProducto.stock} onChange={e => setNuevoProducto({...nuevoProducto, stock: e.target.value})} required />
                  </div>

                  <Button 
                    type="submit"
                    disabled={loading} 
                    className="w-full bg-slate-900 py-8 rounded-3xl font-black text-lg hover:bg-green-600 shadow-xl transition-all"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : "PUBLICAR RESCATE 🚀"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Listado de Productos */}
          <div className="lg:col-span-2 space-y-5">
            <h2 className="text-2xl font-black text-slate-800 px-2 flex items-center gap-2">
              <Package className="text-slate-400" /> Inventario Activo
            </h2>
            
            <div className="grid gap-4">
              {productos.length === 0 ? (
                <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-slate-200 text-slate-400 font-bold">
                  No tienes ofertas activas.
                </div>
              ) : (
                productos.map((prod: any) => (
                  <Card key={prod.id} className="border-none shadow-sm rounded-[32px] bg-white overflow-hidden p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <img src={prod.imagen_url || IMG_SORPRESA} className="w-20 h-20 rounded-[20px] object-cover bg-slate-100" alt="Producto" />
                        <div>
                          <h4 className="font-black text-slate-800 text-sm uppercase">{prod.nombre}</h4>
                          <p className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-md inline-block mt-1">STOCK: {prod.stock}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-[11px] text-slate-300 font-bold line-through">${Number(prod.precio_original).toLocaleString()}</p>
                          <p className="text-xl font-black text-slate-900 tracking-tighter">${Number(prod.precio_rescate).toLocaleString()}</p>
                        </div>
                        <Button variant="ghost" className="h-12 w-12 rounded-2xl text-slate-300 hover:text-red-500 hover:bg-red-50">
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

function Label({ children, className }: { children: React.ReactNode, className?: string }) {
  return <label className={`text-[10px] font-black uppercase text-slate-400 ml-1 block mb-1 tracking-widest ${className}`}>{children}</label>;
}