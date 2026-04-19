import { useState } from "react";
import AppNavbar from "../components/AppNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  PlusCircle, 
  Store, 
  Package, 
  TrendingUp, 
  CheckCircle2, 
  Trash2,
  AlertCircle
} from "lucide-react";

export default function Aliado() {
  // Estado para la lista de productos
  const [productos, setProductos] = useState([
    { id: 1, nombre: "Pack Croissants x4", precio: 8000, stock: 3, estado: "Activo" },
    { id: 2, nombre: "Bolsa de Pan Masa Madre", precio: 12000, stock: 1, estado: "Poco Stock" },
  ]);

  // ESTADOS PARA EL FORMULARIO
  const [nombre, setNombre] = useState("");
  const [precioOriginal, setPrecioOriginal] = useState("");
  const [precioRescate, setPrecioRescate] = useState("");
  const [stock, setStock] = useState("");

  // FUNCIÓN PARA AGREGAR PRODUCTO
  const handlePublicar = () => {
    if (!nombre || !precioRescate) {
      alert("Por favor completa al menos el nombre y el precio de rescate");
      return;
    }

    const nuevoProducto = {
      id: Date.now(), // Genera un ID único basado en el tiempo
      nombre: nombre,
      precio: parseInt(precioRescate),
      stock: parseInt(stock) || 1,
      estado: "Activo"
    };

    setProductos([nuevoProducto, ...productos]); // Lo agrega al inicio de la lista
    
    // Limpiar formulario
    setNombre("");
    setPrecioOriginal("");
    setPrecioRescate("");
    setStock("");
  };

  // FUNCIÓN PARA ELIMINAR
  const eliminarProducto = (id: number) => {
    setProductos(productos.filter(p => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AppNavbar />
      
      <main className="flex-grow container mx-auto px-4 pt-28 pb-12 max-w-6xl">
        {/* Header del Negocio */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Store className="text-green-600 w-8 h-8" /> Panel de Pan del Sol
            </h1>
            <p className="text-slate-500 font-medium">Gestiona tus excedentes y reduce el desperdicio.</p>
          </div>
          <Badge className="w-fit bg-green-100 text-green-700 py-2 px-4 rounded-full border-none font-bold">
            Tienda Verificada ✅
          </Badge>
        </div>

        {/* Stats Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: "Ventas Hoy", value: "$45.000", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Rescates Totales", value: "128", icon: Package, color: "text-green-600", bg: "bg-green-50" },
            { label: "CO2 Ahorrado", value: "12kg", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          ].map((stat, i) => (
            <Card key={i} className="border-none shadow-sm rounded-[32px]">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`${stat.bg} p-4 rounded-2xl`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase">{stat.label}</p>
                  <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario de Publicación */}
          <div className="lg:col-span-1">
            <Card className="border-none shadow-lg rounded-[40px] bg-white sticky top-28">
              <CardHeader className="p-8 pb-0">
                <CardTitle className="text-xl font-black flex items-center gap-2">
                  <PlusCircle className="text-green-600" /> Publicar Pack
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase ml-1">Nombre del producto</label>
                  <Input 
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej: Bolsa Sorpresa Dulce" 
                    className="rounded-xl border-slate-100 py-6" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase ml-1">Precio Original</label>
                    <Input 
                      value={precioOriginal}
                      onChange={(e) => setPrecioOriginal(e.target.value)}
                      type="number" 
                      placeholder="25000" 
                      className="rounded-xl border-slate-100 py-6" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase ml-1">Precio Rescate</label>
                    <Input 
                      value={precioRescate}
                      onChange={(e) => setPrecioRescate(e.target.value)}
                      type="number" 
                      placeholder="10000" 
                      className="rounded-xl border-green-200 py-6" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase ml-1">Cantidad disponible</label>
                  <Input 
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    type="number" 
                    placeholder="5" 
                    className="rounded-xl border-slate-100 py-6" 
                  />
                </div>
                <Button 
                  onClick={handlePublicar}
                  className="w-full bg-slate-900 hover:bg-green-700 py-7 rounded-2xl font-black text-lg transition-all mt-4"
                >
                  Lanzar Oferta 🚀
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Productos Activos */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <AlertCircle className="text-amber-500" /> Productos en Vitrina
            </h3>
            <div className="space-y-4">
              {productos.length === 0 ? (
                <div className="text-center py-20 bg-slate-100 rounded-[32px] border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 font-bold text-lg">No tienes productos activos hoy 🥖</p>
                </div>
              ) : (
                productos.map((prod) => (
                  <Card key={prod.id} className="border-none shadow-sm rounded-[32px] overflow-hidden group hover:shadow-md transition-all">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl">
                          🥖
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-lg">{prod.nombre}</h4>
                          <div className="flex gap-2 mt-1">
                            <Badge className="bg-slate-100 text-slate-600 border-none text-[10px] font-bold">
                              Stock: {prod.stock}
                            </Badge>
                            <Badge className={prod.estado === "Activo" ? "bg-green-100 text-green-700 border-none text-[10px] font-bold" : "bg-amber-100 text-amber-700 border-none text-[10px] font-bold"}>
                              {prod.estado}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs font-bold text-slate-400 uppercase">Precio</p>
                          <p className="text-xl font-black text-green-700">${prod.precio.toLocaleString()}</p>
                        </div>
                        <Button 
                          onClick={() => eliminarProducto(prod.id)}
                          variant="ghost" 
                          className="rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 p-2"
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </CardContent>
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