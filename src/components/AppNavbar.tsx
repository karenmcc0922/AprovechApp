import { useState, useEffect } from "react";
import { Link, useLocation as useWouterLocation } from "wouter";
import { User, LogOut, Bike, Bell } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function AppNavbar() {
  const [location] = useWouterLocation();
  const [userData, setUserData] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);

  const loadAppData = () => {
    const stored = localStorage.getItem("usuario");
    if (stored) {
      try { setUserData(JSON.parse(stored)); } catch (e) { console.error(e); }
    } else { setUserData(null); }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    loadAppData();
    window.addEventListener('storage', loadAppData);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener('storage', loadAppData);
    };
  }, []);

  const isVendor = userData?.role === "vendor";
  const isRepartidor = userData?.role === "driver" || userData?.role === "repartidor";
  const userName = userData?.nombre || "Usuario";

  const homeHref = isVendor ? "/aliado" : isRepartidor ? "/repartidor" : "/catalog";

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
              {isVendor && (
                <span className="text-[9px] font-bold text-slate-400 tracking-wider leading-none">
                  BUSINESS PARTNER
                </span>
              )}
              {isRepartidor && (
                <span className="text-[9px] font-bold text-blue-500 tracking-wider leading-none">
                  REPARTIDOR
                </span>
              )}
            </div>
          </div>
        </Link>

        {/* MENÚ CENTRAL */}
        <div className="hidden md:flex items-center gap-1">
          {isRepartidor ? (
            <Link href="/repartidor">
              <a className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                location === "/repartidor"
                ? "bg-green-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800"
              }`}>
                Entregas
              </a>
            </Link>
          ) : (
            <>
              <Link href={isVendor ? "/aliado" : "/catalog"}>
                <a className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  location === (isVendor ? "/aliado" : "/catalog")
                  ? "bg-green-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-800"
                }`}>
                  {isVendor ? "Panel" : "Explorar"}
                </a>
              </Link>
              <Link href={isVendor ? "/pedidos-recibir" : "/mis-rescates"}>
                <a className={`px-5 py-2 rounded-full text-sm font-semibold transition-all border ${
                  location.includes("pedidos") || location.includes("rescates")
                  ? "bg-white text-slate-800 border-slate-200 shadow-sm"
                  : "text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}>
                  {isVendor ? "Ventas" : "Rescates"}
                </a>
              </Link>
            </>
          )}
        </div>

        {/* PERFIL + BELL */}
        <div className="flex items-center gap-2">
          <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100">
            <Bell size={19} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-9 w-9 rounded-full p-0 overflow-hidden hover:bg-transparent"
              >
                <Avatar className="h-full w-full rounded-full">
                  <AvatarFallback className={`text-white text-[11px] font-black w-full h-full flex items-center justify-center ${isRepartidor ? 'bg-blue-600' : isVendor ? 'bg-green-600' : 'bg-green-600'}`}>
                    {isRepartidor ? <Bike className="w-4 h-4" /> : userName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-60 p-2 rounded-2xl bg-white border border-slate-100 shadow-xl z-[100]"
            >
              <DropdownMenuLabel className="p-3 bg-slate-50 rounded-xl mb-1.5">
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider leading-none mb-1">
                  {isVendor ? "Comercio Aliado" : isRepartidor ? "Repartidor" : "Usuario"}
                </p>
                <p className="text-sm font-bold text-slate-900 truncate">
                  {userName}
                </p>
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
