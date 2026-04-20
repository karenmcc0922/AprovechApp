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

const PRODUCTOS_PRUEBA = [
  { id: "mock-1", nombre: "Bolsa Sorpresa Panadería", tienda: "Pan del Sol", precioOriginal: 30000, precioOferta: 12000, descuento: 60, categoria: "Panadería", imagen: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500", esSorpresa: true, direccion: "Calle 20 #5-12", stock: 4, aliado_id: 999 },
  { id: "mock-2", nombre: "Caja de Donas x6", tienda: "Dunkin Local", precioOriginal: 25000, precioOferta: 15000, descuento: 40, categoria: "Postres", imagen: "https://images.unsplash.com/photo-1527515545081-5db817172677?w=500", esSorpresa: false, direccion: "Av. Circunvalar #12-05", stock: 2, aliado_id: 998 },
];

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
    const dbNormalizados = productosDB.map(p => ({
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
      aliado_id: p.aliado_id // IMPORTANTE: Para que el aliado lo reconozca
    }));

    const todos = [...dbNormalizados, ...PRODUCTOS_PRUEBA];

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

  // Dentro de Catalog.tsx, reemplazar la función confirmarRescate:

const confirmarRescate = async () => {
    if (!selectedProduct) return;
    setIsProcessing(true);
    
    const user = JSON.parse(localStorage.getItem("usuario") || "{}");
    
    // Si no hay ID de usuario, no podemos crear el pedido en BD
    if (!user.id) {
        alert("Debes iniciar sesión nuevamente.");
        setIsProcessing(false);
        return;
    }

    try {
        // LLAMADA AL BACKEND PARA CREAR PEDIDO Y RESTAR STOCK
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

        if (!response.ok) throw new Error(data.error || "Error al crear pedido");

        // Guardar copia local para historial rápido
        const nuevoRescateLocal = {
            id: data.pedidoId,
            codigo: data.codigo,
            local: selectedProduct.tienda,
            producto: selectedProduct.nombre,
            precio: selectedProduct.precioOferta,
            estado: "Pendiente",
            fecha: new Date().toLocaleDateString()
        };
        
        const historial = JSON.parse(localStorage.getItem("historial_rescates") || "[]");
        localStorage.setItem("historial_rescates", JSON.stringify([nuevoRescateLocal, ...historial]));

        setStep("success");
        fetchProductos(); // Recargar stock en la UI
    } catch (error: any) {
        alert(error.message);
        setIsModalOpen(false);
    } finally {
        setIsProcessing(false);
    }
};

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNavbar /> 
      <div className="container mx-auto px-4 py-8 pt-24 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight text-center md:text-left">Explorar Ofertas 🥑</h1>
          <p className="text-slate-500 font-medium text-center md:text-left">Pereira - {productosFinales.length} oportunidades de rescate</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-64 space-y-8 bg-white p-6 rounded-[24px] shadow-sm h-fit border border-slate-100">
            <div className="flex items-center gap-2 mb-4 text-slate-900 font-bold">
              <SlidersHorizontal className="w-4 h-4 text-green-600" /> Filtros
            </div>
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-[10px] uppercase font-black text-slate-400">Precio Máximo: ${maxPrice.toLocaleString()}</Label>
                <Slider value={[maxPrice]} onValueChange={([v]) => setMaxPrice(v)} max={50000} step={1000} />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black text-slate-400">Categorías</Label>
                {["Todas", "Panadería", "Restaurantes", "Postres", "Frutas"].map((cat) => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)} className={`block w-full text-left px-3 py-2 rounded-xl text-sm font-bold transition-all ${selectedCategory === cat ? "bg-green-50 text-green-700" : "text-slate-500 hover:bg-slate-50"}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <main className="flex-1">
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input placeholder="Busca comida..." className="pl-12 py-7 rounded-2xl border-none shadow-sm bg-white font-medium" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[200px] py-7 rounded-2xl border-none shadow-sm bg-white font-bold">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="discount">Mayor Descuento</SelectItem>
                  <SelectItem value="price_asc">Menor Precio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-green-600 w-10 h-10" /></div>
            ) : productosFinales.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-200">
                  <p className="font-bold text-slate-400">No hay productos disponibles por ahora.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {productosFinales.map((prod) => (
                  <div key={prod.id} className="group bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                    <div className="relative h-48 overflow-hidden">
                      <img src={prod.imagen} alt={prod.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <Badge className="bg-green-600 border-none font-black text-white px-3 py-1 shadow-lg">
                          -{prod.descuento}%
                        </Badge>
                        {prod.stock <= 2 && (
                          <Badge className="bg-red-500 border-none font-black text-white px-3 py-1 shadow-lg animate-pulse">
                            ¡ÚLTIMOS!
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-1 mb-1 text-slate-400">
                        <MapPin className="w-3 h-3" />
                        <p className="text-[10px] font-black uppercase tracking-tight">{prod.tienda}</p>
                      </div>
                      <h3 className="text-lg font-black text-slate-800 mb-4 line-clamp-1 uppercase">{prod.nombre}</h3>
                      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                        <div>
                          <p className="text-slate-300 text-xs line-through font-bold">${prod.precioOriginal.toLocaleString()}</p>
                          <p className="text-xl font-black text-slate-900">${prod.precioOferta.toLocaleString()}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Package2 className={`w-3 h-3 ${prod.stock <= 2 ? 'text-red-500' : 'text-orange-500'}`} />
                            <span className={`text-[10px] font-black uppercase ${prod.stock <= 2 ? 'text-red-500' : 'text-orange-500'}`}>
                              {prod.stock} disponibles
                            </span>
                          </div>
                        </div>
                        <Button onClick={() => openRescate(prod)} className="bg-slate-900 hover:bg-green-700 rounded-xl font-black px-6 shadow-md transition-colors">
                            Rescatar
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-[40px] border-none p-0 overflow-hidden bg-white shadow-2xl">
          {step === "confirm" ? (
            <div className="p-8">
              <DialogHeader className="mb-6 text-left">
                <DialogTitle className="text-2xl font-black">Confirmar Rescate</DialogTitle>
                <DialogDescription className="font-medium text-slate-500">
                    El pago se realiza directamente en el local al retirar.
                </DialogDescription>
              </DialogHeader>
              <div className="bg-slate-50 p-6 rounded-[28px] mb-8 space-y-3">
                <div className="flex justify-between text-sm"><span className="text-slate-400 font-bold">Local:</span><span className="font-black text-slate-900 uppercase">{selectedProduct?.tienda}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-400 font-bold">Unidades:</span><span className="font-black text-slate-900">1 unidad</span></div>
                <div className="flex justify-between text-sm border-t border-slate-200 pt-3"><span className="text-slate-400 font-bold">Total a pagar:</span><span className="text-green-700 font-black text-lg">${selectedProduct?.precioOferta.toLocaleString()}</span></div>
              </div>
              <Button onClick={confirmarRescate} disabled={isProcessing} className="w-full bg-green-600 py-7 rounded-2xl font-black text-lg shadow-lg hover:bg-green-700 transition-all">
                  {isProcessing ? <Loader2 className="animate-spin" /> : "¡Confirmar! 🥑"}
              </Button>
            </div>
          ) : (
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-black mb-2 tracking-tight">¡Éxito!</h2>
              <p className="text-slate-500 mb-8 text-sm px-4">Presenta este código al llegar a <b>{selectedProduct?.tienda}</b></p>
              <div className="bg-slate-900 p-8 rounded-[32px] mb-8 flex flex-col items-center shadow-xl">
                <QrCode className="w-32 h-32 text-white mb-4" />
                <p className="text-white font-mono font-bold tracking-widest uppercase text-sm">
                    ID: {String(selectedProduct?.id || "").slice(-4)}
                </p>
              </div>
              <Button onClick={() => setIsModalOpen(false)} className="w-full bg-slate-100 text-slate-900 py-7 rounded-2xl font-black hover:bg-slate-200">
                  Cerrar y Volver
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}