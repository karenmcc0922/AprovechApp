import { useState, useEffect } from "react";
import AppNavbar from "../components/AppNavbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Package, Trash2, Tag, Loader2 } from "lucide-react";

export default function Aliado() {
  const [loading, setLoading] = useState(false);
  const [productos, setProductos] = useState([]);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    precio_original: "",
    precio_rescate: "",
    stock: "",
    descripcion: "Pack sorpresa de productos frescos"
  });

  // 1. CARGAR PRODUCTOS DEL ALIADO
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
      console.error("Error cargando productos:", error);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  // 2. MANEJAR PUBLICACIÓN
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const aliadoId = localStorage.getItem("aliado_id");

    if (!aliadoId) {
      alert("Sesión expirada. Por favor inicia sesión de nuevo.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("https://aprovechapp-api.onrender.com/api/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...nuevoProducto, 
          aliado_id: parseInt(aliadoId) // Aseguramos que sea número
        })
      });

      if (res.ok) {
        alert("¡Producto publicado con éxito! 🚀");
        setNuevoProducto({ 
          nombre: "", 
          precio_original: "", 
          precio_rescate: "", 
          stock: "", 
          descripcion: "Pack sorpresa de productos frescos" 
        });
        cargarProductos(); // Recargamos la lista automáticamente
      } else {
        alert("Hubo un error al publicar.");
      }
    } catch (error) {
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNavbar />
      <main className="container mx-auto px-4 pt-28 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Formulario de Carga */}
          <Card className="border-none shadow-xl rounded-[32px] bg-white h-fit">
            <CardContent className="p-8">
              <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
                <Plus className="text-green-600" /> Publicar Pack
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input 
                  placeholder="Nombre (ej: Pack Donas x6)" 
                  value={nuevoProducto.nombre}
                  onChange={e => setNuevoProducto({...nuevoProducto, nombre: e.target.value})}
                  required 
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    type="number" placeholder="Precio Original" 
                    value={nuevoProducto.precio_original}
                    onChange={e => setNuevoProducto({...nuevoProducto, precio_original: e.target.value})}
                    required 
                  />
                  <Input 
                    type="number" placeholder="Precio Rescate" 
                    value={nuevoProducto.precio_rescate}
                    onChange={e => setNuevoProducto({...nuevoProducto, precio_rescate: e.target.value})}
                    required 
                  />
                </div>
                <Input 
                  type="number" placeholder="Cantidad Disponible" 
                  value={nuevoProducto.stock}
                  onChange={e => setNuevoProducto({...nuevoProducto, stock: e.target.value})}
                  required 
                />
                <Button disabled={loading} className="w-full bg-green-700 py-6 rounded-2xl font-black uppercase tracking-tighter hover:bg-green-800 transition-colors">
                  {loading ? <Loader2 className="animate-spin" /> : "Subir a Catálogo 🚀"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Lista de Inventario */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-black flex items-center gap-2 mb-6">
              <Package className="text-slate-400" /> Tu Inventario Activo
            </h2>
            
            {productos.length === 0 ? (
              <div className="bg-white rounded-[32px] p-12 text-center border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-bold">No tienes productos publicados todavía.</p>
              </div>
            ) : (
              productos.map((prod: any) => (
                <div key={prod.id} className="bg-white p-6 rounded-[24px] shadow-sm flex items-center justify-between border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-50 p-3 rounded-2xl">
                      <Tag className="text-green-600 w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 uppercase text-sm">{prod.nombre}</h3>
                      <p className="text-xs text-slate-400 font-bold">Stock: {prod.stock} unidades</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-6">
                    <div>
                      <p className="text-[10px] text-slate-400 font-black line-through">${prod.precio_original}</p>
                      <p className="text-lg font-black text-green-700">${prod.precio_rescate}</p>
                    </div>
                    <Button variant="ghost" className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl">
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}