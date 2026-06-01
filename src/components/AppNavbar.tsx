import { useState, useEffect, useRef } from "react";
import { Link, useLocation as useWouterLocation } from "wouter";
import { User, LogOut, Bike, Bell, Truck, Package, CheckCircle2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { API_BASE } from "../lib/api";

interface Notif {
  id: string;
  texto: string;
  sub: string;
  tipo: "recogido" | "en_camino" | "entregado";
}

export default function AppNavbar() {
  const [location, setLocation] = useWouterLocation();
  const [userData, setUserData] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);

  const [notificaciones, setNotificaciones] = useState<Notif[]>([]);
  const [notifVistas, setNotifVistas] = useState<Set<string>>(new Set());
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const loadAppData = () => {
    const stored = localStorage.getItem("usuario");
    if (stored) {
      try { setUserData(JSON.parse(stored)); } catch { setUserData(null); }
    } else { setUserData(null); }
  };

  const cargarNotificaciones = async () => {
    const stored = localStorage.getItem("usuario");
    if (!stored) return;
    let user: any;
    try { user = JSON.parse(stored); } catch { return; }
    if (user?.role !== "user") return;

    try {
      const res = await fetch(`${API_BASE}/api/pedidos/usuario/${user.id}`);
      if (!res.ok) return;
      const pedidos: any[] = await res.json();

      const nuevas: Notif[] = [];
      for (const p of pedidos) {
        const est = (p.estado || "").toLowerCase();
        const prod = p.nombre_producto || "tu pedido";
        if (est === "recogido") {
          nuevas.push({
            id: `${p.id}-recogido`,
            texto: `¡Tu pedido está en camino! 🛵`,
            sub: `${prod} — llega en ~30 min`,
            tipo: "recogido",
          });
        } else if (est === "en_camino") {
          nuevas.push({
            id: `${p.id}-en_camino`,
            texto: "Repartidor asignado a tu pedido",
            sub: `${prod} — recogiendo en el comercio`,
            tipo: "en_camino",
          });
        } else if (est === "entregado" || est === "completado") {
          nuevas.push({
            id: `${p.id}-entregado`,
            texto: "¡Pedido entregado con éxito! ✅",
            sub: prod,
            tipo: "entregado",
          });
        }
      }
      setNotificaciones(nuevas);
    } catch { /* skip */ }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    loadAppData();
    window.addEventListener("storage", loadAppData);

    const vistasRaw = localStorage.getItem("notif_vistas");
    if (vistasRaw) {
      try { setNotifVistas(new Set(JSON.parse(vistasRaw))); } catch { /* skip */ }
    }

    cargarNotificaciones();
    const interval = setInterval(cargarNotificaciones, 30000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("storage", loadAppData);
      clearInterval(interval);
    };
  }, []);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    if (!showNotif) return;
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showNotif]);

  const noLeidas = notificaciones.filter(n => !notifVistas.has(n.id)).length;

  const abrirNotif = () => {
    if (!showNotif) {
      // Marcar todas como vistas al abrir
      const nuevasVistas = new Set([...notifVistas, ...notificaciones.map(n => n.id)]);
      setNotifVistas(nuevasVistas);
      localStorage.setItem("notif_vistas", JSON.stringify([...nuevasVistas]));
    }
    setShowNotif(prev => !prev);
  };

  const isVendor = userData?.role === "vendor";
  const isRepartidor = userData?.role === "driver" || userData?.role === "repartidor";
  const isUser = userData?.role === "user";
  const userName = userData?.nombre || "Usuario";
  const homeHref = isVendor ? "/aliado" : isRepartidor ? "/repartidor" : "/catalog";

  const notifIcon = (tipo: Notif["tipo"]) => {
    if (tipo === "recogido") return <Truck size={14} className="text-amber-500 shrink-0" />;
    if (tipo === "en_camino") return <Package size={14} className="text-blue-500 shrink-0" />;
    return <CheckCircle2 size={14} className="text-green-600 shrink-0" />;
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-white/95 backdrop-blur-xl shadow-sm py-3 border-b border-slate-100" : "bg-white py-4"
    }`}>
      <div className="container mx-auto px-6 flex items-center justify-between">

        {/* LOGO */}
        <Link href={homeHref}>
          <div className="flex items-center gap-2.5 cursor-pointer">
            <img src="/logo.png" alt="Logo" className="w-9 h-9 object-contain" />
            <div className="flex flex-col">
              <span className="text-lg font-black text-slate-900 tracking-tight">
                Aprovech<span className="text-green-600">App</span>
              </span>
              {isVendor && <span className="text-[9px] font-bold text-slate-400 tracking-wider leading-none">BUSINESS PARTNER</span>}
              {isRepartidor && <span className="text-[9px] font-bold text-blue-500 tracking-wider leading-none">REPARTIDOR</span>}
            </div>
          </div>
        </Link>

        {/* MENÚ CENTRAL */}
        <div className="hidden md:flex items-center gap-1">
          {isRepartidor ? (
            <Link href="/repartidor">
              <a className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                location === "/repartidor" ? "bg-green-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}>Entregas</a>
            </Link>
          ) : (
            <>
              <Link href={isVendor ? "/aliado" : "/catalog"}>
                <a className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  location === (isVendor ? "/aliado" : "/catalog") ? "bg-green-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-800"
                }`}>{isVendor ? "Panel" : "Explorar"}</a>
              </Link>
              <Link href={isVendor ? "/pedidos-recibir" : "/mis-rescates"}>
                <a className={`px-5 py-2 rounded-full text-sm font-semibold transition-all border ${
                  location.includes("pedidos") || location.includes("rescates")
                  ? "bg-white text-slate-800 border-slate-200 shadow-sm"
                  : "text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}>{isVendor ? "Ventas" : "Rescates"}</a>
              </Link>
            </>
          )}
        </div>

        {/* BELL + PERFIL */}
        <div className="flex items-center gap-2">

          {/* Campanita — solo para usuarios rescatistas */}
          {isUser && (
            <div className="relative" ref={notifRef}>
              <button
                onClick={abrirNotif}
                className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100"
              >
                <Bell size={19} />
                {noLeidas > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 rounded-full border-2 border-white text-[8px] text-white font-black flex items-center justify-center px-0.5">
                    {noLeidas > 9 ? "9+" : noLeidas}
                  </span>
                )}
              </button>

              {/* Dropdown de notificaciones */}
              {showNotif && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[200] overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-900">Notificaciones</h3>
                    {notificaciones.length > 0 && (
                      <span className="text-[10px] text-slate-400 font-semibold bg-slate-100 px-2 py-0.5 rounded-full">
                        {notificaciones.length}
                      </span>
                    )}
                  </div>

                  {notificaciones.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <Bell className="w-7 h-7 text-slate-200 mx-auto mb-2" />
                      <p className="text-xs text-slate-400 font-semibold">Sin notificaciones activas</p>
                      <p className="text-[10px] text-slate-300 mt-0.5">Tus pedidos en curso aparecerán aquí</p>
                    </div>
                  ) : (
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                      {notificaciones.map(notif => (
                        <button
                          key={notif.id}
                          onClick={() => { setShowNotif(false); setLocation("/mis-rescates"); }}
                          className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-start gap-3"
                        >
                          <div className="mt-0.5">{notifIcon(notif.tipo)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 leading-snug">{notif.texto}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5 truncate">{notif.sub}</p>
                          </div>
                          <span className="text-[9px] text-green-600 font-black shrink-0 mt-0.5">Ver →</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50">
                    <button
                      onClick={() => { setShowNotif(false); setLocation("/mis-rescates"); }}
                      className="text-[10px] text-green-600 font-black w-full text-center hover:text-green-700 transition-colors"
                    >
                      Ver todos mis rescates →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Campanita decorativa para vendedores/repartidores (sin lógica) */}
          {!isUser && (
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100">
              <Bell size={19} />
            </button>
          )}

          {/* Dropdown de perfil */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 w-9 rounded-full p-0 overflow-hidden hover:bg-transparent">
                <Avatar className="h-full w-full rounded-full">
                  <AvatarFallback className={`text-white text-[11px] font-black w-full h-full flex items-center justify-center ${isRepartidor ? "bg-blue-600" : "bg-green-600"}`}>
                    {isRepartidor ? <Bike className="w-4 h-4" /> : userName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-60 p-2 rounded-2xl bg-white border border-slate-100 shadow-xl z-[100]">
              <DropdownMenuLabel className="p-3 bg-slate-50 rounded-xl mb-1.5">
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider leading-none mb-1">
                  {isVendor ? "Comercio Aliado" : isRepartidor ? "Repartidor" : "Usuario"}
                </p>
                <p className="text-sm font-bold text-slate-900 truncate">{userName}</p>
              </DropdownMenuLabel>

              <DropdownMenuSeparator className="bg-slate-100 mx-1" />

              {!isRepartidor && (
                <Link href={isVendor ? "/perfil-aliado" : "/perfil"}>
                  <DropdownMenuItem className="cursor-pointer rounded-lg font-semibold py-2.5 text-slate-600 focus:bg-green-50 focus:text-green-700 transition-colors gap-2">
                    <User className="h-4 w-4" /> Mi Cuenta
                  </DropdownMenuItem>
                </Link>
              )}

              <DropdownMenuItem
                onClick={() => { localStorage.clear(); window.location.href = "/"; }}
                className="text-red-500 font-semibold rounded-lg py-2.5 cursor-pointer focus:bg-red-50 focus:text-red-600 transition-colors gap-2"
              >
                <LogOut className="h-4 w-4" /> Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
