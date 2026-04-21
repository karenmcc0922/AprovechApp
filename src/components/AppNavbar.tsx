import { useState, useEffect } from "react";
import { Link, useLocation as useWouterLocation } from "wouter";
import { User, LogOut } from "lucide-react";
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
  const userName = userData?.nombre || "Usuario";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-white/95 backdrop-blur-xl shadow-md py-3" : "bg-white py-5"
    }`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        
        {/* LOGO */}
        <Link href={isVendor ? "/aliado" : "/catalog"}>
          <div className="flex items-center gap-3 cursor-pointer group">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
            <div className="flex flex-col">
              <span className="text-xl font-black text-slate-900 tracking-tighter uppercase italic">
                Aprovech<span className="text-green-600">App</span>
              </span>
              {isVendor && (
                <span className="text-[8px] font-bold text-green-600 tracking-widest leading-none mt-0.5">
                  BUSINESS PARTNER
                </span>
              )}
            </div>
          </div>
        </Link>

        {/* MENÚ CENTRAL */}
        <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-full border border-slate-200/50">
          <Link href={isVendor ? "/aliado" : "/catalog"}>
            <a className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
              location === (isVendor ? "/aliado" : "/catalog") 
              ? "bg-white text-green-600 shadow-sm" 
              : "text-slate-500 hover:text-slate-800"
            }`}>
              {isVendor ? "Panel" : "Explorar"}
            </a>
          </Link>
          <Link href={isVendor ? "/pedidos-recibir" : "/mis-rescates"}>
            <a className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
              location.includes("pedidos") || location.includes("rescates") 
              ? "bg-white text-green-600 shadow-sm" 
              : "text-slate-500 hover:text-slate-800"
            }`}>
              {isVendor ? "Ventas" : "Rescates"}
            </a>
          </Link>
        </div>

        {/* PERFIL - CORREGIDO (Sin transparencia y sin recortes) */}
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="h-10 w-10 rounded-full border-2 border-white shadow-md ring-1 ring-slate-200 p-0 overflow-hidden hover:bg-transparent"
              >
                <Avatar className="h-full w-full rounded-full">
                  <AvatarFallback className="bg-slate-900 text-white text-[10px] font-black w-full h-full flex items-center justify-center">
                    {userName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent 
              align="end" 
              className="w-64 p-2 rounded-[24px] bg-white border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.1)] z-[100]"
            >
              <DropdownMenuLabel className="p-4 bg-slate-50/80 rounded-2xl mb-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">
                  {isVendor ? "Comercio Aliado" : "Usuario"}
                </p>
                <p className="text-sm font-black text-slate-900 truncate uppercase tracking-tight">
                  {userName}
                </p>
              </DropdownMenuLabel>
              
              <DropdownMenuSeparator className="bg-slate-100 mx-2" />
              
              <Link href={isVendor ? "/perfil-aliado" : "/perfil"}>
                <DropdownMenuItem className="cursor-pointer rounded-xl font-bold py-3 text-slate-600 focus:bg-green-50 focus:text-green-700 transition-colors gap-2">
                  <User className="h-4 w-4" /> Mi Cuenta
                </DropdownMenuItem>
              </Link>
              
              <DropdownMenuItem 
                onClick={() => { localStorage.clear(); window.location.href="/"; }} 
                className="text-red-600 font-bold rounded-xl py-3 cursor-pointer focus:bg-red-50 focus:text-red-700 transition-colors gap-2"
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