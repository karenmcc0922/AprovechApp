import { useState, useEffect } from "react";
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
  AlertCircle,
  Loader2
} from "lucide-react";

// --- INTERFAZ PARA TYPESCRIPT ---
interface Producto {
  id: number;
  nombre: string;
  precio_original: number;
  precio_rescate: number;
  stock: number;
  estado?: string;
}

export default function Aliado() {
  // 1. LEER DATOS DE SESIÓN
  const nombreNegocio = localStorage.getItem("user_name") || "Mi Comercio";
  const aliadoId = localStorage.getItem("aliado_id");

  // Estado con tipado correcto para evitar errores en rojo
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  // ESTADOS PARA EL FORMULARIO
  const [nombre, setNombre] = useState("");
  const [precioOriginal, setPrecioOriginal] = useState("");
  const [precioRescate, setPrecioRescate] = useState("");
  const [stock, setStock] = useState("");

  // 2. CARGAR PRODUCTOS DESDE LA DB AL ENTRAR
  useEffect(() => {
    const cargarProductos = async () => {
      if (!aliadoId) {
        setLoading(false);
        return;
      };
      try {
        const response = await fetch(`https://aprovechapp-api.onrender.com/api/mis-productos/${aliadoId}`);
        if (response.ok) {
          const data = await response.json();
          setProductos(data);
        }
      } catch (error) {
        console.error("Error cargando productos:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarProductos();
  }, [aliadoId]);

  // 3. FUNCIÓN PARA AGREGAR PRODUCTO A LA DB
  const handlePublicar = async () => {
    if (!nombre || !precioRescate) {
      alert("Por favor completa el nombre y el precio de rescate");
      return;
    }

    const nuevoProd = {
      aliado_id: Number(aliadoId),
      nombre: nombre,
      precio_original: Number(precioOriginal) || 0,
      precio_rescate: Number(precioRescate),
      stock: Number(stock) || 1
    };

    try {
      const response = await fetch("https://aprovechapp-api.onrender.com/api/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoProd),
      });

      const resData = await response.json();

      if (response.ok) {
        // Crear el objeto con el ID que devolvió la base de datos
        const productoInsertado: Producto = {
          id: resData.id,
          nombre: nuevoProd.nombre,
          precio_original: nuevoProd.precio_original,
          precio_rescate: nuevoProd.precio_rescate,
          stock: nuevoProd.stock,
          estado: "Activo"
        };

        // Actualizamos el estado local sin errores de tipo
        setProductos([productoInsertado, ...productos]);
        
        // Limpiar formulario
        setNombre(""); setPrecioOriginal(""); setPrecioRescate(""); setStock("");
      } else {
        alert(resData.error || "Error al guardar el producto");
      }
    } catch (error) {
      alert("Error de conexión con el servidor");
    }
  };

  const eliminarProducto = (id: number) => {
    // Nota: Aquí se podría agregar un fetch DELETE a la API
    setProductos(productos.filter(p => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AppNavbar />
      
      <main className="flex-grow container mx-auto px-4 pt-28 pb-12 max-w-6xl">
        {/* Header Dinámico */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Store className="text-green-600 w-8 h-8" /> Panel de {nombreNegocio}
            </h1>
            <p className="text-slate-500 font-medium">Gestiona tus excedentes en tiempo real.</p>
          </div>
          <Badge className="w-fit bg-green-100 text-green-700 py-2 px-4 rounded-full border-none font-bold">
            ID Aliado: #{aliadoId || "---"}
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: "Ventas Hoy", value: "$0", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Packs Activos", value: productos.length.toString(), icon: Package, color: "text-green-600", bg: "bg-green-50" },
            { label: "Impacto", value: "0kg", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
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
          {/* Formulario */}
          <div className="lg:col-span-1">
            <Card className="border-none shadow-lg rounded-[40px] bg-white sticky top-28">
              <CardHeader className="p-8 pb-0">
                <CardTitle className="text-xl font-black flex items-center gap-2">
                  <PlusCircle className="text-green-600" /> Publicar Pack
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nombre</label>
                  <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Bolsa sorpresa Pan" className="rounded-xl border-slate-100" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Original</label>
                    <Input value={precioOriginal} onChange={(e) => setPrecioOriginal(e.target.value)} type="number" placeholder="20000" className="rounded-xl border-slate-100" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Rescate</label>
                    <Input value={precioRescate} onChange={(e) => setPrecioRescate(e.target.value)} type="number" placeholder="8000" className="rounded-xl border-green-100" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Stock</label>
                  <Input value={stock} onChange={(e) => setStock(e.target.value)} type="number" placeholder="Cant." className="rounded-xl border-slate-100" />
                </div>
                <Button onClick={handlePublicar} className="w-full bg-slate-900 hover:bg-green-700 py-7 rounded-2xl font-black text-lg transition-all mt-2">
                  Lanzar Oferta 🚀
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Lista */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <AlertCircle className="text-amber-500" /> Vitrina Actual
            </h3>
            <div className="space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Loader2 className="animate-spin mb-2" />
                  <p className="font-bold">Cargando productos...</p>
                </div>
              ) : productos.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[32px] border-2 border-dashed border-slate-200 text-slate-400 font-bold">
                  No hay productos publicados hoy 🥖
                </div>
              ) : (
                productos.map((prod) => (
                  <Card key={prod.id} className="border-none shadow-sm rounded-[32px] group hover:shadow-md transition-all">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-2xl">🥖</div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-lg">{prod.nombre}</h4>
                          <div className="flex gap-2 mt-1">
                            <Badge className="bg-slate-100 text-slate-600 border-none text-[10px] font-bold">Stock: {prod.stock}</Badge>
                            <Badge className="bg-green-100 text-green-700 border-none text-[10px] font-bold">Activo</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs font-bold text-slate-400 uppercase">Precio</p>
                          <p className="text-xl font-black text-green-700">
                            ${(prod.precio_rescate || 0).toLocaleString()}
                          </p>
                        </div>
                        <Button 
                          onClick={() => eliminarProducto(prod.id)} 
                          variant="ghost" 
                          className="text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl"
                        >
                          <Trash2 className="w-5 h-5" />
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