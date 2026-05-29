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
        return { color: 'bg-red-100 text-red-700 border-red-200', texto: 'Consumo hoy ⚠️' };
      case 'Panaderia': 
        return { color: 'bg-orange-100 text-orange-700 border-orange-200', texto: 'Consumir pronto ⏳' };
      case 'Frutas': 
        return { color: 'bg-green-100 text-green-700 border-green-200', texto: 'Fresco 🍎' };
      default: 
        return { color: 'bg-blue-100 text-blue-700 border-blue-200', texto: 'Larga duración ✅' };
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

        // PARSEO DE FECHA SINCRONIZADA CON EL BACKEND PARA EL CRONÓMETRO DE EFECTIVO
        // Forzamos una marca de expiración de 1 hora relativa a este instante exacto para evitar desfases UTC
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
    <div className="min-h-screen bg-[#F8FAFC]">
      <AppNavbar /> 
      
      <div className="container mx-auto px-4 py-8 pt-32 max-w-7xl">
        {/* Header */}
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
             <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap">
                {["Todas", "Preparados", "Panaderia", "Frutas", "Despensa"].map((cat) => (
                    <button 
                     key={cat}
                     onClick={() => setSelectedCategory(cat)}
                     className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${selectedCategory === cat ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                      {cat === "Panaderia" ? "Panadería" : cat}
                    </button>
                ))}
             </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar de Filtros */}
          <aside className="w-full lg:w-72 space-y-8">
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-10">
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-900 text-sm uppercase tracking-tighter">Filtros Avanzados</span>
                <SlidersHorizontal className="w-4 h-4 text-slate-300" />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Presupuesto</Label>
                    <span className="text-sm font-black text-green-600">${maxPrice.toLocaleString()}</span>
                </div>
                <div className="py-3">
                  <Slider
                      value={[maxPrice]}
                      onValueChange={(([v]) => setMaxPrice(v))}
                      max={100000}
                      step={1000}
                  />
                </div>
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
          </aside>

          {/* Listado Principal de Tarjetas */}
          <main className="flex-1 space-y-8">
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <Input 
                placeholder="Buscar por comida, local o categoría..." 
                className="pl-14 py-8 rounded-[32px] border-none shadow-sm bg-white font-bold text-slate-700 placeholder:text-slate-300" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="animate-spin text-green-600 w-12 h-12" />
                <p className="font-black text-slate-300 uppercase text-xs tracking-widest">Sincronizando con aliados...</p>
              </div>
            ) : productosFinales.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-[40px] border-2 border-dashed border-slate-100">
                  <Package2 className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="font-black text-slate-400 uppercase text-xs">No hay rescates vigentes por ahora</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {productosFinales.map((prod) => {
                  const semaforo = getSemaforo(prod.categoria);
                  return (
                    <div key={prod.id} className="group bg-white rounded-[44px] overflow-hidden border border-white shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                      <div className="relative h-56 overflow-hidden">
                        <img src={prod.imagen} alt={prod.nombre} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute top-5 left-5 flex flex-col gap-2">
                          <Badge className="bg-white text-slate-900 border-none font-black px-4 py-2 rounded-full shadow-xl text-sm">
                            -{prod.descuento}%
                          </Badge>
                          <Badge className={`${semaforo.color} border font-black px-4 py-2 rounded-full shadow-xl text-[10px] flex items-center gap-1`}>
                            <Clock size={10} /> {semaforo.texto}
                          </Badge>
                        </div>
                      </div>

                      <div className="p-8">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <button 
                            onClick={() => setLocation(`/aliado-publico/${prod.aliado_id}`)}
                            className="text-[10px] font-black text-slate-400 hover:text-green-600 hover:underline uppercase tracking-widest transition-colors text-left"
                          >
                            {prod.tienda}
                          </button>
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
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modal Multifase */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-[50px] border-none p-0 overflow-hidden bg-white shadow-2xl max-h-[90dvh] flex flex-col">
          
          {/* FASE 1: CONFIRMACIÓN Y COMPONENTES DINÁMICOS */}
          {step === "confirm" && (
            <div className="p-10 overflow-y-auto">
              <DialogHeader className="mb-6">
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-4">
                    <img src="/logo.png" className="w-6 h-6 object-contain" alt="AprovechApp"/>
                </div>
                <DialogTitle className="text-3xl font-black tracking-tight text-slate-900">Método de Rescate</DialogTitle>
                <DialogDescription className="font-bold text-slate-400 text-xs uppercase tracking-widest">
                    Selecciona cómo deseas asegurar tu plato
                </DialogDescription>
              </DialogHeader>

              {/* Selector 1: Pasarela vs Efectivo */}
              <Label className="text-[9px] uppercase font-black text-slate-400 tracking-widest block mb-2">1. Medio de pago</Label>
              <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-2xl mb-4">
                <button
                  type="button"
                  onClick={() => setMetodoPago("wompi")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${metodoPago === "wompi" ? "bg-white text-slate-900 shadow-md scale-102" : "text-slate-400"}`}
                >
                  <CreditCard size={14} /> Pagar Online
                </button>
                <button
                  type="button"
                  onClick={() => setMetodoPago("efectivo")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${metodoPago === "efectivo" ? "bg-white text-slate-900 shadow-md scale-102" : "text-slate-400"}`}
                >
                  <Banknote size={14} /> En el Local
                </button>
              </div>

              {/* Selector 2: Retiro vs Domicilio Logístico */}
              <Label className="text-[9px] uppercase font-black text-slate-400 tracking-widest block mb-2">2. Método de entrega</Label>
              <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-2xl mb-6">
                <button
                  type="button"
                  onClick={() => setTipoEntrega("retiro")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${tipoEntrega === "retiro" ? "bg-white text-slate-900 shadow-md scale-102" : "text-slate-400"}`}
                >
                  <Store size={14} /> Recojo en local
                </button>
                <button
                  type="button"
                  disabled={metodoPago === "efectivo"}
                  onClick={() => setTipoEntrega("domicilio")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${
                    metodoPago === "efectivo" 
                      ? "opacity-40 cursor-not-allowed text-slate-300" 
                      : tipoEntrega === "domicilio" 
                      ? "bg-white text-slate-900 shadow-md scale-102" 
                      : "text-slate-400"
                  }`}
                  title={metodoPago === "efectivo" ? "Las reservas en el local requieren que recojas el producto tú mismo" : ""}
                >
                  <Truck size={14} /> Domicilio
                </button>
              </div>

              {/* DESGLOSE MATEMÁTICO */}
              <div className="bg-slate-50 p-6 rounded-[28px] mb-6 space-y-3 border border-slate-100">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-black uppercase">Precio Rescate</span>
                    <span className="font-black text-slate-900">${calculosCheckout.subtotal.toLocaleString()}</span>
                </div>

                {calculosCheckout.esPioneroDescuento && (
                  <div className="flex justify-between items-center text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-xl">
                      <span className="font-black uppercase flex items-center gap-1 text-[10px]"><Sparkles size={12}/> Beneficio Pionero (15%)</span>
                      <span className="font-black">-${calculosCheckout.descuento.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-black uppercase">Costo Domicilio</span>
                    <span className="font-black text-slate-900">
                      {tipoEntrega === "retiro" ? "$0" : calculosCheckout.esPioneroEnvio ? "Gratis 🎉" : `$${costoEnvioBase.toLocaleString()}`}
                    </span>
                </div>
                
                <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                    <span className="text-slate-400 font-black uppercase text-[10px]">Total a Pagar</span>
                    <span className="text-2xl font-black text-green-600">${calculosCheckout.total.toLocaleString()}</span>
                </div>
              </div>

              <Button onClick={procesarCheckout} className="w-full bg-green-600 py-8 rounded-3xl font-black text-md shadow-xl hover:bg-green-700 transition-all uppercase tracking-wider text-white">
                  {metodoPago === "wompi" ? "IR A PAGAR 💳" : "SEPARAR Y RECOGER ⏳"}
              </Button>
            </div>
          )}

          {/* FASE 2: FORMULARIO WOMPI */}
          {step === "wompi_form" && (
            <div className="p-10 overflow-y-auto">
              <DialogHeader className="mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-[#4A154B] text-white px-3 py-1.5 rounded-xl font-black text-[11px]">
                    <span className="tracking-wide">wompi</span>
                    <span className="text-[8px] bg-amber-400 text-slate-900 px-1 rounded font-bold">SANDBOX</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
                    <Lock size={12} className="text-green-500" /> Seguro
                  </div>
                </div>
                <DialogTitle className="text-xl font-black text-slate-900 mt-4">Tarjeta de Crédito / Débito</DialogTitle>
                <DialogDescription className="text-[10px] text-slate-400 uppercase font-black tracking-wider">
                  Pagarás ${calculosCheckout.total.toLocaleString()} COP a AprovechApp
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 my-6">
                <div className="space-y-1.5">
                  <Label className="text-[9px] uppercase font-black text-slate-400">Número de Tarjeta</Label>
                  <Input 
                    type="text" 
                    placeholder="4242 4242 4242 4242" 
                    maxLength={19}
                    value={tarjeta.numero}
                    onChange={(e) => setTarjeta({...tarjeta, numero: e.target.value})}
                    className="rounded-xl py-5 border-slate-200 font-medium font-mono text-slate-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[9px] uppercase font-black text-slate-400">Vencimiento</Label>
                    <Input 
                      type="text" 
                      placeholder="MM/AA" 
                      maxLength={5}
                      value={tarjeta.fecha}
                      onChange={(e) => setTarjeta({...tarjeta, fecha: e.target.value})}
                      className="rounded-xl py-5 border-slate-200 font-medium font-mono text-slate-700 text-center"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[9px] uppercase font-black text-slate-400">CVC</Label>
                    <Input 
                      type="password" 
                      placeholder="123" 
                      maxLength={3}
                      value={tarjeta.cvc}
                      onChange={(e) => setTarjeta({...tarjeta, cvc: e.target.value})}
                      className="rounded-xl py-5 border-slate-200 font-medium font-mono text-slate-700 text-center"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[9px] uppercase font-black text-slate-400">Nombre en la tarjeta</Label>
                  <Input 
                    type="text" 
                    placeholder="EJ. JUAN PEREZ" 
                    value={tarjeta.nombre}
                    onChange={(e) => setTarjeta({...tarjeta, nombre: e.target.value.toUpperCase()})}
                    className="rounded-xl py-5 border-slate-200 font-bold text-slate-700 text-xs uppercase"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setStep("confirm")} 
                  disabled={isProcessing}
                  className="rounded-2xl py-6 px-4 font-black text-xs text-slate-400 uppercase tracking-wider"
                >
                  Atrás
                </Button>
                <Button 
                  onClick={procesarCheckout} 
                  disabled={isProcessing}
                  className="flex-1 bg-[#4A154B] hover:bg-[#350f36] text-white rounded-2xl py-6 font-black text-xs tracking-widest uppercase shadow-lg"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
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
              <div className="w-24 h-24 bg-green-50 rounded-[35px] flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-4xl font-black mb-2 tracking-tighter text-slate-900">
                {metodoPago === "efectivo" ? "¡RESERVADO!" : "¡COMPRADO!"}
              </h2>
              
              <p className="text-slate-400 mb-6 text-xs font-black uppercase tracking-widest px-4 leading-relaxed">
                  {metodoPago === 'efectivo' 
                    ? `Tienes el tiempo límite indicado abajo para asistir a ${selectedProduct?.tienda} y pagar en caja.`
                    : tipoEntrega === 'domicilio' 
                    ? `Tu pedido va en camino a tu dirección en Pereira.` 
                    : `Boleto pagado. Visita a ${selectedProduct?.tienda} para reclamar.`
                  }
              </p>

              {/* CONTADOR CORREGIDO EN TIEMPO REAL */}
              {metodoPago === "efectivo" && (
                <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4 mb-6 flex flex-col items-center gap-1 animate-pulse">
                  <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle size={12} className="text-amber-600"/> Tiempo de recogida restante:
                  </span>
                  <span className="text-2xl font-mono font-black text-amber-700">
                    {formatTime(reservaTimeLeft)}
                  </span>
                </div>
              )}
              
              <div className="bg-slate-900 p-10 rounded-[45px] mb-10 flex flex-col items-center shadow-2xl relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-2 ${metodoPago === 'efectivo' ? 'bg-amber-500' : 'bg-green-500'}`} />
                <QrCode className="w-32 h-32 text-white mb-6 opacity-90" />
                <p className={`font-mono font-black tracking-[0.3em] text-3xl uppercase ${metodoPago === 'efectivo' ? 'text-amber-400' : 'text-green-400'}`}>
                    {selectedProduct?.codigoGenerated}
                </p>
              </div>

              <Button onClick={() => setIsModalOpen(false)} className="w-full bg-slate-100 text-slate-900 py-8 rounded-3xl font-black hover:bg-slate-200 transition-all uppercase text-xs tracking-widest">
                  Volver al catálogo
              </Button>
            </div>
          )}

        </DialogContent>
      </Dialog>
    </div>
  );
}