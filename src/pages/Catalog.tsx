import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import AppNavbar from "../components/AppNavbar";
import { toast } from "sonner";
import { API_BASE } from "../lib/api";
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
  Package2,
  Clock,
  CreditCard,
  Banknote,
  Lock,
  Truck,
  Store,
  Sparkles,
  AlertTriangle
} from "lucide-react";

const IMG_FALLBACK = "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&q=80";

export default function Catalog() {
  const [, setLocation] = useLocation(); 
  const [productosDB, setProductosDB] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState<number>(50000);
  const [sortBy, setSortBy] = useState("discount");
  const [selectedCategory, setSelectedCategory] = useState("Todas");

  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estados para el flujo del Modal: "confirm" | "wompi_form" | "success"
  const [step, setStep] = useState<"confirm" | "wompi_form" | "success">("confirm");
  
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [metodoPago, setMetodoPago] = useState<"wompi" | "efectivo">("wompi");

  // ESTADOS LOGÍSTICOS
  const [tipoEntrega, setTipoEntrega] = useState<"retiro" | "domicilio">("retiro");
  const costoEnvioBase = 5000; // Costo por defecto del domicilio en Pereira

  // ESTADO PARA LA EXPIRACIÓN REAL DE LA RESERVA
  const [fechaExpiracionReserva, setFechaExpiracionReserva] = useState<number | null>(null);
  const [reservaTimeLeft, setReservaTimeLeft] = useState<number>(3600);

  // Estado para los inputs de la tarjeta simulada
  const [tarjeta, setTarjeta] = useState({ numero: "", fecha: "", cvc: "", nombre: "" });

  const getSemaforo = (categoria: string) => {
    switch(categoria) {
      case 'Preparados': 
        return { color: 'bg-red-50 text-red-600 border-red-100', texto: 'Consumo hoy ⚠️' };
      case 'Panaderia': 
        return { color: 'bg-orange-50 text-orange-600 border-orange-100', texto: 'Consumir pronto ⏳' };
      case 'Frutas': 
        return { color: 'bg-emerald-50 text-emerald-600 border-emerald-100', texto: 'Fresco 🍎' };
      default: 
        return { color: 'bg-blue-50 text-blue-600 border-blue-100', texto: 'Larga duración ✅' };
    }
  };

  const fetchProductos = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/productos-todos`);
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

  // REGLA DE NEGOCIO: Si se selecciona pago en el local, se fuerza la entrega a "retiro"
  useEffect(() => {
    if (metodoPago === "efectivo") {
      setTipoEntrega("retiro");
    }
  }, [metodoPago]);

  // MANEJO DEL TEMPORIZADOR COMPORTAMIENTO DINÁMICO REPARADO (RF-06)
  useEffect(() => {
    if (!isModalOpen || step !== "success" || metodoPago !== "efectivo" || !fechaExpiracionReserva) return;

    const interval = setInterval(() => {
      const ahora = new Date().getTime();
      const diferenciaSegundos = Math.max(0, Math.floor((fechaExpiracionReserva - ahora) / 1000));

      setReservaTimeLeft(diferenciaSegundos);

      if (diferenciaSegundos <= 0) {
        clearInterval(interval);
        setIsModalOpen(false);
        alert(`🚨 Tu reserva para el producto "${selectedProduct?.nombre}" en el local expiró de forma automática. El stock ha sido liberado.`);
        fetchProductos(); // Sincroniza stock actualizado
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isModalOpen, step, metodoPago, fechaExpiracionReserva, selectedProduct]);

  // Formateador de segundos a MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const productosFinales = useMemo(() => {
    const todos = productosDB.map(p => ({
      id: `db-${p.id}`,
      idReal: p.id,
      nombre: p.nombre,
      tienda: p.nombre_local,
      precioOriginal: p.precio_original,
      precioOferta: p.precio_rescate,
      descuento: Math.round(((p.precio_original - p.precio_rescate) / p.precio_original) * 100),
      categoria: p.categoria || "Despensa",
      imagen: p.imagen_url || IMG_FALLBACK, 
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

  const calculosCheckout = useMemo(() => {
    if (!selectedProduct) return { subtotal: 0, descuento: 0, envio: 0, total: 0, esPioneroDescuento: false, esPioneroEnvio: false };
    
    const userStr = localStorage.getItem("usuario");
    const user = userStr ? JSON.parse(userStr) : null;

    const esPioneroDescuento = user?.regalo_descuento === 1 || user?.id === 1 || user?.id === "1";
    const esPioneroEnvio = user?.regalo_domicilio === 1 || user?.id === 1 || user?.id === "1";

    const subtotal = selectedProduct.precioOferta;
    const descuento = esPioneroDescuento ? Math.round(subtotal * 0.15) : 0;
    
    let envio = 0;
    if (tipoEntrega === "domicilio") {
      envio = esPioneroEnvio ? 0 : costoEnvioBase;
    }

    return {
      subtotal,
      descuento,
      envio,
      total: (subtotal - descuento) + envio,
      esPioneroDescuento,
      esPioneroEnvio
    };
  }, [selectedProduct, tipoEntrega]);

  const openRescate = (product: any) => {
    setSelectedProduct(product);
    setMetodoPago("wompi"); 
    setTipoEntrega("retiro"); 
    setStep("confirm");
    setFechaExpiracionReserva(null);
    setReservaTimeLeft(3600); 
    setTarjeta({ numero: "", fecha: "", cvc: "", nombre: "" });
    setIsModalOpen(true);
  };

  const procesarCheckout = async () => {
    if (!selectedProduct) return;
    
    const userStr = localStorage.getItem("usuario");
    const user = userStr ? JSON.parse(userStr) : null;
    
    if (!user || !user.id) {
      toast.error("Debes iniciar sesión para rescatar productos");
      return;
    }

    if (metodoPago === "wompi" && step === "confirm") {
      setStep("wompi_form");
      return;
    }

    setIsProcessing(true);

    if (metodoPago === "wompi" && step === "wompi_form") {
      const numeroLimpio = tarjeta.numero.replace(/\s/g, "");

      if (!tarjeta.numero || !tarjeta.fecha || !tarjeta.cvc) {
        alert("Por favor completa los datos de la tarjeta");
        setIsProcessing(false);
        return;
      }

      if (!numeroLimpio.startsWith("4242")) {
        setTimeout(() => {
          toast.error("Transacción declinada: Para pruebas usa la tarjeta Visa: 4242 4242 4242 4242");
          setIsProcessing(false);
        }, 1500);
        return;
      }

      // --- SIMULACIÓN PASARELA ONLINE ---
      setTimeout(async () => {
        try {
          const response = await fetch(`${API_BASE}/api/pedidos/crear`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              usuario_id: user.id,
              producto_id: selectedProduct.idReal,
              aliado_id: selectedProduct.aliado_id,
              nombre_usuario: user.nombre,
              nombre_producto: selectedProduct.nombre,
              precio_final: calculosCheckout.total, 
              estado: "pagado", 
              tipo_entrega: tipoEntrega,
              costo_domicilio: calculosCheckout.envio
            })
          });
          
          const data = await response.json();
          
          if (response.ok) {
            user.regalo_descuento = 0;
            user.regalo_domicilio = 0;
            localStorage.setItem("usuario", JSON.stringify(user));

            setSelectedProduct((prev: any) => ({ ...prev, codigoGenerated: data.codigo }));
            setStep("success"); 
            fetchProductos();   
          } else {
            toast.error(data.error || "Error al procesar el pago simulado");
          }
        } catch (err) {
          console.error("Error en API:", err);
          toast.error("Hubo un problema registrando tu compra.");
        } finally {
          setIsProcessing(false);
        }
      }, 2000);

    } else {
      // --- RESERVA DIRECTA EN EFECTIVO (RECOJO EXCLUSIVO) ---
      try {
        const response = await fetch(`${API_BASE}/api/pedidos/crear`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuario_id: user.id,
                producto_id: selectedProduct.idReal,
                aliado_id: selectedProduct.aliado_id,
                nombre_usuario: user.nombre,
                nombre_producto: selectedProduct.nombre,
                precio_final: calculosCheckout.total, 
                estado: "pendiente",
                tipo_entrega: "retiro",
                costo_domicilio: 0
            })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        user.regalo_descuento = 0;
        user.regalo_domicilio = 0;
        localStorage.setItem("usuario", JSON.stringify(user));

        const momentoExpiracion = new Date().getTime() + (60 * 60 * 1000);
        setFechaExpiracionReserva(momentoExpiracion);
        setReservaTimeLeft(3600);

        setSelectedProduct((prev: any) => ({ ...prev, codigoGenerated: data.codigo }));
        setStep("success");
        fetchProductos();
      } catch (error: any) {
        toast.error(error.message || "Error al crear la reserva");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <AppNavbar /> 
      
      {/* Auras de fondo para inyectar color sutil y dinámico */}
      <div className="absolute top-[15%] left-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-100/40 blur-[130px] -z-10 animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-orange-100/30 blur-[120px] -z-10 animate-pulse duration-[6000ms] delay-1000" />
      
      {/* Encabezado Principal */}
      <div className="w-full bg-gradient-to-b from-emerald-50/50 via-slate-50/30 to-transparent pt-32 pb-12 border-b border-slate-100/50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white shadow-[0_8px_20px_rgba(0,0,0,0.04)] rounded-2xl border border-slate-100">
                  <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Explorar Rescates</h1>
              </div>
              <p className="text-slate-400 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
                 <MapPin size={14} className="text-emerald-500 animate-bounce"/> Pereira, Colombia — <span className="text-slate-800 font-black">{productosFinales.length} disponibles</span>
              </p>
            </div>
            
            {/* Categorías Rediseñadas en Píldoras Premium */}
            <div className="flex bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/40 shadow-sm max-w-full overflow-x-auto whitespace-nowrap scrollbar-none">
              {["Todas", "Preparados", "Panaderia", "Frutas", "Despensa"].map((cat) => (
                  <button 
                   key={cat}
                   onClick={() => setSelectedCategory(cat)}
                   className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase transition-all duration-300 ${
                     selectedCategory === cat 
                       ? 'bg-white text-emerald-600 shadow-md scale-[1.02]' 
                       : 'text-slate-500 hover:text-slate-800'
                   }`}
                  >
                    {cat === "Panaderia" ? "Panadería" : cat}
                  </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Sidebar de Filtros (Premium Light Card) */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-[32px] shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-slate-100/80 space-y-8 sticky top-28">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <span className="font-black text-slate-800 text-xs uppercase tracking-wider">Filtros Avanzados</span>
                <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              </div>

              {/* Slider de Presupuesto */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Presupuesto max</Label>
                    <span className="text-sm font-black text-emerald-600">${maxPrice.toLocaleString()}</span>
                </div>
                <div className="py-2">
                  <Slider
                      value={[maxPrice]}
                      onValueChange={(([v]) => setMaxPrice(v))}
                      max={100000}
                      step={1000}
                      className="accent-emerald-600"
                  />
                </div>
              </div>

              {/* Selector de Orden */}
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Ordenar por</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full py-5 rounded-xl border border-slate-100 bg-slate-50/60 font-bold text-slate-700 text-xs focus:ring-2 focus:ring-emerald-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-xl">
                    <SelectItem value="discount">🔥 Mayor Descuento</SelectItem>
                    <SelectItem value="price_asc">💰 Menor Precio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </aside>

          {/* Listado Principal de Tarjetas */}
          <main className="flex-1 space-y-8">
            {/* Barra de Búsqueda */}
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
              <Input 
                placeholder="Buscar por comida, local o categoría..." 
                className="pl-13 py-7 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] bg-white font-bold text-slate-700 placeholder:text-slate-300 text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="animate-spin text-emerald-600 w-10 h-10" />
                <p className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Sincronizando con aliados...</p>
              </div>
            ) : productosFinales.length === 0 ? (
              <div className="text-center py-24 bg-white/60 backdrop-blur-md rounded-[32px] border-2 border-dashed border-slate-200/60 max-w-xl mx-auto">
                  <Package2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="font-black text-slate-400 uppercase text-xs">No hay rescates vigentes por ahora</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {productosFinales.map((prod) => {
                  const semaforo = getSemaforo(prod.categoria);
                  return (
                    <div key={prod.id} className="group bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-[0_10px_35px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(16,185,129,0.08)] transition-all duration-500 hover:-translate-y-1.5 flex flex-col">
                      
                      {/* Imagen con Badges */}
                      <div className="relative h-52 overflow-hidden bg-slate-50 shrink-0">
                        <img src={prod.imagen} alt={prod.nombre} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                          <Badge className="bg-white/95 backdrop-blur-sm text-slate-900 border-none font-black px-3.5 py-1.5 rounded-xl shadow-md text-xs">
                            -{prod.descuento}%
                          </Badge>
                          <Badge className={`${semaforo.color} backdrop-blur-sm border font-black px-3 py-1.5 rounded-xl shadow-md text-[9px] flex items-center gap-1 uppercase tracking-wide`}>
                            <Clock size={10} /> {semaforo.texto}
                          </Badge>
                        </div>
                      </div>

                      {/* Cuerpo de la Tarjeta */}
                      <div className="p-6 flex flex-col flex-1 justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <Store size={12} className="text-emerald-500" />
                            <button 
                              onClick={() => setLocation(`/aliado-publico/${prod.aliado_id}`)}
                              className="text-[10px] font-black text-slate-400 hover:text-emerald-600 hover:underline uppercase tracking-wider transition-colors text-left truncate max-w-full"
                            >
                              {prod.tienda}
                            </button>
                          </div>
                          <h3 className="text-lg font-black text-slate-800 mb-4 group-hover:text-emerald-600 transition-colors uppercase truncate">{prod.nombre}</h3>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-2">
                          <div>
                            <p className="text-slate-300 text-xs line-through font-bold">${prod.precioOriginal.toLocaleString()}</p>
                            <p className="text-xl font-black text-slate-900 tracking-tight">${prod.precioOferta.toLocaleString()}</p>
                          </div>
                          <Button 
                              onClick={() => openRescate(prod)} 
                              className="bg-slate-900 hover:bg-emerald-600 text-white rounded-xl font-black text-xs px-5 py-5 shadow-md hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 active:scale-95 uppercase tracking-wider"
                          >
                              RESCATAR
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modal Multifase Glassmorphism */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-[36px] border border-white/60 p-0 overflow-hidden bg-white/90 backdrop-blur-xl shadow-2xl max-h-[90dvh] flex flex-col">
          
          {/* FASE 1: CONFIRMACIÓN */}
          {step === "confirm" && (
            <div className="p-8 overflow-y-auto">
              <DialogHeader className="mb-5">
                <div className="w-11 h-11 bg-white shadow-md border border-slate-100 rounded-xl flex items-center justify-center mb-3">
                    <img src="/logo.png" className="w-6 h-6 object-contain" alt="AprovechApp"/>
                </div>
                <DialogTitle className="text-2xl font-black tracking-tight text-slate-900">Método de Rescate</DialogTitle>
                <DialogDescription className="font-bold text-slate-400 text-[10px] uppercase tracking-widest mt-0.5">
                    Selecciona cómo deseas asegurar tu plato
                </DialogDescription>
              </DialogHeader>

              {/* Selector 1: Pasarela vs Efectivo */}
              <Label className="text-[9px] uppercase font-black text-slate-400 tracking-widest block mb-2 ml-1">1. Medio de pago</Label>
              <div className="grid grid-cols-2 bg-slate-100/80 p-1 rounded-xl mb-4 border border-slate-200/30">
                <button
                  type="button"
                  onClick={() => setMetodoPago("wompi")}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all duration-200 ${metodoPago === "wompi" ? "bg-white text-emerald-600 shadow-sm scale-[1.02]" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <CreditCard size={13} /> Pagar Online
                </button>
                <button
                  type="button"
                  onClick={() => setMetodoPago("efectivo")}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all duration-200 ${metodoPago === "efectivo" ? "bg-white text-orange-600 shadow-sm scale-[1.02]" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <Banknote size={13} /> En el Local
                </button>
              </div>

              {/* Selector 2: Retiro vs Domicilio Logístico */}
              <Label className="text-[9px] uppercase font-black text-slate-400 tracking-widest block mb-2 ml-1">2. Método de entrega</Label>
              <div className="grid grid-cols-2 bg-slate-100/80 p-1 rounded-xl mb-5 border border-slate-200/30">
                <button
                  type="button"
                  onClick={() => setTipoEntrega("retiro")}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all duration-200 ${tipoEntrega === "retiro" ? "bg-white text-slate-800 shadow-sm scale-[1.02]" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <Store size={13} /> Recojo en local
                </button>
                <button
                  type="button"
                  disabled={metodoPago === "efectivo"}
                  onClick={() => setTipoEntrega("domicilio")}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all duration-200 ${
                    metodoPago === "efectivo" 
                      ? "opacity-30 cursor-not-allowed text-slate-300" 
                      : tipoEntrega === "domicilio" 
                      ? "bg-white text-blue-600 shadow-sm scale-[1.02]" 
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                  title={metodoPago === "efectivo" ? "Las reservas en el local requieren que recojas el producto tú mismo" : ""}
                >
                  <Truck size={13} /> Domicilio
                </button>
              </div>

              {/* DESGLOSE MATEMÁTICO */}
              <div className="bg-slate-50/80 border border-slate-100 p-5 rounded-2xl mb-5 space-y-3 shadow-inner">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Precio Rescate</span>
                    <span className="font-black text-slate-800">${calculosCheckout.subtotal.toLocaleString()}</span>
                </div>

                {calculosCheckout.esPioneroDescuento && (
                  <div className="flex justify-between items-center text-xs text-purple-600 bg-purple-50 px-2.5 py-1.5 rounded-lg">
                      <span className="font-black uppercase flex items-center gap-1 text-[9px] tracking-wide"><Sparkles size={11}/> Beneficio Pionero (15%)</span>
                      <span className="font-black">-${calculosCheckout.descuento.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Costo Domicilio</span>
                    <span className="font-black text-slate-800">
                      {tipoEntrega === "retiro" ? "$0" : calculosCheckout.esPioneroEnvio ? "Gratis 🎉" : `$${costoEnvioBase.toLocaleString()}`}
                    </span>
                </div>
                
                <div className="pt-3 border-t border-slate-200/60 flex justify-between items-center">
                    <span className="text-slate-400 font-black uppercase text-[10px]">Total a Pagar</span>
                    <span className="text-xl font-black text-emerald-600">${calculosCheckout.total.toLocaleString()}</span>
                </div>
              </div>

              <Button onClick={procesarCheckout} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-xl font-black text-xs shadow-md uppercase tracking-wider transition-all duration-300">
                  {metodoPago === "wompi" ? "IR A PAGAR ONLINE 💳" : "RESERVAR Y PAGAR EN CAJA ⏳"}
              </Button>
            </div>
          )}

          {/* FASE 2: FORMULARIO WOMPI */}
          {step === "wompi_form" && (
            <div className="p-8 overflow-y-auto">
              <DialogHeader className="mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 bg-[#4A154B] text-white px-3 py-1 rounded-lg font-black text-[10px]">
                    <span className="tracking-wide lowercase font-bold">wompi</span>
                    <span className="text-[7px] bg-amber-400 text-slate-900 px-1 rounded font-black uppercase">Sandbox</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <Lock size={12} className="text-emerald-500" /> Seguro
                  </div>
                </div>
                <DialogTitle className="text-lg font-black text-slate-900 mt-4">Tarjeta de Crédito / Débito</DialogTitle>
                <DialogDescription className="text-[9px] text-slate-400 uppercase font-black tracking-wider">
                  Pagarás ${calculosCheckout.total.toLocaleString()} COP a AprovechApp
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3.5 my-5">
                <div className="space-y-1">
                  <Label className="text-[9px] uppercase font-black text-slate-400 ml-0.5">Número de Tarjeta</Label>
                  <Input 
                    type="text" 
                    placeholder="4242 4242 4242 4242" 
                    maxLength={19}
                    value={tarjeta.numero}
                    onChange={(e) => setTarjeta({...tarjeta, numero: e.target.value})}
                    className="rounded-xl py-4 border-slate-200 font-medium font-mono text-slate-700 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[9px] uppercase font-black text-slate-400 ml-0.5">Vencimiento</Label>
                    <Input 
                      type="text" 
                      placeholder="MM/AA" 
                      maxLength={5}
                      value={tarjeta.fecha}
                      onChange={(e) => setTarjeta({...tarjeta, fecha: e.target.value})}
                      className="rounded-xl py-4 border-slate-200 font-medium font-mono text-slate-700 text-center text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[9px] uppercase font-black text-slate-400 ml-0.5">CVC</Label>
                    <Input 
                      type="password" 
                      placeholder="123" 
                      maxLength={3}
                      value={tarjeta.cvc}
                      onChange={(e) => setTarjeta({...tarjeta, cvc: e.target.value})}
                      className="rounded-xl py-4 border-slate-200 font-medium font-mono text-slate-700 text-center text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[9px] uppercase font-black text-slate-400 ml-0.5">Nombre en la tarjeta</Label>
                  <Input 
                    type="text" 
                    placeholder="EJ. JUAN PEREZ" 
                    value={tarjeta.nombre}
                    onChange={(e) => setTarjeta({...tarjeta, nombre: e.target.value.toUpperCase()})}
                    className="rounded-xl py-4 border-slate-200 font-bold text-slate-700 text-xs uppercase tracking-wide focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setStep("confirm")} 
                  disabled={isProcessing}
                  className="rounded-xl py-5 px-4 font-black text-xs text-slate-400 uppercase tracking-wider hover:bg-slate-50 border-slate-200"
                >
                  Atrás
                </Button>
                <Button 
                  onClick={procesarCheckout} 
                  disabled={isProcessing}
                  className="flex-1 bg-[#4A154B] hover:bg-[#350f36] text-white rounded-xl py-5 font-black text-xs tracking-widest uppercase shadow-md"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2 justify-center">
                      <Loader2 className="animate-spin w-4 h-4" /> Procesando...
                    </div>
                  ) : `PAGAR $${calculosCheckout.total.toLocaleString()}`}
                </Button>
              </div>
            </div>
          )}

          {/* FASE 3: ÉXITO TOTAL Y QR */}
          {step === "success" && (
            <div className="p-10 text-center overflow-y-auto">
              <div className="w-20 h-20 bg-emerald-50 rounded-[28px] flex items-center justify-center mx-auto mb-6 border border-emerald-100 shadow-inner">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <h2 className="text-3xl font-black mb-2 tracking-tight text-slate-900">
                {metodoPago === "efectivo" ? "¡RESERVADO!" : "¡COMPRADO!"}
              </h2>
              
              <p className="text-slate-400 mb-6 text-xs font-bold uppercase tracking-widest px-2 leading-relaxed">
                {metodoPago === 'efectivo' 
                  ? `Tienes el tiempo límite indicado abajo para asistir a ${selectedProduct?.tienda} y pagar en caja.`
                  : tipoEntrega === 'domicilio' 
                  ? `Tu pedido va en camino a tu dirección en Pereira.` 
                  : `Boleto pagado. Visita a ${selectedProduct?.tienda} para reclamar.`
                }
              </p>

              {/* CONTADOR EN TIEMPO REAL */}
              {metodoPago === "efectivo" && (
                <div className="bg-amber-50/80 border border-amber-200/60 rounded-2xl p-4 mb-6 flex flex-col items-center gap-1 animate-pulse">
                  <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle size={12} className="text-amber-600"/> Tiempo de recogida restante:
                  </span>
                  <span className="text-xl font-mono font-black text-amber-700">
                    {formatTime(reservaTimeLeft)}
                  </span>
                </div>
              )}
              
              {/* Tarjeta del Boleto QR Unificado */}
              <div className="bg-slate-900 p-8 rounded-[40px] mb-6 flex flex-col items-center shadow-xl relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-1.5 ${metodoPago === 'efectivo' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                
                <QrCode className="w-32 h-32 text-white mb-6 opacity-90" />
                
                <p className={`font-mono font-black tracking-[0.3em] text-3xl uppercase ${metodoPago === 'efectivo' ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {selectedProduct?.codigoGenerated}
                </p>
              </div>

              <Button 
                onClick={() => setIsModalOpen(false)} 
                className="w-full bg-slate-100 text-slate-800 py-6 rounded-2xl font-black hover:bg-slate-200 transition-all uppercase text-xs tracking-widest shadow-sm"
              >
                Volver al catálogo
              </Button>
            </div>
          )}

        </DialogContent>
      </Dialog>
    </div>
  );
}