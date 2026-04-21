import { useState, useEffect } from "react";
import { Link } from "wouter";
import { 
  User, 
  LogOut, 
  Search
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function AppNavbar() {
  const [pendientesCount, setPendientesCount] = useState(0);
  const [userData, setUserData] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Efecto de scroll para la sombra
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    const loadAppData = () => {
      const stored = localStorage.getItem("usuario");
      if (stored) {
        try {
          const user = JSON.parse(stored);
          setUserData(user);
          const guardados = JSON.parse(localStorage.getItem("historial_rescates") || "[]");
          
          const count = guardados.filter((r: any) => 
            (user.role === "vendor" ? r.aliado_id === user.id : r.usuario_id === user.id) 
            && r.estado === "Pendiente"
          ).length;
          
          setPendientesCount(count);
        } catch (e) {
          console.error("Error al procesar datos del usuario", e);
        }
      }
    };

    loadAppData();
    window.addEventListener('storage', loadAppData);
    const interval = setInterval(loadAppData, 5000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', loadAppData);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const isVendor = userData?.role === "vendor";
  const userName = userData?.nombre || "Usuario";

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? "bg-white/90 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] py-3" 
        : "bg-transparent py-5"
    }`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        
        {/* LOGO DINÁMICO */}
        <Link href={isVendor ? "/aliado" : "/catalog"}>
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-300" 
              />
              {pendientesCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-[1000] text-slate-900 tracking-tighter leading-none uppercase italic">
                Aprovech<span className="text-green-600">App</span>
              </span>
              {isVendor && (
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-green-600 leading-none mt-1">
                  Business Partner
                </span>
              )}
            </div>
          </div>
        </Link>

        {/* NAVEGACIÓN CENTRAL (Desktop) */}
        <div className="hidden md:flex items-center bg-slate-100/50 p-1.5 rounded-full border border-slate-200/50">
          <Link href={isVendor ? "/aliado" : "/catalog"}>
            <a className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
              window.location.pathname === (isVendor ? "/aliado" : "/catalog")
                ? "bg-white text-green-600 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}>
              {isVendor ? "Dashboard" : "Explorar"}
            </a>
          </Link>
          <Link href={isVendor ? "/pedidos-recibir" : "/mis-rescates"}>
            <a className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all relative ${
              window.location.pathname.includes("rescates") || window.location.pathname.includes("pedidos")
                ? "bg-white text-green-600 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}>
              {isVendor ? "Pedidos" : "Mis Rescates"}
              {pendientesCount > 0 && (
                <span className="absolute top-1 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-white"></span>
              )}
            </a>
          </Link>
        </div>

        {/* ACCIONES DERECHA */}
        <div className="flex items-center gap-3">
          
          <button className="hidden sm:flex p-2.5 text-slate-400 hover:text-green-600 transition-colors">
            <Search className="w-5 h-5" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative group p-0 h-10 w-10 rounded-full border-2 border-white shadow-md ring-1 ring-slate-200 overflow-hidden">
                <Avatar className="h-full w-full">
                  <AvatarFallback className="bg-gradient-to-br from-slate-800 to-slate-900 text-white text-[10px] font-bold">
                    {userName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-72 p-3 rounded-[24px] shadow-2xl border-slate-100 mt-2">
              <DropdownMenuLabel className="p-4 bg-slate-50 rounded-2xl mb-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center text-white font-black">
                    {userName.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter leading-none">Bienvenido</p>
                    <p className="text-sm font-black text-slate-900 uppercase truncate">{userName}</p>
                  </div>
                </div>
              </DropdownMenuLabel>
              
              <Link href={isVendor ? "/perfil-aliado" : "/perfil"}>
                <DropdownMenuItem className="cursor-pointer py-3 rounded-xl font-bold text-slate-600 focus:bg-green-50 focus:text-green-700 transition-all gap-3">
                  <User className="w-4 h-4" /> Configurar Cuenta
                </DropdownMenuItem>
              </Link>

              <DropdownMenuSeparator className="my-2" />
              
              <DropdownMenuItem 
                onClick={handleLogout} 
                className="text-red-600 font-bold py-3 rounded-xl cursor-pointer focus:bg-red-50 focus:text-red-700 transition-all gap-3"
              >
                <LogOut className="w-4 h-4" /> Finalizar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </nav>
  );
}