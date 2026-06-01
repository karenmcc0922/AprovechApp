import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import AppNavbar from "../components/AppNavbar";
import { toast } from "sonner";
import { API_BASE } from "../lib/api";
import MapaCatalogo, { type TiendaMapa } from "../components/MapaCatalogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  CreditCard,
  Banknote,
  Lock,
  Truck,
  Store,
  Sparkles,
  AlertTriangle,
  Heart,
  Map,
  BadgeCheck,
  ShoppingBag
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
  const [userCoords, setUserCoords] = useState<{lat: number; lng: number} | null>(null);
  const [aliadoCoords, setAliadoCoords] = useState<Record<string, {lat: number; lng: number}>>({});
  const [loadingProximidad, setLoadingProximidad] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState<"confirm" | "wompi_form" | "success">("confirm");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [metodoPago, setMetodoPago] = useState<"wompi" | "efectivo">("wompi");
  const [tipoEntrega, setTipoEntrega] = useState<"retiro" | "domicilio">("retiro");
  const costoEnvioBase = 5000;

  const [fechaExpiracionReserva, setFechaExpiracionReserva] = useState<number | null>(null);
  const [reservaTimeLeft, setReservaTimeLeft] = useState<number>(3600);
  const [tarjeta, setTarjeta] = useState({ numero: "", fecha: "", cvc: "", nombre: "" });

  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [mapTiendas, setMapTiendas] = useState<TiendaMapa[]>([]);
  const [mapLoading, setMapLoading] = useState(false);

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

  useEffect(() => {
    if (metodoPago === "efectivo") {
      setTipoEntrega("retiro");
    }
  }, [metodoPago]);

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
        fetchProductos();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isModalOpen, step, metodoPago, fechaExpiracionReserva, selectedProduct]);

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
      stock: p.stock ?? 1,
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
      if (sortBy === "proximity" && userCoords) {
        const ca = aliadoCoords[a.direccion];
        const cb = aliadoCoords[b.direccion];
        if (ca && cb) return haversine(userCoords.lat, userCoords.lng, ca.lat, ca.lng) - haversine(userCoords.lat, userCoords.lng, cb.lat, cb.lng);
        if (ca) return -1;
        if (cb) return 1;
      }
      return 0;
    });
  }, [productosDB, search, maxPrice, sortBy, selectedCategory, userCoords, aliadoCoords]);

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

  const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  const activarProximidad = async () => {
    if (!navigator.geolocation) { return; }
    setLoadingProximidad(true);
    setSortBy("proximity");
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const uCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setUserCoords(uCoords);
      const direccionesUnicas = [...new Set(productosDB.map((p: any) => p.direccion).filter(Boolean))];
      const coords: Record<string, {lat: number; lng: number}> = {};
      for (const dir of direccionesUnicas) {
        try {
          const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(dir + ", Pereira, Colombia")}`;
          const res = await fetch(url, { headers: { "User-Agent": "AprovechApp/1.0" } });
          const data = await res.json();
          if (data[0]) coords[dir] = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
          await new Promise(r => setTimeout(r, 1100));
        } catch { /* silently skip */ }
      }
      setAliadoCoords(coords);
      setLoadingProximidad(false);
    }, () => { setLoadingProximidad(false); setSortBy("discount"); });
  };

  const abrirMapa = async () => {
    setIsMapModalOpen(true);
    setMapTiendas([]);

    // Agrupar productos por aliado_id (sin genéricos explícitos por restricción de tsconfig)
    const idsSeen: number[] = [];
    const stores: { aliado_id: number; nombre: string; direccion: string; count: number }[] = [];
    for (const p of productosDB) {
      const idx = idsSeen.indexOf(p.aliado_id);
      if (idx === -1) {
        idsSeen.push(p.aliado_id);
        stores.push({ aliado_id: p.aliado_id, nombre: p.nombre_local, direccion: p.direccion || "", count: 1 });
      } else {
        stores[idx].count++;
      }
    }

    const workingCoords: Record<string, { lat: number; lng: number }> = { ...aliadoCoords };
    const sinCoords = stores.filter(s => s.direccion && !workingCoords[s.direccion]);

    if (sinCoords.length > 0) {
      setMapLoading(true);
      for (let i = 0; i < sinCoords.length; i++) {
        const store = sinCoords[i];
        try {
          const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(store.direccion + ", Pereira, Colombia")}`;
          const res = await fetch(url, { headers: { "User-Agent": "AprovechApp/1.0" } });
          const data = await res.json();
          if (data[0]) workingCoords[store.direccion] = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
          if (i < sinCoords.length - 1) await new Promise(r => setTimeout(r, 1100));
        } catch { /* skip */ }
      }
      setAliadoCoords(workingCoords);
      setMapLoading(false);
    }

    setMapTiendas(
      stores
        .filter(s => s.direccion && workingCoords[s.direccion])
        .map(s => ({
          aliado_id: s.aliado_id,
          nombre: s.nombre,
          direccion: s.direccion,
          lat: workingCoords[s.direccion].lat,
          lng: workingCoords[s.direccion].lng,
          productos: s.count,
        }))
    );
  };

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

  const CATEGORIES = [
    { key: "Todas",      icon: "⊞",  label: "Todas" },
    { key: "Preparados", icon: "🍲", label: "Preparados" },
    { key: "Panaderia",  icon: "🥖", label: "Panadería" },
    { key: "Frutas",     icon: "🍎", label: "Frutas" },
    { key: "Despensa",   icon: "🛒", label: "Despensa" },
  ];

  const getFreshnessLabel = (categoria: string) => {
    if (categoria === "Preparados") return "Consumo hoy";
    if (categoria === "Panaderia")  return "Consumir pronto";
    if (categoria === "Frutas")     return "Fresco";
    return "Larga duración";
  };

  return (
    <div className="min-h-screen bg-white">
      <AppNavbar />

      {/* ── HERO ── */}
      <div className="pt-20 pb-0 bg-white">
        <div className="max-w-5xl mx-auto px-5">
          {/* Title row */}
          <div className="flex items-start justify-between pt-6 pb-4">
            <div>
              <h1 className="text-[2rem] font-black text-slate-900 leading-tight">
                Explorar <span className="text-green-500">rescates</span>{" "}
                <span className="text-green-500">🌿</span>
              </h1>
              <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                <MapPin size={13} className="text-green-500" />
                Pereira, Colombia —{" "}
                <span className="font-semibold text-slate-700">{productosFinales.length} disponibles</span>
              </p>
            </div>
            {/* Illustration placeholder */}
            <div className="hidden sm:flex flex-col items-end gap-2 relative">
              <div className="text-6xl select-none">🛒</div>
              <span className="bg-green-500 text-white text-[11px] font-semibold px-3 py-1.5 rounded-2xl shadow-sm">
                Menos desperdicio,<br />más ahorro 💚
              </span>
            </div>
          </div>

          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.key
                    ? "bg-green-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span className="text-base leading-none">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── FILTERS ── */}
      <div className="max-w-5xl mx-auto px-5 mt-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          {/* Filter header */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              Filtros avanzados ⚡
            </span>
            <SlidersHorizontal size={15} className="text-slate-400" />
          </div>

          {/* Budget + Sort */}
          <div className="grid grid-cols-2 gap-4 mb-1">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  Presupuesto máx <span className="text-slate-400">ⓘ</span>
                </span>
                <span className="text-xs font-bold text-slate-800">${maxPrice.toLocaleString()}</span>
              </div>
              <Slider
                value={[maxPrice]}
                onValueChange={([v]) => setMaxPrice(v)}
                max={100000}
                step={1000}
                className="[&_[data-slot=slider-track]]:bg-slate-200 [&_[data-slot=slider-range]]:bg-green-500 [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:border-2 [&_[data-slot=slider-thumb]]:border-green-500"
              />
            </div>

            <div>
              <Label className="text-xs text-slate-500 font-medium mb-1 block">Ordenar por</Label>
              <Select value={sortBy} onValueChange={(v) => { if (v === "proximity") activarProximidad(); else setSortBy(v); }}>
                <SelectTrigger className="h-9 rounded-xl border-slate-200 bg-white text-sm text-slate-700 font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-lg">
                  <SelectItem value="discount">🔥 Mayor descuento</SelectItem>
                  <SelectItem value="price_asc">💰 Menor precio</SelectItem>
                  <SelectItem value="proximity">📍 Más cercano</SelectItem>
                </SelectContent>
              </Select>
              {loadingProximidad && (
                <p className="text-[10px] text-blue-500 flex items-center gap-1 mt-1">
                  <Loader2 size={9} className="animate-spin" /> Calculando...
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Search + Mapa */}
        <div className="flex gap-2 mt-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar por comida, local o categoría..."
              className="pl-10 h-10 rounded-xl border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:border-green-500 focus:ring-1 focus:ring-green-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            onClick={abrirMapa}
            className="h-10 rounded-xl border-green-500 text-green-600 font-semibold text-sm gap-1.5 px-4 hover:bg-green-50"
          >
            <Map size={14} /> Ver mapa
          </Button>
        </div>

        {/* ── PRODUCT GRID ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl overflow-hidden animate-pulse">
                <div className="bg-slate-100 h-44 w-full" />
                <div className="p-3 space-y-2">
                  <div className="bg-slate-100 h-2.5 rounded w-1/3" />
                  <div className="bg-slate-100 h-4 rounded w-3/4" />
                  <div className="bg-slate-100 h-3 rounded w-1/2" />
                  <div className="bg-slate-100 h-9 rounded-xl w-full mt-1" />
                </div>
              </div>
            ))}
          </div>
        ) : productosFinales.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-slate-200 rounded-2xl">
            <Package2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-400 text-sm font-medium">No hay rescates vigentes por ahora</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {productosFinales.map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-md transition-shadow flex flex-col"
              >
                {/* Image section */}
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  <img
                    src={prod.imagen}
                    alt={prod.nombre}
                    className="w-full h-full object-cover"
                  />
                  {/* Discount + freshness badges */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                    <span className="bg-orange-400 text-white text-xs font-black px-2 py-0.5 rounded-lg leading-5">
                      -{prod.descuento}%
                    </span>
                    <span className="bg-white/90 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 leading-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                      {getFreshnessLabel(prod.categoria)}
                    </span>
                  </div>
                  {/* Heart */}
                  <button className="absolute top-2.5 right-2.5 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform">
                    <Heart size={13} className="text-slate-400" />
                  </button>
                  {prod.stock <= 2 && (
                    <span className="absolute bottom-2 left-2.5 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                      ¡Últimos {prod.stock}!
                    </span>
                  )}
                </div>

                {/* Card body */}
                <div className="p-3 flex flex-col flex-1">
                  {/* Store name + Maps link */}
                  <div className="flex items-center gap-1.5 mb-1">
                    <button
                      onClick={() => setLocation(`/aliado-publico/${prod.aliado_id}`)}
                      className="flex items-center gap-1 w-fit"
                    >
                      <span className="text-xs text-slate-500 font-medium hover:text-green-600 transition-colors">
                        {prod.tienda}
                      </span>
                      <BadgeCheck size={12} className="text-blue-500 shrink-0" />
                    </button>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(prod.direccion + ", Pereira, Colombia")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Ver en Google Maps"
                      className="text-slate-300 hover:text-green-500 transition-colors"
                    >
                      <MapPin size={11} />
                    </a>
                  </div>

                  {/* Product name */}
                  <h3 className="text-sm font-bold text-slate-800 leading-snug line-clamp-2 mb-2 flex-1">
                    {prod.nombre}
                  </h3>

                  {/* Prices */}
                  <div className="flex items-baseline gap-2 mb-2.5">
                    <span className="text-slate-400 text-xs line-through font-medium">
                      ${prod.precioOriginal.toLocaleString()}
                    </span>
                    <span className="text-base font-black text-slate-900">
                      ${prod.precioOferta.toLocaleString()}
                    </span>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => openRescate(prod)}
                    className="w-full bg-green-500 hover:bg-green-600 active:scale-95 text-white rounded-xl py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag size={14} /> Rescatar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── BOTTOM BANNER ── */}
        <div className="mt-10 mb-6 bg-green-50 rounded-3xl px-6 py-5 flex items-center gap-4">
          <div className="text-4xl shrink-0">🛍️</div>
          <div className="flex-1">
            <p className="text-base font-black text-slate-800">
              Pequeñas decisiones, <span className="text-green-600">grandes cambios</span> 💚
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="text-2xl">🐷</span>
              <span className="text-[11px] font-semibold text-slate-600">Ahorra<br/>dinero</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="text-2xl">🌍</span>
              <span className="text-[11px] font-semibold text-slate-600">Ayuda al<br/>planeta</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="text-2xl">🤝</span>
              <span className="text-[11px] font-semibold text-slate-600">Apoya tu<br/>comunidad</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Mapa de Tiendas */}
      <Dialog open={isMapModalOpen} onOpenChange={setIsMapModalOpen}>
        <DialogContent className="sm:max-w-[680px] rounded-2xl p-0 flex flex-col" style={{ maxHeight: "85dvh", overflow: "hidden" }}>
          {/* Header fijo */}
          <DialogHeader className="px-5 pt-5 pb-4 border-b border-slate-100 shrink-0">
            <DialogTitle className="text-base font-black text-slate-900 flex items-center gap-2">
              <Map size={16} className="text-green-600" /> Tiendas disponibles en Pereira
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-0.5">
              Haz clic en un marcador para ver sus ofertas
            </DialogDescription>
          </DialogHeader>

          {mapLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 shrink-0">
              <Loader2 className="animate-spin text-green-600 w-8 h-8" />
              <p className="text-sm text-slate-500 font-medium">Calculando ubicaciones...</p>
            </div>
          ) : mapTiendas.length > 0 ? (
            <>
              {/* Contenedor del mapa — altura fija con overflow hidden */}
              <div style={{ height: 340, minHeight: 340, overflow: "hidden", position: "relative", flexShrink: 0 }}>
                <MapaCatalogo
                  tiendas={mapTiendas}
                  onVerVitrina={(id) => { setIsMapModalOpen(false); setLocation(`/aliado-publico/${id}`); }}
                />
              </div>

              {/* Lista de tiendas — scrollable */}
              <div className="border-t border-slate-100 p-4 overflow-y-auto" style={{ flexShrink: 1 }}>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  O selecciona un comercio directamente:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {mapTiendas.map((tienda) => (
                    <button
                      key={tienda.aliado_id}
                      onClick={() => { setIsMapModalOpen(false); setLocation(`/aliado-publico/${tienda.aliado_id}`); }}
                      className="text-left bg-slate-50 hover:bg-green-50 rounded-xl p-3 transition-colors border border-transparent hover:border-green-200"
                    >
                      <p className="text-xs font-bold text-slate-700 truncate">{tienda.nombre}</p>
                      <p className="text-[10px] text-green-600 font-semibold mt-0.5">{tienda.productos} productos</p>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-14 gap-2 text-center px-6 shrink-0">
              <MapPin className="w-8 h-8 text-slate-300" />
              <p className="text-sm font-bold text-slate-500">No se pudieron cargar las ubicaciones</p>
              <p className="text-xs text-slate-400">Verifica tu conexión e intenta de nuevo</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, "");
                        if (val.length > 2) val = val.slice(0, 2) + "/" + val.slice(2, 4);
                        setTarjeta({...tarjeta, fecha: val});
                      }}
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