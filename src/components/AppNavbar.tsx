import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Store, User, LogOut, LayoutDashboard, ShoppingBag } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function AppNavbar() {
  const [, setLocation] = useLocation();
  const [pendientesCount, setPendientesCount] = useState(0);
  // Usamos un estado para el usuario para que React reaccione cuando cambie
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    // Función para cargar datos del usuario
    const loadUser = () => {
      const stored = localStorage.getItem("usuario");
      if (stored) {
        setUserData(JSON.parse(stored));
      }
    };

    loadUser();

    const checkRescates = () => {
      const stored = localStorage.getItem("usuario");
      const user = stored ? JSON.parse(stored) : {};
      const guardados = JSON.parse(localStorage.getItem("historial_rescates") || "[]");
      
      const isVendor = user.role === "vendor";
      
      if (isVendor) {
        const count = guardados.filter((r: any) => (r.aliado_id === user.id) && r.estado === "Pendiente").length;
        setPendientesCount(count);
      } else {
        const count = guardados.filter((r: any) => r.usuario_id === user.id && r.estado === "Pendiente").length;
        setPendientesCount(count);
      }
    };

    checkRescates();
    window.addEventListener('storage', loadUser); // Escuchar si se loguea en otra pestaña
    const interval = setInterval(checkRescates, 5000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', loadUser);
    };
  }, []);

  // Derivamos las variables del estado userData
  const isVendor = userData?.role === "vendor" || localStorage.getItem("user_role") === "vendor";
  const userName = userData?.nombre || "Usuario";

  const handleLogout = () => {
    localStorage.clear();
    setUserData(null);
    setLocation("/");
    // Forzamos recarga para limpiar cualquier estado residual
    window.location.href = "/";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href={isVendor ? "/aliado" : "/catalog"}>
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="bg-green-600 p-2 rounded-xl group-hover:rotate-12 transition-transform">
              <Store className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tighter">
              AprovechApp <span className="text-green-600 text-sm font-bold uppercase tracking-widest ml-1">{isVendor ? "Business" : ""}</span>
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6">
            {isVendor ? (
              <>
                <Link href="/aliado"><a className="text-sm font-bold text-slate-600 hover:text-green-600 flex items-center gap-2"><LayoutDashboard className="w-4 h-4" /> Mi Panel</a></Link>
                <Link href="/pedidos-recibir"><a className="relative text-sm font-bold text-slate-600 hover:text-green-600 flex items-center gap-2"><ShoppingBag className="w-4 h-4" /> Pedidos {pendientesCount > 0 && <span className="bg-orange-500 text-white text-[10px] px-1.5 rounded-full">{pendientesCount}</span>}</a></Link>
              </>
            ) : (
              <>
                <Link href="/catalog"><a className="text-sm font-bold text-slate-600 hover:text-green-600">Explorar</a></Link>
                <Link href="/mis-rescates"><a className="text-sm font-bold text-slate-600 hover:text-green-600">Mis Rescates {pendientesCount > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">{pendientesCount}</span>}</a></Link>
              </>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 w-10 rounded-full bg-slate-100 p-0 border border-slate-200">
                <User className="h-5 w-5 text-slate-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-bold text-slate-900">
                <p className="text-xs text-slate-400 font-normal">Conectado como:</p>
                {userName}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* Agregamos link al perfil que faltaba en tu captura */}
              <Link href={isVendor ? "/perfil-aliado" : "/perfil"}>
                <DropdownMenuItem className="cursor-pointer">Mi Perfil</DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 font-bold cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}