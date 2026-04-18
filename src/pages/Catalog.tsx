import { useState, useMemo } from "react";
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
  Gift, 
  Store, 
  X, 
  Utensils, 
  CheckCircle2, 
  QrCode,
} from "lucide-react";

// --- DATOS DE PRUEBA ---
const PRODUCTOS_PRUEBA = [
  { id: 1, nombre: "Bolsa Sorpresa Panadería", tienda: "Pan del Sol", precioOriginal: 30000, precioOferta: 12000, descuento: 60, categoria: "Panadería", imagen: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500", esSorpresa: true },
  { id: 2, nombre: "Caja de Donas x6", tienda: "Dunkin Local", precioOriginal: 25000, precioOferta: 15000, descuento: 40, categoria: "Postres", imagen: "https://images.unsplash.com/photo-1527515545081-5db817172677?w=500", esSorpresa: false },
  { id: 3, nombre: "Combo Almuerzo Rescatado", tienda: "Restaurante Central", precioOriginal: 18000, precioOferta: 9000, descuento: 50, categoria: "Restaurantes", imagen: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500", esSorpresa: false },
  { id: 4, nombre: "Pack Frutas de Temporada", tienda: "Frubana", precioOriginal: 40000, precioOferta: 10000, descuento: 75, categoria: "Frutas", imagen: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500", esSorpresa: true },
];

export default function Catalog() {
  const [search, setSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState<number>(50000);
  const [sortBy, setSortBy] = useState("discount");
  const [selectedCategory, setSelectedCategory] = useState("Todas");

  // Estados para el Modal de Rescate
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState<"confirm" | "success">("confirm");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // --- LÓGICA DE FILTRADO ---
  const productosFiltrados = useMemo(() => {
    return PRODUCTOS_PRUEBA.filter((prod) => {
      const coincideNombre = prod.nombre.toLowerCase().includes(search.toLowerCase()) || 
                             prod.tienda.toLowerCase().includes(search.toLowerCase());
      const coincidePrecio = prod.precioOferta <= maxPrice;
      const coincideCategoria = selectedCategory === "Todas" || prod.categoria === selectedCategory;
      return coincideNombre && coincidePrecio && coincideCategoria;
    }).sort((a, b) => {
      if (sortBy === "discount") return b.descuento - a.descuento;
      if (sortBy === "price_asc") return a.precioOferta - b.precioOferta;
      return 0;
    });
  }, [search, maxPrice, sortBy, selectedCategory]);

  const openRescate = (product: any) => {
    setSelectedProduct(product);
    setStep("confirm");
    setIsModalOpen(true);
  };

  const confirmRescate = () => {
    // Aquí iría la lógica de API
    setStep("success");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNavbar /> 

      <div className="container mx-auto px-4 py-8 pt-24 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Explorar Ofertas 🥑</h1>
          <p className="text-slate-500 font-medium">Pereira, Risaralda - {productosFiltrados.length} oportunidades de rescate</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar de Filtros */}
          <aside className="w-full lg:w-64 space-y-8 bg-white p-6 rounded-[24px] shadow-sm h-fit border border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-4 text-slate-900 font-bold">
                <SlidersHorizontal className="w-4 h-4 text-green-600" />
                Filtros
              </div>
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-xs uppercase font-black text-slate-400">Precio Máximo: ${maxPrice.toLocaleString()}</Label>
                  <Slider value={[maxPrice]} onValueChange={([v]) => setMaxPrice(v)} max={50000} step={1000} className="cursor-pointer" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-black text-slate-400">Categorías</Label>
                  {["Todas", "Panadería", "Restaurantes", "Postres", "Frutas"].map((cat) => (
                    <button key={cat} onClick={() => setSelectedCategory(cat)} className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${selectedCategory === cat ? "bg-green-50 text-green-700 border-l-4 border-green-600 pl-4" : "text-slate-600 hover:bg-slate-50"}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Grid de Productos */}
          <main className="flex-1">
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input placeholder="Busca comida o locales..." className="pl-12 pr-10 py-6 rounded-2xl border-none shadow-sm focus-visible:ring-green-500 bg-white" value={search} onChange={(e) => setSearch(e.target.value)} />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full">
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                )}
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[200px] py-6 rounded-2xl border-none shadow-sm bg-white font-medium">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="discount">Mayor Descuento</SelectItem>
                  <SelectItem value="price_asc">Menor Precio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {productosFiltrados.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in duration-500">
                {productosFiltrados.map((prod) => (
                  <div key={prod.id} className="group bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
                    <div className="relative h-48 overflow-hidden">
                      <img src={prod.imagen} alt={prod.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <Badge className="absolute top-4 left-4 bg-green-600 text-white border-none px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                        -{prod.descuento}%
                      </Badge>
                      {prod.esSorpresa && (
                        <div className="absolute top-4 right-4 bg-amber-400 p-2 rounded-full shadow-lg">
                          <Gift className="w-4 h-4 text-amber-900" />
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase mb-2">
                        <Store className="w-3 h-3" /> {prod.tienda}
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 mb-4 line-clamp-1">{prod.nombre}</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-xs line-through font-medium">${prod.precioOriginal.toLocaleString()}</p>
                          <p className="text-2xl font-black text-green-700">${prod.precioOferta.toLocaleString()}</p>
                        </div>
                        <Button onClick={() => openRescate(prod)} className="bg-slate-900 hover:bg-green-700 text-white rounded-xl px-5 font-bold transition-all active:scale-95 shadow-lg shadow-slate-200">
                          Rescatar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-[32px] border-2 border-dashed border-slate-200">
                <Utensils className="w-8 h-8 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-800">No hay ofertas así...</h3>
                <Button variant="link" onClick={() => {setSearch(""); setMaxPrice(50000); setSelectedCategory("Todas");}} className="text-green-600 font-bold mt-2">Limpiar filtros</Button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* --- MODAL DE RESCATE (DIALOG) --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[40px] border-none p-0 overflow-hidden bg-white shadow-2xl">
          {step === "confirm" ? (
            <div className="p-8">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl font-black text-slate-900">Confirmar Rescate</DialogTitle>
                <DialogDescription className="text-slate-500 font-medium">
                  Estás a punto de salvar comida deliciosa. Recuerda que pagas directamente en el local.
                </DialogDescription>
              </DialogHeader>
              
              <div className="bg-slate-50 p-6 rounded-[32px] mb-8 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold text-sm uppercase">Producto:</span>
                  <span className="text-slate-900 font-black">{selectedProduct?.nombre}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold text-sm uppercase">Local:</span>
                  <span className="text-slate-900 font-black">{selectedProduct?.tienda}</span>
                </div>
                <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-slate-900 font-black text-lg">Total a pagar:</span>
                  <span className="text-green-700 font-black text-2xl">${selectedProduct?.precioOferta.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button onClick={confirmRescate} className="w-full bg-green-600 hover:bg-green-700 text-white rounded-2xl py-7 text-lg font-black transition-all shadow-lg shadow-green-100">
                  ¡Confirmar Rescate! 🥑
                </Button>
                <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="w-full rounded-2xl py-6 font-bold text-slate-400">
                  Tal vez luego
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">¡Hecho!</h2>
              <p className="text-slate-500 font-medium mb-8">
                Tu rescate en <span className="text-slate-900 font-bold">{selectedProduct?.tienda}</span> ha sido registrado.
              </p>
              
              <div className="bg-slate-900 p-8 rounded-[32px] mb-8 flex flex-col items-center gap-4">
                <QrCode className="w-32 h-32 text-white" />
                <div className="text-white">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Código de Rescate</p>
                  <p className="text-xl font-mono font-bold tracking-widest">RES-3928</p>
                </div>
              </div>

              <Button onClick={() => window.location.href = "/perfil"} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-2xl py-7 font-black transition-all">
                Ver mis rescates
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}