import { useState, useMemo, useEffect } from "react";
import AppNavbar from "../components/AppNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  Search, 
  SlidersHorizontal, 
  CheckCircle2, 
  QrCode,
  Loader2,
  MapPin,
  Package2
} from "lucide-react";

const IMG_FALLBACK = "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&q=80";

export default function Catalog() {
  const [productosDB, setProductosDB] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState<number>(50000);
  const [sortBy, setSortBy] = useState("discount");
  const [selectedCategory, setSelectedCategory] = useState("Todas");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState<"confirm" | "success">("confirm");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchProductos = async () => {
    try {
      const response = await fetch("https://aprovechapp-api.onrender.com/api/productos-todos");
      if (response.ok) {
        const data = await response.json();
        setProductosDB(data);
      }
    } catch (error) {
      console.error("Error cargando DB:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const productosFinales = useMemo(() => {
    const todos = productosDB.map(p => ({
      id: `db-${p.id}`,
      idReal: p.id,
      nombre: p.nombre,
      tienda: p.nombre_local,
      precioOriginal: p.precio_original,
      precioOferta: p.precio_rescate,
      descuento: Math.round(((p.precio_original - p.precio_rescate) / p.precio_original) * 100),
      categoria: "General", 
      imagen: p.imagen_url || IMG_FALLBACK, 
      esSorpresa: false,
      direccion: p.direccion || "Dirección no disponible",
      stock: p.stock,
      aliado_id: p.aliado_id
    }));

    return todos.filter((prod) => {
      const coincideNombre = prod.nombre.toLowerCase().includes(search.toLowerCase()) || prod.tienda.toLowerCase().includes(search.toLowerCase());
      const coincidePrecio = prod.precioOferta <= maxPrice;
      const coincideCategoria = selectedCategory === "Todas" || prod.categoria === selectedCategory;
      const tieneStock = prod.stock > 0;
      return coincideNombre && coincidePrecio && coincideCategoria && tieneStock;
    }).sort((a, b) => {
      if (sortBy === "discount") return b.descuento - a.descuento;
      if (sortBy === "price_asc") return a.precioOferta - b.precioOferta;
      return 0;
    });
  }, [productosDB, search, maxPrice, sortBy, selectedCategory]);

  const openRescate = (product: any) => {
    setSelectedProduct(product);
    setStep("confirm");
    setIsModalOpen(true);
  };

  const confirmarRescate = async () => {
    if (!selectedProduct) return;
    setIsProcessing(true);
    const userStr = localStorage.getItem("usuario");
    const user = userStr ? JSON.parse(userStr) : null;
    
    if (!user || !user.id) {
        alert("Sesión no válida");
        setIsProcessing(false);
        return;
    }

    try {
        const response = await fetch("https://aprovechapp-api.onrender.com/api/pedidos/crear", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuario_id: user.id,
                producto_id: selectedProduct.idReal,
                aliado_id: selectedProduct.aliado_id,
                nombre_usuario: user.nombre,
                nombre_producto: selectedProduct.nombre,
                precio_final: selectedProduct.precioOferta
            })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        setSelectedProduct({ ...selectedProduct, codigoGenerado: data.codigo });
        setStep("success");
        fetchProductos();
    } catch (error: any) {
        alert(error.message);
        setIsModalOpen(false);
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AppNavbar /> 
      
      <div className="container mx-auto px-4 py-8 pt-32 max-w-7xl">
        {/* Header con Logo */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
              <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Explorar Rescates</h1>
            </div>
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
               <MapPin size={14} className="text-green-500"/> Pereira, Colombia — {productosFinales.length} disponibles
            </p>
          </div>
          
          <div className="flex gap-3">
             <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-100 flex">
                {["Todas", "Panadería", "Restaurantes"].map((cat) => (
                   <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${selectedCategory === cat ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                   >
                     {cat}
                   </button>
                ))}
             </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar de Filtros Pro */}
          <aside className="w-full lg:w-72 space-y-8">
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-10">
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-900 text-sm uppercase tracking-tighter">Ajustes de búsqueda</span>
                <SlidersHorizontal className="w-4 h-4 text-slate-300" />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Presupuesto</Label>
                    <span className="text-sm font-black text-green-600">${maxPrice.toLocaleString()}</span>
                </div>
                <Slider 
                    value={[maxPrice]} 
                    onValueChange={([v]) => setMaxPrice(v)} 
                    max={50000} 
                    step={1000}
                    className="py-4"
                />
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Ordenar por</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full py-6 rounded-2xl border-none bg-slate-50 font-bold text-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-xl">
                    <SelectItem value="discount">🔥 Mayor Descuento</SelectItem>
                    <SelectItem value="price_asc">💰 Menor Precio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Promo Card en Sidebar */}
            <div className="bg-green-600 rounded-[40px] p-8 text-white relative overflow-hidden group">
                <div className="relative z-10">
                    <p className="font-black text-xl leading-tight mb-2">¡Sálvalos todos!</p>
                    <p className="text-green-100 text-xs font-medium opacity-80">Cada rescate reduce el desperdicio en tu ciudad.</p>
                </div>
                <img src="/logo.png" className="absolute -right-4 -bottom-4 w-24 h-24 opacity-20 group-hover:scale-110 transition-transform" />
            </div>
          </aside>

          {/* Listado Principal */}
          <main className="flex-1 space-y-8">
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <Input 
                placeholder="Buscar por comida, panadería, restaurante..." 
                className="pl-14 py-8 rounded-[32px] border-none shadow-sm bg-white font-bold text-slate-700 placeholder:text-slate-300" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="animate-spin text-green-600 w-12 h-12" />
                <p className="font-black text-slate-300 uppercase text-xs tracking-widest">Cargando delicias...</p>
              </div>
            ) : productosFinales.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-[40px] border-2 border-dashed border-slate-100">
                  <Package2 className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="font-black text-slate-400 uppercase text-xs">No hay rescates que coincidan</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8">
                {productosFinales.map((prod) => (
                  <div key={prod.id} className="group bg-white rounded-[44px] overflow-hidden border border-white shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                    <div className="relative h-56 overflow-hidden">
                      <img src={prod.imagen} alt={prod.nombre} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <div className="absolute top-5 left-5 flex flex-col gap-2">
                        <Badge className="bg-white text-slate-900 border-none font-black px-4 py-2 rounded-full shadow-xl text-sm">
                          -{prod.descuento}%
                        </Badge>
                        {prod.stock <= 2 && (
                          <Badge className="bg-red-500 text-white border-none font-black px-4 py-2 rounded-full shadow-xl text-[10px] animate-bounce">
                            ¡CASI AGOTADO!
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="p-8">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{prod.tienda}</p>
                      </div>
                      
                      <h3 className="text-xl font-black text-slate-800 mb-6 group-hover:text-green-600 transition-colors uppercase truncate">{prod.nombre}</h3>
                      
                      <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                        <div>
                          <p className="text-slate-300 text-xs line-through font-bold mb-1">${prod.precioOriginal.toLocaleString()}</p>
                          <p className="text-2xl font-black text-slate-900 tracking-tighter">${prod.precioOferta.toLocaleString()}</p>
                        </div>
                        <Button 
                            onClick={() => openRescate(prod)} 
                            className="bg-slate-900 hover:bg-green-600 text-white rounded-2xl font-black px-8 py-7 shadow-xl transition-all active:scale-95"
                        >
                            RESCATAR
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modal Rediseñado */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-[50px] border-none p-0 overflow-hidden bg-white shadow-2xl">
          {step === "confirm" ? (
            <div className="p-10">
              <DialogHeader className="mb-8">
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-4">
                    <img src="/logo.png" className="w-6 h-6 object-contain" />
                </div>
                <DialogTitle className="text-3xl font-black tracking-tight text-slate-900">¿Confirmas el rescate?</DialogTitle>
                <DialogDescription className="font-bold text-slate-400 text-xs uppercase tracking-widest">
                    Pagarás al retirar en el punto físico.
                </DialogDescription>
              </DialogHeader>

              <div className="bg-slate-50 p-8 rounded-[32px] mb-8 space-y-4 border border-slate-100">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-black uppercase">Local</span>
                    <span className="font-black text-slate-900 uppercase">{selectedProduct?.tienda}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-black uppercase">Producto</span>
                    <span className="font-black text-slate-900 uppercase truncate max-w-[150px]">{selectedProduct?.nombre}</span>
                </div>
                <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                    <span className="text-slate-400 font-black uppercase text-[10px]">Precio Final</span>
                    <span className="text-2xl font-black text-green-600">${selectedProduct?.precioOferta.toLocaleString()}</span>
                </div>
              </div>

              <Button onClick={confirmarRescate} disabled={isProcessing} className="w-full bg-slate-900 py-8 rounded-3xl font-black text-lg shadow-xl hover:bg-green-600 transition-all">
                  {isProcessing ? <Loader2 className="animate-spin" /> : "¡LISTO PARA RESCATAR!"}
              </Button>
            </div>
          ) : (
            <div className="p-10 text-center">
              <div className="w-24 h-24 bg-green-50 rounded-[35px] flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-4xl font-black mb-2 tracking-tighter text-slate-900">¡ES TUYO!</h2>
              <p className="text-slate-400 mb-10 text-xs font-black uppercase tracking-widest px-4 leading-relaxed">
                  Presenta este código en <span className="text-slate-900 underline">{selectedProduct?.tienda}</span>
              </p>
              
              <div className="bg-slate-900 p-10 rounded-[45px] mb-10 flex flex-col items-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-green-500" />
                <QrCode className="w-32 h-32 text-white mb-6 opacity-90" />
                <p className="text-green-400 font-mono font-black tracking-[0.3em] text-3xl uppercase">
                    {selectedProduct?.codigoGenerado}
                </p>
              </div>

              <Button onClick={() => setIsModalOpen(false)} className="w-full bg-slate-100 text-slate-900 py-8 rounded-3xl font-black hover:bg-slate-200 transition-all uppercase text-xs tracking-widest">
                  Volver al menú
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}