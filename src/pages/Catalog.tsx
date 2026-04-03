import { useState } from "react";
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
import { Search, SlidersHorizontal, Gift, Store, X } from "lucide-react";

// --- DATOS DE PRUEBA (MOCK DATA) ---
const PRODUCTOS_PRUEBA = [
  { id: 1, nombre: "Bolsa Sorpresa Panadería", tienda: "Pan del Sol", precioOriginal: 30000, precioOferta: 12000, descuento: 60, categoria: "Panadería", imagen: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500", esSorpresa: true },
  { id: 2, nombre: "Caja de Donas x6", tienda: "Dunkin Local", precioOriginal: 25000, precioOferta: 15000, descuento: 40, categoria: "Postres", imagen: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=500", esSorpresa: false },
  { id: 3, nombre: "Combo Almuerzo Rescatado", tienda: "Restaurante Central", precioOriginal: 18000, precioOferta: 9000, descuento: 50, categoria: "Restaurantes", imagen: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500", esSorpresa: false },
  { id: 4, nombre: "Pack Frutas de Temporada", tienda: "Frubana", precioOriginal: 40000, precioOferta: 10000, descuento: 75, categoria: "Frutas", imagen: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500", esSorpresa: true },
];

export default function Catalog() {
  const [search, setSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState<number>(50000);
  const [sortBy, setSortBy] = useState("discount");

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNavbar /> 

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Explorar Ofertas 🥑</h1>
          <p className="text-slate-500 font-medium">Pereira, Risaralda - Hay {PRODUCTOS_PRUEBA.length} ofertas esperándote</p>
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
                {/* Filtro Precio */}
                <div className="space-y-3">
                  <Label className="text-xs uppercase font-black text-slate-400">Precio Máximo: ${maxPrice.toLocaleString()}</Label>
                  <Slider 
                    value={[maxPrice]} 
                    onValueChange={([v]) => setMaxPrice(v)} 
                    max={100000} 
                    step={1000} 
                  />
                </div>

                {/* Filtro Categorías */}
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-black text-slate-400">Categorías</Label>
                  {["Todas", "Panadería", "Restaurantes", "Postres", "Frutas"].map((cat) => (
                    <button 
                      key={cat} 
                      className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors text-slate-600"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Grid de Productos */}
          <main className="flex-1">
            {/* Buscador y Ordenar */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input 
                  placeholder="¿Qué quieres rescatar hoy?" 
                  className="pl-12 pr-10 py-6 rounded-2xl border-none shadow-sm focus-visible:ring-green-500"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button 
                    onClick={() => setSearch("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                )}
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[200px] py-6 rounded-2xl border-none shadow-sm bg-white">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="discount">Mayor Descuento</SelectItem>
                  <SelectItem value="price_asc">Menor Precio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Listado */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {PRODUCTOS_PRUEBA.map((prod) => (
                <div key={prod.id} className="group bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={prod.imagen} 
                      alt={prod.nombre} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                    <Badge className="absolute top-4 left-4 bg-green-600 text-white border-none px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      -{prod.descuento}%
                    </Badge>
                    {prod.esSorpresa && (
                      <div className="absolute top-4 right-4 bg-purple-500 p-2 rounded-full shadow-lg">
                        <Gift className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase mb-2">
                      <Store className="w-3 h-3" />
                      {prod.tienda}
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 line-clamp-1">{prod.nombre}</h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-xs line-through font-medium">${prod.precioOriginal.toLocaleString()}</p>
                        <p className="text-2xl font-black text-green-700">${prod.precioOferta.toLocaleString()}</p>
                      </div>
                      <Button className="bg-slate-900 hover:bg-green-700 text-white rounded-xl px-5 font-bold transition-colors">
                        Rescatar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}